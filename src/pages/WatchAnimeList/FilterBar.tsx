import React from "react";
import {
  Box, Button, Chip, FormControl, InputAdornment, InputLabel, MenuItem, Paper, Select,
  Slider, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { rankList } from "./Index";

export type FilterMode = 'period' | 'rate' | 'all' | 'search';

interface Props {
  mode: FilterMode;
  onModeChange: (mode: FilterMode) => void;
  // 期間モード
  watchYear: string;
  watchSeason: string;
  onYearChange: (year: string) => void;
  onSeasonChange: (season: string) => void;
  // 評価モード（[low, high]）
  rateRange: [number, number];
  onRateRangeChange: (range: [number, number]) => void;
  onRateRangeCommit: (range: [number, number]) => void;
  onRankSelect: (range: [number, number]) => void;
  // タイトル検索（取得済みデータへの絞り込み）
  searchText: string;
  // サーバー検索の実行（search モードで Enter / ボタン押下時）
  onSearchSubmit: () => void;
  onSearchTextChange: (text: string) => void;
  resultCount: number;
  totalCount: number;
}

const seasons: { value: string; label: string }[] = [
  { value: '', label: '通年' },
  { value: '冬', label: '冬' },
  { value: '春', label: '春' },
  { value: '夏', label: '夏' },
  { value: '秋', label: '秋' },
];

const startYear = 2010;

// ランクの帯 [low, high] を返す（最上位ランクは上限100）
export const rankBand = (index: number): [number, number] => {
  const low = rankList[index].rank;
  const high = index === 0 ? 100 : rankList[index - 1].rank - 1;
  return [low, high];
};

const FilterBar: React.FC<Props> = ((props: Props) => {
  const currentYear = new Date().getFullYear();
  const yearList = Array.from({ length: currentYear - startYear + 1 }, (_, i) => String(currentYear - i));
  const [low, high] = props.rateRange;

  return (
    <Paper
      elevation={2}
      sx={{
        position: 'sticky',
        top: { xs: 56, sm: 64 },
        zIndex: (theme) => theme.zIndex.appBar - 1,
        margin: '10px',
        padding: '12px 16px',
        textAlign: 'left',
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={props.mode}
            onChange={(_, value: FilterMode | null) => {
              if (value) props.onModeChange(value);
            }}
            aria-label="絞り込みモード"
          >
            <ToggleButton value="period">期間</ToggleButton>
            <ToggleButton value="rate">評価</ToggleButton>
            <ToggleButton value="all">全件</ToggleButton>
            <ToggleButton value="search">検索</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            size="small"
            placeholder={props.mode === 'search' ? 'タイトルを検索（2文字以上）' : 'タイトルで絞り込み'}
            value={props.searchText}
            onChange={(e) => props.onSearchTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (props.mode === 'search' && e.key === 'Enter') props.onSearchSubmit();
            }}
            sx={{ flexGrow: 1, minWidth: '180px' }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {props.resultCount}件 / {props.totalCount}件
          </Typography>
        </Stack>

        {props.mode === 'period' && (
          <Stack direction="row" spacing={1.5} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: '110px' }}>
              <InputLabel id="filter-year-label">視聴年</InputLabel>
              <Select
                labelId="filter-year-label"
                label="視聴年"
                value={props.watchYear}
                onChange={(e) => props.onYearChange(e.target.value)}
              >
                {yearList.map((year) => (
                  <MenuItem key={year} value={year}>{year}年</MenuItem>
                ))}
              </Select>
            </FormControl>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={props.watchSeason}
              onChange={(_, value: string | null) => {
                if (value !== null) props.onSeasonChange(value);
              }}
              aria-label="季節"
            >
              {seasons.map((s) => (
                <ToggleButton key={s.label} value={s.value}>{s.label}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
        )}

        {props.mode === 'rate' && (
          <Stack spacing={1}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                評価 {low} 〜 {high}
              </Typography>
              <Slider
                value={[low, high]}
                min={0}
                max={100}
                step={1}
                valueLabelDisplay="auto"
                onChange={(_, value) => {
                  const range = value as [number, number];
                  props.onRateRangeChange([range[0], range[1]]);
                }}
                onChangeCommitted={(_, value) => {
                  const range = value as [number, number];
                  props.onRateRangeCommit([range[0], range[1]]);
                }}
                aria-label="評価の範囲"
              />
            </Stack>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {rankList.map((rank, idx) => {
                if (rank.rank <= 0) return null;
                const band = rankBand(idx);
                const selected = low === band[0] && high === band[1];
                return (
                  <Chip
                    key={rank.id}
                    size="small"
                    label={rank.name}
                    variant={selected ? 'filled' : 'outlined'}
                    color={selected ? 'primary' : 'default'}
                    onClick={() => props.onRankSelect(band)}
                    icon={
                      <span style={{
                        width: 10, height: 10, borderRadius: '50%',
                        backgroundColor: rank.color, border: '1px solid rgba(0,0,0,0.25)',
                        display: 'inline-block',
                      }} />
                    }
                  />
                );
              })}
            </Box>
          </Stack>
        )}

        {props.mode === 'all' && (
          <Typography variant="body2" color="text.secondary">
            全期間の全件を表示しています（偏差値つき）。
          </Typography>
        )}

        {props.mode === 'search' && (
          <Stack direction="row" spacing={1.5} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              全作品の中からタイトル部分一致で検索します。上の入力欄に2文字以上入れて、Enter かボタンで検索してください。
            </Typography>
            <Button variant="contained" size="small" onClick={props.onSearchSubmit}>
              検索する
            </Button>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
});

export default FilterBar;
