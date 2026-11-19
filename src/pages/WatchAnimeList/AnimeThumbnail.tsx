import React, { useEffect, useState } from "react";
import { Box, SxProps, Theme } from '@mui/material';

interface Props {
  src?: string;
  sx?: SxProps<Theme>;
}

// サムネイル画像。読み込めた場合だけ表示し、無い・失敗した場合は何も出さない
// （サムネ未設定のアニメは従来どおりの見た目を保つ）。
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
      sx={{ display: loaded ? 'block' : 'none', objectFit: 'cover', ...props.sx }}
    />
  );
});

export default AnimeThumbnail;
