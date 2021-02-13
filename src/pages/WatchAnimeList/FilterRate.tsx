import React, { useState } from "react";
import { Button, FormControl, Grid, InputLabel, makeStyles, MenuItem, Select, Slider, Typography } from '@material-ui/core';
import { rankList } from "./Index";
import { Rank } from "../../data/AnimeReview";

interface Props {
  lowRate: number,
  highRate: number,
  setLowRate: React.Dispatch<React.SetStateAction<number>>,
  setHighRate: React.Dispatch<React.SetStateAction<number>>,
  getRate: () => Promise<void>
}

const useStyles = makeStyles((theme) => ({
  input: {
    width: "calc(100% - 40px)",
    marginLeft: '20px',
    marginRight: '20px'
  },
  selectRank: {
    width: "120px"
  }
}));

const FilterRate: React.FC<Props> = ((props: Props)=>{
  const [showInput, switchShowInput] = useState<boolean>(true);
  const [selectRank, switchSelectRank] = useState(0);
  const classes = useStyles();

  const selectSetRank = (e: any) => {
    const value = e.target.value;
    switchSelectRank(value);
    const targetRank: Rank = rankList[value];
    const upRank: Rank = rankList[value-1];
    const min = targetRank? targetRank.rank: 0;
    const max = upRank? upRank.rank - 1: 100;
    props.setHighRate(max);
    props.setLowRate(min);
  }

  return (
    <Grid container justify="center" alignItems="center">
      <Grid item xs={8}>
      評価から絞り込み
      </Grid>
      <Grid item xs={4}>
        <Button variant="contained" color="default" onClick={()=>{
          switchShowInput(!showInput);
        }}>
          {showInput? '隠す': '表示'}
        </Button>
      </Grid>
      { showInput &&
        <>
          <Grid item xs={5}>
            <Typography gutterBottom>
              上限評価：{props.highRate}
            </Typography>
          </Grid>
          <Grid item xs={7}>
            <Slider
              aria-labelledby="continuous-slider"
              valueLabelDisplay="auto"
              min={0}
              max={100}
              value={props.highRate}
              step={5}
              onChange={(e, value)=>{
                const setValue: number = Array.isArray(value)? value[0]: value;
                props.setHighRate(setValue);
                if(setValue < props.lowRate) {
                  props.setLowRate(setValue);
                }
              }}
              className={classes.input}
            />
          </Grid>
          <Grid item xs={5}>
            <Typography gutterBottom>
              下限評価：{props.lowRate}
            </Typography>
          </Grid>
          <Grid item xs={7}>
            <Slider
              aria-labelledby="continuous-slider"
              valueLabelDisplay="auto"
              min={0}
              max={100}
              value={props.lowRate}
              step={5}
              onChange={(e, value)=>{
                const setValue: number = Array.isArray(value)? value[0]: value;
                props.setLowRate(setValue);
                if(setValue > props.highRate) {
                  props.setHighRate(setValue);
                }
              }}
              className={classes.input}
            />
          </Grid>
          <Grid item xs={8}>
            <FormControl className={classes.selectRank}>
              <InputLabel id="demo-simple-select-label">ランクより選択</InputLabel>
              <Select
                labelId="selectRank"
                value={selectRank}
                onChange={selectSetRank}
              >
                {rankList.map((rank: Rank, idx: number)=>{
                  if(rank.rank <= 0) {
                    return null;
                  }
                  return (
                    <MenuItem key={idx} value={rank.id}>{rank.name}</MenuItem>
                  )
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <Button variant="contained" color="primary" onClick={()=>{
              props.getRate();
            }}>
              絞り込み
          </Button>
          </Grid>
        </>
      }
    </Grid>
  )
});

export default FilterRate;
