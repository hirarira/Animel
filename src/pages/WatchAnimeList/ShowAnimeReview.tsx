import React, { useState } from "react";
import { Grid, Hidden, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { AnimeReview } from "../../data/AnimeReview";
import ShowOneAnimeReview from "./ShowOneAnimeReview";

interface Props {
  reviewList: AnimeReview[],
  isPrivateMode: boolean,
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
            <Hidden xsDown>
              {props.getAllFlag &&
                <TableCell style={style.rank}>偏差値</TableCell>
              }
              <TableCell style={style.rank}>視聴時期</TableCell>
            </Hidden>
            <TableCell style={style.title}>タイトル</TableCell>
            <Hidden mdDown>
              <TableCell style={style.cell}>コメント</TableCell>
            </Hidden>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.reviewList.map((review, idx)=>{
            return (
              <ShowOneAnimeReview
                key={idx}
                idx={idx}
                review={review}
                isPrivateMode={props.isPrivateMode}
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
