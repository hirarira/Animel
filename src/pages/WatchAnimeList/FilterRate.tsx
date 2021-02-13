import React, { useState } from "react";
import { Button, FormControl, Grid, InputLabel, makeStyles, MenuItem, Select, Slider, Typography } from '@material-ui/core';

interface Props {
  lowRate: number,
  highRate: number,
  setLowRate: React.Dispatch<React.SetStateAction<number>>,
  setHighRate: React.Dispatch<React.SetStateAction<number>>,
  getRate: () => Promise<void>
}

const useStyles = makeStyles((theme) => ({
  section: {
    width: 'calc(100% - 20px)',
    boxShadow: '0 10px 10px 0 rgba(0, 0, 0, 0.5)',
    padding: '10px',
    margin: '10px'
  },
  input: {
    width: "calc(100% - 40px)",
    marginLeft: '20px',
    marginRight: '20px'
  }
}));

const FilterRate: React.FC<Props> = ((props: Props)=>{
  const [showInput, switchShowInput] = useState<boolean>(true);
  const classes = useStyles();
  /*
  const handleChangeYear = (event: any) => {
    props.setWatchYear(event.target.value);
  }
  const handleChangeSeason = (event: any) => {
    props.setWatchSeason(event.target.value);
  }
  */
  const startYear = 2010;
  const endYear = 2021;
  const yearNum = endYear-startYear+1;
  const yearList = [...Array(yearNum)].map((a,x)=>{return startYear+x;});
  const seasonList = ['', '冬', '春', '夏', '秋'];

  return (
    <Grid container justify="center" alignItems="center" className={classes.section}>
      <Grid item xs={8}>
        レートから絞り込み
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
          <Grid item xs={4}>
            <Typography gutterBottom>
              上限RANK
            </Typography>
          </Grid>
          <Grid item xs={8}>
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
          <Grid item xs={4}>
            <Typography gutterBottom>
              下限RANK
            </Typography>
          </Grid>
          <Grid item xs={8}>
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
          <Grid item xs={8}></Grid>
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
