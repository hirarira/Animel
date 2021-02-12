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
    padding: '0px',
    fontSize: '14px'
  },
  comment: {
    padding: '8px',
    fontSize: 'min(3vw ,16px)'
  },
  rank: {
    width: '40px'
  },
  leftCell: {
    width: '60px'
  }
}));

const ShowOneAnimeReview: React.FC<Props> = ((props: Props)=>{
  const classes = useStyles();
  const [showDetail, switchShowDetail] = useState<boolean>(false);
  const shoboiURL = `https://cal.syoboi.jp/tid/${props.review.tid}`;
  return (
    <>
      <TableRow style={{ backgroundColor: props.review.rank.color }}>
        <TableCell className={`${classes.cell} ${classes.rank}`}>
          <IconButton 
            aria-label="expand row"
            size="small"
            onClick={() => switchShowDetail(!showDetail) }
          >
            { showDetail ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon /> }
          </IconButton>
        </TableCell>
        <TableCell className={`${classes.cell} ${classes.rank}`}>{props.idx+1}</TableCell>
        <TableCell className={classes.cell}>{props.review.rank.name}</TableCell>
        <TableCell className={classes.cell}>{props.review.title}</TableCell>
        <TableCell className={classes.cell}>{props.review.rate}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.hiddenCell} colSpan={5}>
          <Collapse in={showDetail} timeout="auto" unmountOnExit>
            <TableContainer component={Paper}>
              <Table style={{ backgroundColor: props.review.rank.color, opacity: 0.8 }}>
                <TableBody>
                  <TableRow>
                    <TableCell className={`${classes.cell} ${classes.leftCell}`}>
                      視聴年度
                    </TableCell>
                    <TableCell className={classes.cell}>
                      {props.review.watchDate}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.cell}>
                    公式URL
                    </TableCell>
                    <TableCell className={classes.cell}>
                      <a href={props.review.publicURL}>{props.review.publicURL}</a>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.cell}>
                      しょぼいカレンダーURL
                    </TableCell>
                    <TableCell className={classes.cell}>
                      <a href={shoboiURL}>{shoboiURL}</a>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.cell}>
                      コメント
                    </TableCell>
                    <TableCell className={classes.comment}>
                      {props.review.comment}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
             </TableContainer>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
});

export default ShowOneAnimeReview;
