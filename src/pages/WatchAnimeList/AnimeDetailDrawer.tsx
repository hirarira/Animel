import React from "react";
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Chip, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { AnimeReview } from "../../data/AnimeReview";
import AnimeThumbnail from "./AnimeThumbnail";
import { resolveThumbnailUrl, ThumbnailMap } from "./thumbnail";

interface Props {
  review: AnimeReview | null;
  onClose: () => void;
  thumbnails: ThumbnailMap;
}

const AnimeDetailDrawer: React.FC<Props> = ((props: Props) => {
  const review = props.review;
  const shoboiURL = review ? `https://cal.syoboi.jp/tid/${review.tid}` : '';
  // 既読管理ページ（Basic認証あり）。URLは環境変数 VITE_MANAGEMENT_URL で差し替え可能
  const managementBase = import.meta.env.VITE_MANAGEMENT_URL
    ?? 'https://pollux.hirarira.net/showMinogashiAnime/showAnimeStoryList.html';
  const managementURL = review ? `${managementBase}?tid=${review.tid}` : '';
  return (
    <Drawer anchor="right" open={review !== null} onClose={props.onClose}>
      <Box sx={{ width: { xs: '90vw', sm: 400 }, padding: '20px', textAlign: 'left' }} role="presentation">
        {review && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Typography variant="h6" component="div" sx={{ lineHeight: 1.4 }}>
                {review.title}
              </Typography>
              <IconButton aria-label="閉じる" onClick={props.onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>

            <AnimeThumbnail
              src={resolveThumbnailUrl(review, props.thumbnails)}
              sx={{ width: '100%', aspectRatio: '16 / 9', borderRadius: 1 }}
            />

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
              <Chip
                size="small"
                label={review.rank.name}
                sx={{ backgroundColor: review.rank.color, color: '#212121' }}
              />
              <Typography variant="body1">
                評価：{review.rate > 0 ? review.rate : '未評価'}
              </Typography>
              {review.deviation !== undefined && review.rate > 0 && (
                <Typography variant="body2" color="text.secondary">
                  偏差値：{review.deviation}
                </Typography>
              )}
            </Stack>

            <Divider />

            <Box>
              <Typography variant="caption" color="text.secondary">視聴時期</Typography>
              <Typography variant="body2">{review.watchDate}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">コメント</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {review.comment ? review.comment : '（コメントなし）'}
              </Typography>
            </Box>

            <Divider />

            <Stack spacing={1}>
              {review.publicURL && (
                <Button
                  variant="outlined"
                  href={review.publicURL}
                  target="_blank"
                  rel="noreferrer"
                  endIcon={<OpenInNewIcon />}
                >
                  公式サイト
                </Button>
              )}
              <Button
                variant="outlined"
                href={shoboiURL}
                target="_blank"
                rel="noreferrer"
                endIcon={<OpenInNewIcon />}
              >
                しょぼいカレンダー
              </Button>
              {/* Animel 内の既読管理ページ（パイロット）。従来の SMA ページと並行運用する */}
              <Button
                variant="contained"
                component={RouterLink}
                to={review ? `/story/${review.tid}` : '/'}
                onClick={props.onClose}
              >
                既読管理（Animel内）
              </Button>
              <Button
                variant="outlined"
                href={managementURL}
                target="_blank"
                rel="noreferrer"
                endIcon={<OpenInNewIcon />}
              >
                既読管理
              </Button>
            </Stack>
          </Stack>
        )}
      </Box>
    </Drawer>
  );
});

export default AnimeDetailDrawer;
