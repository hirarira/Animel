import React, { useState } from "react";
import { Button, FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';

interface Props {
  watchYear: string,
  watchSeason: string,
  setWatchYear: React.Dispatch<React.SetStateAction<string>>,
  setWatchSeason: React.Dispatch<React.SetStateAction<string>>,
  getWatchDate: () => Promise<void>
}

const style = {
  section: {
    marginBottom: '10px'
  },
  input: {
    width: "100px"
  },
  inputSeason: {
    width: '50px'
  }
};

const FilterWatchYear: React.FC<Props> = ((props: Props)=>{
  const [showInput, switchShowInput] = useState<boolean>(true);
  const handleChangeYear = (event: any) => {
    props.setWatchYear(event.target.value);
  }
  const handleChangeSeason = (event: any) => {
    props.setWatchSeason(event.target.value);
  }
  const startYear = 2010;
  const endYear = 2025;
  const yearNum = endYear-startYear+1;
  const yearList = [...Array(yearNum)].map((a,x)=>{return startYear+x;});
  const seasonList = ['', '冬', '春', '夏', '秋'];

  return (
    <Grid container style={style.section} sx={{ justifyContent: "center", alignItems: "center" }}>
      <Grid size={8}>
        視聴年度から絞り込み
      </Grid>
      <Grid size={4}>
        <Button variant="contained" color="primary" onClick={()=>{
          switchShowInput(!showInput);
        }}>
          {showInput? '隠す': '表示'}
        </Button>
      </Grid>
      { showInput &&
        <>
        <Grid size={4}>
          <FormControl style={style.input}>
            <InputLabel shrink id="demo-simple-select-label">視聴年</InputLabel>
            <Select
              value={props.watchYear}
              onChange={handleChangeYear}
            >
              { yearList.map((year, idx)=>{
                return (
                  <MenuItem key={idx} value={year}>{year}</MenuItem>
                )
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={4}>
          <FormControl style={style.inputSeason}>
            <InputLabel shrink id="demo-simple-select-label">季節</InputLabel>
            <Select
              value={props.watchSeason}
              onChange={handleChangeSeason}
            >
              { seasonList.map((season, idx)=>{
                return (
                  <MenuItem key={idx} value={season}>{season}</MenuItem>
                )
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={4}>
          <Button variant="contained" color="primary" onClick={()=>{
            props.getWatchDate();
          }}>
            絞り込み
          </Button>
        </Grid>
        </>
      }
    </Grid>
  )
});

export default FilterWatchYear;
