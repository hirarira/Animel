import React, { useMemo } from "react";
import { Box, Chip, LinearProgress, Link, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { jaJP } from '@mui/x-data-grid/locales';
import { AnimeReview } from "../../data/AnimeReview";
import AnimeThumbnail from "./AnimeThumbnail";
import { getThumbnailUrl } from "./thumbnail";

interface Props {
  reviewList: AnimeReview[];
  getAllFlag: boolean;
  loading: boolean;
  onSelect: (review: AnimeReview) => void;
}

type Row = AnimeReview & { gridId: string; rowNumber: number };

const AnimeGrid: React.FC<Props> = ((props: Props) => {
  const rows: Row[] = useMemo(
    () => props.reviewList.map((review, idx) => ({ ...review, gridId: `${review.tid}-${idx}`, rowNumber: idx + 1 })),
    [props.reviewList]
  );

  const columns: GridColDef<Row>[] = [
    { field: 'rowNumber', headerName: '順位', width: 64, sortable: true },
    {
      field: 'thumbnail', headerName: '', width: 84, sortable: false, filterable: false,
      renderCell: (params) => (
        <AnimeThumbnail src={getThumbnailUrl(params.row)} sx={{ width: 64, height: 36, borderRadius: 0.5 }} />
      ),
    },
    {
      field: 'rank', headerName: 'RANK', width: 104, sortable: true,
      sortComparator: (a, b) => (a?.rank ?? 0) - (b?.rank ?? 0),
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.row.rank.name}
          sx={{ backgroundColor: params.row.rank.color, color: '#212121' }}
        />
      ),
    },
    {
      field: 'rate', headerName: '評価', width: 120, sortable: true,
      renderCell: (params) => (
        params.row.rate > 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', height: '100%' }}>
            <Typography variant="body2">{params.row.rate}</Typography>
            <LinearProgress
              variant="determinate"
              value={params.row.rate}
              sx={{ flexGrow: 1, height: 4, borderRadius: 2 }}
            />
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">未評価</Typography>
        )
      ),
    },
    {
      field: 'deviation', headerName: '偏差値', width: 84, sortable: true,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.rate > 0 && params.row.deviation !== undefined ? params.row.deviation : '—'}
        </Typography>
      ),
    },
    { field: 'watchDate', headerName: '視聴時期', width: 104, sortable: true },
    {
      field: 'title', headerName: 'タイトル', flex: 1, minWidth: 220, sortable: true,
      renderCell: (params) => (
        <Link
          href={`https://cal.syoboi.jp/tid/${params.row.tid}`}
          target="_blank"
          rel="noreferrer"
          underline="hover"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
        >
          {params.row.title}
        </Link>
      ),
    },
    { field: 'comment', headerName: 'コメント', flex: 1.4, minWidth: 240, sortable: false },
  ];

  return (
    <Box sx={{ height: '72vh', width: 'calc(100% - 20px)', margin: '0 10px' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.gridId}
        loading={props.loading}
        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
        columnVisibilityModel={{ deviation: props.getAllFlag }}
        initialState={{
          pagination: { paginationModel: { pageSize: 50, page: 0 } },
          sorting: { sortModel: [{ field: 'rate', sort: 'desc' }] },
        }}
        pageSizeOptions={[25, 50, 100]}
        disableRowSelectionOnClick
        onRowClick={(params) => props.onSelect(params.row)}
        sx={{ backgroundColor: 'background.paper', cursor: 'pointer' }}
      />
    </Box>
  );
});

export default AnimeGrid;
