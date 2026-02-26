import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, LinearProgress,
  IconButton, CircularProgress, TextField, InputAdornment, Tooltip, Alert,
} from '@mui/material'
import { Add, Search, Visibility, Edit, LocationOn, Refresh } from '@mui/icons-material'
import { audienciasApi } from '../../services/api'
import { COLORS } from '../../theme'
import type { Audiencia } from '../../models/types'
import StatusChip from '../../components/shared/StatusChip'

export default function AudienciasPage() {
  const [audiencias, setAudiencias] = useState<Audiencia[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const navigate = useNavigate()

  const carregar = () => {
    setLoading(true)
    setErro(null)
    audienciasApi.listar()
      .then((r: any) => {
        const lista = Array.isArray(r) ? r : (r?.data ?? [])
        setAudiencias(lista)
      })
      .catch((err: any) => {
        setErro(err?.message || 'Não foi possível carregar as audiências. Verifique se o servidor mock está rodando em localhost:3000.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  const filtradas = audiencias.filter(a =>
    a.nome.toLowerCase().includes(busca.toLowerCase()) ||
    a.departamento.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: COLORS.white, fontWeight: 800 }}>Audiências</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/audiencias/nova')}>
          Nova Audiência
        </Button>
      </Box>

      {erro && (
        <Alert
          severity="error"
          action={<Button color="inherit" size="small" startIcon={<Refresh />} onClick={carregar}>Tentar novamente</Button>}
          sx={{ mb: 2 }}
        >
          {erro}
        </Alert>
      )}

      <TextField
        placeholder="Buscar audiência ou departamento..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: COLORS.gray3 }} /></InputAdornment> }}
      />

      {loading ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}><CircularProgress sx={{ color: COLORS.orange }} /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
          <Table>
            <TableHead>
              <TableRow>
                {['Nome', 'Departamento', 'Data', 'Horário', 'Local', 'Presença', 'Status', 'Ações'].map(h => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtradas.map(a => (
                <TableRow key={a.id} hover sx={{ '&:hover': { bgcolor: COLORS.raised } }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: COLORS.white, fontWeight: 500 }}>{a.nome}</Typography>
                  </TableCell>
                  <TableCell><Typography variant="body2">{a.departamento}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{new Date(a.data + 'T12:00:00').toLocaleDateString('pt-BR')}</Typography></TableCell>
                  <TableCell><Typography variant="caption">{a.horario_inicio} – {a.horario_fim}</Typography></TableCell>
                  <TableCell sx={{ minWidth: 200, maxWidth: 240 }}>
                    <Tooltip title={a.local} placement="top" arrow>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                          <LocationOn sx={{ fontSize: 13, color: COLORS.gray4, mt: '1px', flexShrink: 0 }} />
                          <Typography
                            variant="caption"
                            sx={{
                              color: COLORS.gray3,
                              lineHeight: 1.4,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {a.local.includes(' — ')
                              ? a.local.split(' — ')[0]
                              : a.local}
                          </Typography>
                        </Box>
                        {a.local.includes(' — ') && (
                          <Typography
                            variant="caption"
                            sx={{ color: COLORS.gray4, fontSize: '0.7rem', pl: 2.5 }}
                          >
                            {a.local.split(' — ').slice(1).join(' — ')}
                          </Typography>
                        )}
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ minWidth: 120 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress variant="determinate" value={a.taxa_presenca * 100} sx={{ flex: 1, height: 4 }} />
                      <Typography variant="caption" sx={{ color: COLORS.orange, fontWeight: 600 }}>
                        {Math.round(a.taxa_presenca * 100)}%
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: COLORS.gray4 }}>
                      {a.presentes}/{a.total_participantes}
                    </Typography>
                  </TableCell>
                  <TableCell><StatusChip status={a.status} /></TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => navigate(`/audiencias/${a.id}`)} sx={{ color: COLORS.gray3 }}>
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ color: COLORS.gray3 }}><Edit fontSize="small" /></IconButton>
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
