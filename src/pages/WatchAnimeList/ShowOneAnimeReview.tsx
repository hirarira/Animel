import React, { useState } from "react";
import { Collapse, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import { AnimeReview } from "../../data/AnimeReview";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

interface Props {
  idx: number,
  review: AnimeReview,
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

// 旧 Hidden の置き換え（MUI v7以降で Hidden は削除された）
const hideBelowSm = { display: { xs: 'none', sm: 'table-cell' } } as const;
const hideBelowLg = { display: { xs: 'none', lg: 'table-cell' } } as const;
const showBelowLgRow = { display: { xs: 'table-row', lg: 'none' } } as const;

const ShowOneAnimeReview: React.FC<Props> = ((props: Props)=>{
  const [showDetail, switchShowDetail] = useState<boolean>(false);
  const shoboiURL = `https://cal.syoboi.jp/tid/${props.review.tid}`;
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
        {props.getAllFlag &&
          <TableCell style={style.cell} sx={hideBelowSm}>
            {props.review.deviation}
          </TableCell>
        }
        {/** 視聴時期 */}
        <TableCell style={style.watchDateCell} sx={hideBelowSm}>
          {props.review.watchDate}
        </TableCell>
        <TableCell style={style.cell}>
          {props.review.title}
        </TableCell>
        <TableCell style={style.cell} sx={hideBelowLg}>
          {props.review.comment}
        </TableCell>
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
                  {props.getAllFlag &&
                    <TableRow sx={showBelowLgRow}>
                      <TableCell style={style.cell}>
                        偏差値
                      </TableCell>
                      <TableCell style={style.comment}>
                        {props.review.deviation}
                      </TableCell>
                    </TableRow>
                  }
                  <TableRow sx={showBelowLgRow}>
                    <TableCell style={style.cell}>
                      コメント
                    </TableCell>
                    <TableCell style={style.comment}>
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
