import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline, Box, Typography, Button } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'
import { theme, COLORS } from './theme'
import App from './App'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100vh', bgcolor: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
          <Box sx={{ maxWidth: 500, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: COLORS.red, mb: 2, fontWeight: 700 }}>
              Algo deu errado
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.gray3, mb: 3, fontFamily: 'monospace', bgcolor: COLORS.surface, p: 2, borderRadius: 1 }}>
              {this.state.message}
            </Typography>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Recarregar Página
            </Button>
          </Box>
        </Box>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
