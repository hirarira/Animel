import React, { useEffect, useRef, useState } from 'react';
import { Button, useColorScheme } from '@mui/material';
import { useCredentialCallbackRef } from './AuthContext';

// GIS スクリプトの読み込みと初期化はアプリ全体で1回だけ行う
let gisLoadPromise: Promise<void> | null = null;
let gisInitialized = false;

function loadGisScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gisLoadPromise) return gisLoadPromise;
  gisLoadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gisLoadPromise = null;
      reject(new Error('Google サインイン用スクリプトの読み込みに失敗しました'));
    };
    document.head.appendChild(script);
  });
  return gisLoadPromise;
}

/**
 * Google サインインボタン。
 * GIS の公式ボタンを描画する。スクリプトが読み込めない環境では
 * フォールバックの MUI ボタン（One Tap の prompt を試みる）を表示する。
 */
const GoogleSignInButton: React.FC = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const buttonRef = useRef<HTMLDivElement>(null);
  const credentialCallbackRef = useCredentialCallbackRef();
  const [gisReady, setGisReady] = useState(false);
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = mode === 'system' ? systemMode : mode;
  const isDark = resolvedMode === 'dark';

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    loadGisScript()
      .then(() => {
        if (cancelled || !window.google) return;
        if (!gisInitialized) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => credentialCallbackRef.current(response.credential),
            auto_select: false,
          });
          gisInitialized = true;
        }
        if (buttonRef.current) {
          buttonRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: isDark ? 'filled_black' : 'outline',
            size: 'medium',
            text: 'signin',
            shape: 'rectangular',
          });
          setGisReady(true);
        }
      })
      .catch(() => {
        // 読み込み失敗時はフォールバック表示のまま
      });
    return () => {
      cancelled = true;
    };
    // isDark が変わったらボタンを描き直す（テーマ追従）
  }, [clientId, credentialCallbackRef, isDark]);

  if (!clientId) return null;

  return (
    <>
      <div ref={buttonRef} style={{ display: gisReady ? 'block' : 'none' }} />
      {!gisReady && (
        <Button
          color="inherit"
          variant="outlined"
          size="small"
          sx={{ textTransform: 'none' }}
          onClick={() => {
            loadGisScript()
              .then(() => window.google?.accounts.id.prompt())
              .catch(() => {});
          }}
        >
          Googleでサインイン
        </Button>
      )}
    </>
  );
};

export default GoogleSignInButton;
