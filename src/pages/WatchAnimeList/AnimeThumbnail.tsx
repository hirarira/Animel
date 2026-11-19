import React, { useEffect, useState } from "react";
import { Box, SxProps, Theme } from '@mui/material';

interface Props {
  src?: string;
  sx?: SxProps<Theme>;
}

// サムネイル画像。読み込めた場合だけ表示し、無い・失敗した場合は何も出さない
// （サムネ未設定のアニメは従来どおりの見た目を保つ）。
// 注意：display:none + loading="lazy" だとブラウザが読み込み自体を開始しないため、
// 透明→不透明のフェードで「読み込めたら出す」を実現する。
const AnimeThumbnail: React.FC<Props> = ((props: Props) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [props.src]);

  if (!props.src || failed) {
    return null;
  }
  return (
    <Box
      component="img"
      src={props.src}
      alt=""
      loading="lazy"
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      sx={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.2s', objectFit: 'cover', ...props.sx }}
    />
  );
});

export default AnimeThumbnail;
