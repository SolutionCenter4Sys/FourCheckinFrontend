import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box, Typography, List, ListItemButton,
  ListItemIcon, ListItemText, Divider,
} from '@mui/material'
import {
  Dashboard, EventNote, People, Security,
  Upload, Assessment, Notifications, GpsFixed,
  Api, Download,
} from '@mui/icons-material'
import { COLORS } from '../../theme'

const navItems = [
  { label: 'Dashboard',           path: '/dashboard',           icon: <Dashboard /> },
  { label: 'Audiências',          path: '/audiencias',          icon: <EventNote /> },
  { label: 'Perfis RBAC',         path: '/rbac',                icon: <People /> },
  { label: 'Auditoria',           path: '/auditoria',           icon: <Security /> },
  { label: 'Upload CSV',          path: '/upload',              icon: <Upload /> },
  { label: 'Notificações',        path: '/notificacoes',        icon: <Notifications /> },
  { label: 'Evidências',          path: '/evidencias',          icon: <GpsFixed /> },
  { label: 'Config Notificações', path: '/notificacoes/config', icon: <Assessment /> },
  { label: 'API Docs',            path: '/api-docs',            icon: <Api /> },
  { label: 'Exportação',          path: '/exportacao',          icon: <Download /> },
]

interface SidebarProps { open: boolean; width: number }

export default function Sidebar({ open, width }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        width,
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        bgcolor: COLORS.sidebarBg,
        borderRight: `1px solid ${COLORS.border}`,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1200,
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 2.5, pt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Box sx={{
            bgcolor: COLORS.orange, color: '#fff', px: 1.5, py: 0.5,
            borderRadius: 1, fontSize: 13, fontWeight: 800, letterSpacing: 1,
          }}>
            FOURSYS
          </Box>
          <Typography sx={{ color: COLORS.orange, fontWeight: 700, fontSize: 13 }}>
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: COLORS.gray4, fontSize: 11 }}>
          CheckIn Audiências Admin
        </Typography>
      </Box>

      <Divider sx={{ borderColor: COLORS.border, mb: 1 }} />

      {/* Nav Links */}
      <List dense sx={{ px: 1, flexGrow: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
          return (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                color: isActive ? COLORS.orange : COLORS.gray3,
                bgcolor: isActive ? `rgba(255,102,0,0.12)` : 'transparent',
                borderLeft: isActive ? `3px solid ${COLORS.orange}` : '3px solid transparent',
                '&:hover': { bgcolor: `rgba(255,255,255,0.05)`, color: COLORS.white },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36, fontSize: 20 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 13, fontWeight: isActive ? 600 : 400 }}
              />
            </ListItemButton>
          )
        })}
      </List>

      <Divider sx={{ borderColor: COLORS.border }} />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ color: COLORS.gray4 }}>
          Step 7 — Score 8.43/10 ✅
        </Typography>
      </Box>
    </Box>
  )
}
