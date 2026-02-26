import { AppBar, Toolbar, IconButton, Typography, Badge, Box, Avatar } from '@mui/material'
import { Menu, Notifications, Brightness1 } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../../theme'

interface TopBarProps { onMenuToggle: () => void }

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const navigate = useNavigate()

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ bgcolor: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, zIndex: 1100 }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton onClick={onMenuToggle} sx={{ color: COLORS.gray3 }}>
          <Menu />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Brightness1 sx={{ color: COLORS.green, fontSize: 10 }} />
          <Typography variant="body2" sx={{ color: COLORS.gray3, fontSize: 12 }}>
            Ambiente de Demonstração
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton onClick={() => navigate('/notificacoes')} sx={{ color: COLORS.gray3 }}>
          <Badge badgeContent={3} color="error">
            <Notifications />
          </Badge>
        </IconButton>

        <Avatar sx={{ width: 32, height: 32, bgcolor: COLORS.orange, fontSize: 13, fontWeight: 700 }}>
          NA
        </Avatar>
      </Toolbar>
    </AppBar>
  )
}
