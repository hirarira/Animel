import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

// Google Identity Services（GIS）によるサインイン基盤。
// ID トークンは SMA バックエンドの書き込み系 API（Bearer 認証）に使う。
// トークンは sessionStorage に保存し、有効期限内なら再読み込みしても復元する。

export interface GoogleAuth {
  idToken: string;
  email: string;
  /** 有効期限（Unix ミリ秒） */
  expiresAt: number;
}

interface AuthContextValue {
  auth: GoogleAuth | null;
  isSignedIn: boolean;
  /** GIS の credential レスポンスを受け取ってサインイン状態にする */
  handleCredential: (credential: string) => void;
  signOut: () => void;
  /** 401 が返ってきた時など、期限切れとしてローカルの認証状態を破棄する */
  expireSession: () => void;
  /** 許可外アカウントでのサインイン試行など、ユーザーへの通知文 */
  notice: string | null;
  clearNotice: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  auth: null,
  isSignedIn: false,
  handleCredential: () => {},
  signOut: () => {},
  expireSession: () => {},
  notice: null,
  clearNotice: () => {},
});

const STORAGE_KEY = 'animel.googleAuth';

// 管理機能を使える Google アカウント（サーバー側の ANIME_GOOGLE_ALLOWED_EMAIL と対）。
// ここでのチェックは表示・導線の制御用で、書き込みの最終的な拒否はサーバー側が行う。
const ALLOWED_EMAIL = (
  (import.meta.env.VITE_GOOGLE_ALLOWED_EMAIL as string | undefined) ?? 'hirarira617@gmail.com'
).toLowerCase();

function isAllowedEmail(email: string): boolean {
  return email.toLowerCase() === ALLOWED_EMAIL;
}

/** JWT の payload をデコードする（署名検証はサーバー側で行う前提） */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function loadStoredAuth(): GoogleAuth | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GoogleAuth;
    // 期限切れ（30秒の余裕を見る）なら復元しない
    if (!parsed.idToken || !parsed.expiresAt || parsed.expiresAt < Date.now() + 30_000) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    // 許可外アカウントの保存済みセッションは復元しない
    if (!parsed.email || !isAllowedEmail(parsed.email)) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<GoogleAuth | null>(() => loadStoredAuth());
  const [notice, setNotice] = useState<string | null>(null);

  const clearNotice = useCallback(() => setNotice(null), []);

  const handleCredential = useCallback((credential: string) => {
    const payload = decodeJwtPayload(credential);
    if (!payload) return;
    const email = typeof payload.email === 'string' ? payload.email : '';
    // 許可外のアカウントはサインイン状態にしない（サーバー側でも書き込みは拒否される）
    if (!isAllowedEmail(email)) {
      setNotice(`このGoogleアカウント（${email || 'メールアドレス不明'}）では管理機能を利用できません`);
      return;
    }
    const next: GoogleAuth = {
      idToken: credential,
      email,
      expiresAt: typeof payload.exp === 'number' ? payload.exp * 1000 : Date.now(),
    };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 保存できなくてもメモリ上の状態ではサインイン扱いにする
    }
    setNotice(null);
    setAuth(next);
  }, []);

  const clear = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setAuth(null);
  }, []);

  const signOut = useCallback(() => {
    // 次回以降の自動選択を止める
    window.google?.accounts?.id?.disableAutoSelect();
    clear();
  }, [clear]);

  const value = useMemo<AuthContextValue>(
    () => ({
      auth,
      isSignedIn: auth !== null,
      handleCredential,
      signOut,
      expireSession: clear,
      notice,
      clearNotice,
    }),
    [auth, handleCredential, signOut, clear, notice, clearNotice]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

/** GoogleSignInButton から最新の handleCredential を参照するためのフック */
export function useCredentialCallbackRef() {
  const { handleCredential } = useAuth();
  const ref = useRef(handleCredential);
  ref.current = handleCredential;
  return ref;
}
