import React, { useState } from "react";
import { Button, Collapse, Grid, IconButton, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { AnimeReview } from "../../data/AnimeReview";
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

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
  },
  hiddenCell: {
    paddingBottom: '0px',
    paddingTop: '0px',
    fontSize: '14px'
  },
  comment: {
    padding: '10px',
    fontSize: '12px'
  }
}));

const ShowOneAnimeReview: React.FC<Props> = ((props: Props)=>{
  const classes = useStyles();
  const [showDetail, switchShowDetail] = useState<boolean>(false);
  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => switchShowDetail(!showDetail) }>
            {showDetail ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell className={classes.cell}>{props.idx+1}</TableCell>
        <TableCell className={classes.cell}>{props.review.rate}</TableCell>
        <TableCell className={classes.cell}>{props.review.title}</TableCell>
        <TableCell className={classes.cell}>{props.review.rate}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.hiddenCell} colSpan={5}>
          <Collapse in={showDetail} timeout="auto" unmountOnExit>
            <Grid container justify="center" alignItems="center">
              <Grid item xs={2}>
                コメント
              </Grid>
              <Grid item xs={10} className={classes.comment}>
                {props.review.comment}
              </Grid>
            </Grid>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
});

export default ShowOneAnimeReview;
