import React, { useState } from "react";
import { Button, Grid, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { AnimeReview } from "../../data/AnimeReview";

interface Props {
  idx: number,
  review: AnimeReview
}

const useStyles = makeStyles((theme) => ({
  cell: {
    padding: '8px',
    fontSize: '14px'
  },
  button: {
    padding: '4px'
  }
}));

const ShowOneAnimeReview: React.FC<Props> = ((props: Props)=>{
  const classes = useStyles();
  const [showDetail, switchShowDetail] = useState<boolean>(false);
  return (
    <>
      <TableRow>
        <TableCell className={classes.cell}>{props.idx+1}</TableCell>
        <TableCell className={classes.cell}>{props.review.rate}</TableCell>
        <TableCell className={classes.cell}>{props.review.title}</TableCell>
        <TableCell className={classes.cell}>{props.review.rate}</TableCell>
        <TableCell className={classes.cell}>
          <Button variant="contained" color="default" className={classes.button} onClick={()=>{
            switchShowDetail(!showDetail);
          }}>
            詳細
          </Button>
        </TableCell>
      </TableRow>
      {showDetail &&
        <TableRow>
          <TableCell className={classes.cell}>
            hoge
          </TableCell>
        </TableRow>
      }
    </>
  )
});

export default ShowOneAnimeReview;
