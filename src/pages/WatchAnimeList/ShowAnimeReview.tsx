import React, { useState } from "react";
import { Grid, Hidden, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { AnimeReview } from "../../data/AnimeReview";
import ShowOneAnimeReview from "./ShowOneAnimeReview";

interface Props {
  reviewList: AnimeReview[],
  isPrivateMode: boolean
}

const useStyles = makeStyles((theme) => ({
  cell: {
    padding: '8px',
    fontSize: '14px'
  },
  rank: {
    width: '40px'
  },
  title: {
    minWidth: '250px'
  }
}));

const ShowAnimeReview: React.FC<Props> = ((props: Props)=>{
  const classes = useStyles();
  return (
    <TableContainer component={Paper}>
      <Table aria-label="">
        <TableHead>
          <TableRow>
            <TableCell className={`${classes.cell} ${classes.rank}`}></TableCell>
            <TableCell className={`${classes.cell} ${classes.rank}`}>順位</TableCell>
            <TableCell className={`${classes.cell} ${classes.rank}`}>RANK</TableCell>
            <TableCell className={`${classes.cell} ${classes.rank}`}>評価</TableCell>
            <Hidden xsDown>
              <TableCell className={`${classes.cell} ${classes.rank}`}>視聴時期</TableCell>
            </Hidden>
            <TableCell className={`${classes.cell} ${classes.title}`}>タイトル</TableCell>
            <Hidden mdDown>
              <TableCell className={`${classes.cell}`}>コメント</TableCell>
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
              />
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
});

export default ShowAnimeReview;
