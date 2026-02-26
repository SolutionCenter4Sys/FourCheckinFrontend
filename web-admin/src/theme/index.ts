import { createTheme, alpha } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    surface: { main: string; raised: string }
    border: { main: string }
    status: {
      presente: string
      ausente: string
      pendente: string
      agendada: string
    }
  }
  interface PaletteOptions {
    surface?: { main: string; raised: string }
    border?: { main: string }
    status?: {
      presente: string
      ausente: string
      pendente: string
      agendada: string
    }
  }
}

export const COLORS = {
  bg:          '#0C1021',
  surface:     '#161D2E',
  raised:      '#1E2A3A',
  border:      '#374155',
  orange:      '#FF6600',
  white:       '#FFFFFF',
  gray1:       '#E2E8F0',
  gray3:       '#94A3B8',
  gray4:       '#64748B',
  green:       '#4ADE80',
  amber:       '#FBBF24',
  red:         '#F87171',
  blue:        '#3B82F6',
  sidebarBg:   '#060B14',
} as const

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary:    { main: COLORS.orange, contrastText: '#fff' },
    secondary:  { main: COLORS.blue },
    error:      { main: COLORS.red },
    warning:    { main: COLORS.amber },
    success:    { main: COLORS.green },
    background: { default: COLORS.bg, paper: COLORS.surface },
    text:       { primary: COLORS.white, secondary: COLORS.gray3, disabled: COLORS.gray4 },
    divider:    COLORS.border,
    surface:    { main: COLORS.surface, raised: COLORS.raised },
    border:     { main: COLORS.border },
    status: {
      presente: COLORS.green,
      ausente:  COLORS.red,
      pendente: COLORS.amber,
      agendada: COLORS.blue,
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontSize: '2rem',    fontWeight: 800 },
    h2: { fontSize: '1.75rem', fontWeight: 700 },
    h3: { fontSize: '1.5rem',  fontWeight: 700 },
    h4: { fontSize: '1.25rem', fontWeight: 600 },
    h5: { fontSize: '1.125rem', fontWeight: 600 },
    h6: { fontSize: '1rem',    fontWeight: 600 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem',  color: COLORS.gray3 },
    caption: { fontSize: '0.75rem', color: COLORS.gray4 },
    overline: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', color: COLORS.gray4 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: COLORS.bg,
          scrollbarColor: `${COLORS.border} ${COLORS.bg}`,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: COLORS.bg },
          '&::-webkit-scrollbar-thumb': { background: COLORS.border, borderRadius: 3 },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12 },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 10, padding: '10px 20px' },
        containedPrimary: {
          background: COLORS.orange,
          '&:hover': { background: '#e55a00' },
        },
        outlinedPrimary: {
          borderColor: COLORS.orange,
          color: COLORS.orange,
          '&:hover': { backgroundColor: alpha(COLORS.orange, 0.1) },
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: COLORS.raised,
            '& fieldset': { borderColor: COLORS.border },
            '&:hover fieldset': { borderColor: COLORS.gray3 },
            '&.Mui-focused fieldset': { borderColor: COLORS.orange },
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': { color: COLORS.orange },
          '&.Mui-checked + .MuiSwitch-track': { backgroundColor: COLORS.orange },
        },
        track: { backgroundColor: COLORS.border },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 20, fontWeight: 500 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${COLORS.border}`, padding: '10px 16px' },
        head: {
          backgroundColor: COLORS.raised,
          fontWeight: 600,
          fontSize: '0.8125rem',
          color: COLORS.gray3,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { backgroundColor: COLORS.raised, borderRadius: 4 },
        bar: { backgroundColor: COLORS.orange, borderRadius: 4 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: COLORS.raised,
          border: `1px solid ${COLORS.border}`,
          fontSize: '0.8125rem',
          color: COLORS.white,
        },
      },
    },
  },
})
