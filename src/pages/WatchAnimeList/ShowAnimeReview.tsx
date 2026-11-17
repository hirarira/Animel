import React from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { AnimeReview } from "../../data/AnimeReview";
import ShowOneAnimeReview from "./ShowOneAnimeReview";

interface Props {
  reviewList: AnimeReview[],
  getAllFlag: boolean
}

const style = {
  cell: {
    padding: '8px',
    fontSize: '14px'
  },
  rank: {
    padding: '8px',
    fontSize: '14px',
    width: '40px'
  },
  title: {
    padding: '8px',
    fontSize: '14px',
    minWidth: '250px'
  }
};

// 旧 Hidden の置き換え（MUI v7以降で Hidden は削除された）
// xsDown: sm未満で非表示 / mdDown相当: lg未満で非表示
const hideBelowSm = { display: { xs: 'none', sm: 'table-cell' } } as const;
const hideBelowLg = { display: { xs: 'none', lg: 'table-cell' } } as const;

const ShowAnimeReview: React.FC<Props> = ((props: Props)=>{
  return (
    <TableContainer component={Paper}>
      <Table aria-label="">
        <TableHead>
          <TableRow>
            <TableCell style={style.rank}></TableCell>
            <TableCell style={style.rank}>順位</TableCell>
            <TableCell style={style.rank}>RANK</TableCell>
            <TableCell style={style.rank}>評価</TableCell>
            {props.getAllFlag &&
              <TableCell style={style.rank} sx={hideBelowSm}>偏差値</TableCell>
            }
            <TableCell style={style.rank} sx={hideBelowSm}>視聴時期</TableCell>
            <TableCell style={style.title}>タイトル</TableCell>
            <TableCell style={style.cell} sx={hideBelowLg}>コメント</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.reviewList.map((review, idx)=>{
            return (
              <ShowOneAnimeReview
                key={idx}
                idx={idx}
                review={review}
                getAllFlag={props.getAllFlag}
              />
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
});

export default ShowAnimeReview;
