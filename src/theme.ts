import { createTheme } from '@mui/material/styles';

// Phase 2: テーマを一元化する。
// CSS変数 + colorSchemes でライト/ダークを切り替える（再レンダリングなしで反映される）。
const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#3d5a99' },
        secondary: { main: '#c2185b' },
        background: { default: '#f6f7f9', paper: '#ffffff' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#9db8e8' },
        secondary: { main: '#f48fb1' },
        background: { default: '#121417', paper: '#1d2025' },
      },
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

export default theme;
