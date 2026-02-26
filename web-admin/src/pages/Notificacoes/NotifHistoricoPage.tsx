import { useEffect, useState } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, CircularProgress, Button,
} from '@mui/material'
import { notificacoesApi } from '../../services/api'
import { COLORS } from '../../theme'
import MetricCard from '../../components/shared/MetricCard'
import type { Notificacao } from '../../models/types'

export default function NotifHistoricoPage() {
  const [notifs, setNotifs] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificacoesApi.listar().then((r: any) => { setNotifs(r.data || []); setLoading(false) })
  }, [])

  const statusColor = (s: string) =>
    s === 'entregue' || s === 'lida' ? COLORS.green : s === 'falha' ? COLORS.red : COLORS.amber

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ color: COLORS.white, fontWeight: 800 }}>Histórico de Notificações</Typography>
        <Button variant="outlined" startIcon={<span>⬇️</span>}>Exportar CSV</Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Box sx={{ flex: 1 }}><MetricCard label="Enviadas" value="1.847" color={COLORS.orange} /></Box>
        <Box sx={{ flex: 1 }}><MetricCard label="Taxa Entrega" value="94.2%" color={COLORS.green} /></Box>
        <Box sx={{ flex: 1 }}><MetricCard label="Taxa Abertura" value="68%" color={COLORS.amber} /></Box>
        <Box sx={{ flex: 1 }}><MetricCard label="Falhas" value="12" color={COLORS.red} /></Box>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}><CircularProgress sx={{ color: COLORS.orange }} /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Data/Hora', 'Tipo', 'Destinatário', 'Audiência', 'Canal', 'Status', 'Ação'].map(h => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {notifs.map(n => (
                <TableRow key={n.id} hover sx={{ '&:hover': { bgcolor: COLORS.raised } }}>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: COLORS.gray3 }}>
                      {new Date(n.created_at).toLocaleString('pt-BR')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={n.tipo.replace('_', ' ')}
                      size="small"
                      sx={{ bgcolor: `${COLORS.orange}20`, color: COLORS.orange, fontSize: 10 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: COLORS.white }}>{n.usuario_nome}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 120 }}>
                    <Typography variant="caption" sx={{ color: COLORS.gray3 }} noWrap>{n.audiencia_nome}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: COLORS.gray4 }}>{n.canal}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={n.status}
                      size="small"
                      sx={{ bgcolor: `${statusColor(n.status)}20`, color: statusColor(n.status), fontSize: 10 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="small" sx={{ color: COLORS.orange, fontSize: 11 }}>Detalhes</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
