import React, { useState } from "react";
import { Grid, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { AnimeReview } from "../../data/AnimeReview";

interface Props {
  reviewList: AnimeReview[]
}

const useStyles = makeStyles((theme) => ({
  cell: {
    padding: '8px',
    fontSize: '14px'
  },
  rank: {
    minWidth: '40px'
  }
}));

const ShowAnimeReview: React.FC<Props> = ((props: Props)=>{
  const classes = useStyles();
  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell className={`${classes.cell} ${classes.rank}`}>順位</TableCell>
            <TableCell className={`${classes.cell} ${classes.rank}`}>RANK</TableCell>
            <TableCell className={classes.cell}>タイトル</TableCell>
            <TableCell className={`${classes.cell} ${classes.rank}`}>評価</TableCell>
            <TableCell className={`${classes.cell} ${classes.rank}`}>詳細</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.reviewList.map((review, idx)=>{
            return (
              <TableRow key={idx}>
                <TableCell className={classes.cell}>{idx+1}</TableCell>
                <TableCell className={classes.cell}>{review.rate}</TableCell>
                <TableCell className={classes.cell}>{review.title}</TableCell>
                <TableCell className={classes.cell}>{review.rate}</TableCell>
                <TableCell className={classes.cell}>詳細</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
});

export default ShowAnimeReview;
