import React, { useState } from "react";
import { Button, Collapse, Grid, Hidden, IconButton, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { AnimeReview } from "../../data/AnimeReview";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { showMinogashiAnimeURL } from "./Index";

interface Props {
  idx: number,
  review: AnimeReview,
  isPrivateMode: boolean,
  getAllFlag: boolean
}

const style = {
  cell: {
    padding: '8px',
    fontSize: '14px'
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
    padding: '8px',
    fontSize: '14px',
    width: '40px'
  },
  leftCell: {
    padding: '8px',
    fontSize: '14px',
    width: '60px'
  },
  watchDateCell: {
    padding: '8px',
    fontSize: '14px',
    width: '80px'
  }
};

const ShowOneAnimeReview: React.FC<Props> = ((props: Props)=>{
  const [showDetail, switchShowDetail] = useState<boolean>(false);
  const shoboiURL = `https://cal.syoboi.jp/tid/${props.review.tid}`;
  const setAnimeTitle = () => {
    const animeTitle = props.review.title;
    if(props.isPrivateMode) {
      const url = `${showMinogashiAnimeURL}showAnimeStoryList.html?tid=${props.review.tid}`;
      return (
        <a href={url}>{animeTitle}</a>
      )
    }
    else {
      return animeTitle;
    }
  }
  const colSpan = props.getAllFlag? 8: 7;
  return (
    <>
      <TableRow style={{ backgroundColor: props.review.rank.color }}>
        <TableCell style={style.rank}>
          <IconButton 
            aria-label="expand row"
            size="small"
            onClick={() => switchShowDetail(!showDetail) }
          >
            { showDetail ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon /> }
          </IconButton>
        </TableCell>
        <TableCell style={style.rank}>{props.idx+1}</TableCell>
        <TableCell style={style.cell}>
          {props.review.rank.name}
        </TableCell>
        <TableCell style={style.cell}>
          {props.review.rate}
        </TableCell>
        <Hidden xsDown>
          {props.getAllFlag &&
            <TableCell style={style.cell}>
              {props.review.deviation}
            </TableCell>
          }
          {/** 視聴時期 */}
          <TableCell style={style.watchDateCell}>
            {props.review.watchDate}
          </TableCell>
        </Hidden>
        <TableCell style={style.cell}>
          {setAnimeTitle()}
        </TableCell>
        <Hidden mdDown>
          <TableCell style={style.cell}>
            {props.review.comment}
          </TableCell>
        </Hidden>
      </TableRow>
      <TableRow>
        <TableCell style={style.hiddenCell} colSpan={colSpan}>
          <Collapse in={showDetail} timeout="auto" unmountOnExit>
            <TableContainer component={Paper}>
              <Table style={{ backgroundColor: props.review.rank.color, opacity: 0.8 }}>
                <TableBody>
                  <TableRow>
                    <TableCell style={style.leftCell}>
                      視聴年度
                    </TableCell>
                    <TableCell style={style.cell}>
                      {props.review.watchDate}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={style.cell}>
                    公式URL
                    </TableCell>
                    <TableCell style={style.cell}>
                      <a href={props.review.publicURL}>{props.review.publicURL}</a>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={style.cell}>
                      しょぼいカレンダーURL
                    </TableCell>
                    <TableCell style={style.cell}>
                      <a href={shoboiURL}>{shoboiURL}</a>
                    </TableCell>
                  </TableRow>
                  <Hidden lgUp>
                    {props.getAllFlag &&
                      <TableRow>
                        <TableCell style={style.cell}>
                          偏差値
                        </TableCell>
                        <TableCell style={style.comment}>
                          {props.review.deviation}
                        </TableCell>
                      </TableRow>
                    }
                    <TableRow>
                      <TableCell style={style.cell}>
                        コメント
                      </TableCell>
                      <TableCell style={style.comment}>
                        {props.review.comment}
                      </TableCell>
                    </TableRow>
                  </Hidden>
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
