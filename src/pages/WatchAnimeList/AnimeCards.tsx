import React from "react";
import { Box, Card, CardActionArea, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { AnimeReview } from "../../data/AnimeReview";

interface Props {
  reviewList: AnimeReview[];
  onSelect: (review: AnimeReview) => void;
}

const AnimeCards: React.FC<Props> = ((props: Props) => {
  if (props.reviewList.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ margin: '24px' }}>
        該当するアニメがありません
      </Typography>
    );
  }
  return (
    <Grid container spacing={2} sx={{ padding: '0 10px', textAlign: 'left' }}>
      {props.reviewList.map((review, idx) => (
        <Grid key={`${review.tid}-${idx}`} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardActionArea onClick={() => props.onSelect(review)} sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      size="small"
                      label={review.rank.name}
                      sx={{ backgroundColor: review.rank.color, color: '#212121' }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {review.rate > 0 ? `評価 ${review.rate}` : '未評価'}
                      {review.deviation !== undefined && review.rate > 0 ? ` / 偏差値 ${review.deviation}` : ''}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" sx={{ lineHeight: 1.4 }}>
                    {review.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '3.6em',
                    }}
                  >
                    {review.comment}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {review.watchDate}
                  </Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
});

export default AnimeCards;
