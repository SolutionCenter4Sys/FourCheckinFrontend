import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Grid, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, LinearProgress,
  Avatar, Chip, CircularProgress, Alert,
} from '@mui/material'
import { ArrowBack, NotificationsActive, Download, GpsFixed, CheckCircle, Cancel } from '@mui/icons-material'
import { audienciasApi } from '../../services/api'
import { COLORS } from '../../theme'
import type { Audiencia, Participante } from '../../models/types'
import MetricCard from '../../components/shared/MetricCard'
import StatusChip from '../../components/shared/StatusChip'

export default function DetalheAudienciaPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [audiencia, setAudiencia] = useState<Audiencia | null>(null)
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setErro('ID da audiência não informado.')
      setLoading(false)
      return
    }
    setLoading(true)
    setErro(null)
    Promise.all([audienciasApi.obter(id), audienciasApi.participantes(id)])
      .then(([a, p]: any[]) => {
        const dadosAudiencia = a?.data ?? a
        const dadosParticipantes = p?.data ?? p
        if (!dadosAudiencia) {
          setErro('Audiência não encontrada.')
        } else {
          setAudiencia(dadosAudiencia)
          setParticipantes(Array.isArray(dadosParticipantes) ? dadosParticipantes : [])
        }
      })
      .catch((err: any) => {
        const status = err?.response?.status
        if (status === 404) {
          setErro('Audiência não encontrada.')
        } else {
          setErro('Não foi possível carregar os dados. Verifique se o servidor mock está rodando.')
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, gap: 2 }}>
      <CircularProgress sx={{ color: COLORS.orange }} />
      <Typography variant="body2" sx={{ color: COLORS.gray3 }}>Carregando audiência...</Typography>
    </Box>
  )

  if (erro || !audiencia) return (
    <Box sx={{ mt: 4 }}>
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => navigate('/audiencias')}>
            Voltar
          </Button>
        }
      >
        {erro ?? 'Audiência não encontrada.'}
      </Alert>
    </Box>
  )

  const ausentes = participantes.filter(p => !p.checkin.realizado)

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/audiencias')} sx={{ color: COLORS.gray3 }}>
          Audiências
        </Button>
        <Typography variant="h5" sx={{ color: COLORS.white, fontWeight: 700, flexGrow: 1 }} noWrap>
          {audiencia.nome}
        </Typography>
        <StatusChip status={audiencia.status} />
        <Button variant="outlined" startIcon={<NotificationsActive />} disabled={ausentes.length === 0}>
          Notificar Ausentes ({ausentes.length})
        </Button>
        <Button variant="outlined" startIcon={<Download />}>Exportar</Button>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}><MetricCard label="Presentes" value={`${audiencia.presentes}/${audiencia.total_participantes}`} color={COLORS.orange} /></Grid>
        <Grid item xs={6} sm={3}><MetricCard label="Taxa de Presença" value={`${Math.round(audiencia.taxa_presenca * 100)}%`} color={COLORS.green} /></Grid>
        <Grid item xs={6} sm={3}><MetricCard label="Horário" value={`${audiencia.horario_inicio}–${audiencia.horario_fim}`} color={COLORS.gray3} /></Grid>
        <Grid item xs={6} sm={3}><MetricCard label="Geofence" value={`${audiencia.raio_geofence_metros}m`} color={COLORS.green} /></Grid>
      </Grid>

      <Typography variant="body2" sx={{ color: COLORS.gray3, mb: 2 }}>
        📍 {audiencia.local} · {audiencia.departamento}
      </Typography>

      <Box sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 2, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ color: COLORS.white }}>Participantes ({participantes.length})</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress variant="determinate" value={audiencia.taxa_presenca * 100} sx={{ width: 120, height: 6 }} />
            <Typography variant="caption" sx={{ color: COLORS.orange, fontWeight: 600 }}>
              {Math.round(audiencia.taxa_presenca * 100)}%
            </Typography>
          </Box>
        </Box>
        <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Participante', 'Departamento', 'Check-in', 'GPS', 'Status', 'Ações'].map(h => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {participantes.map(p => (
                <TableRow key={p.id} hover sx={{ '&:hover': { bgcolor: COLORS.raised } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: `${COLORS.orange}30`, color: COLORS.orange, fontSize: 12, fontWeight: 700 }}>
                        {p.avatar_iniciais}
                      </Avatar>
                      <Typography variant="body2" sx={{ color: COLORS.white, fontWeight: 500 }}>{p.nome}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="caption">{p.departamento}</Typography></TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: COLORS.gray3 }}>
                      {p.checkin.timestamp ? new Date(p.checkin.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {p.checkin.realizado ? (
                      <Chip label="✅ GPS OK" size="small" sx={{ bgcolor: `${COLORS.green}20`, color: COLORS.green, border: `1px solid ${COLORS.green}44`, fontSize: 10 }} />
                    ) : <Typography variant="caption" sx={{ color: COLORS.gray4 }}>—</Typography>}
                  </TableCell>
                  <TableCell>
                    {p.checkin.realizado
                      ? <Chip icon={<CheckCircle sx={{ fontSize: 14 }} />} label="Presente" size="small" sx={{ bgcolor: `${COLORS.green}20`, color: COLORS.green, border: `1px solid ${COLORS.green}44` }} />
                      : <Chip icon={<Cancel sx={{ fontSize: 14 }} />} label="Ausente" size="small" sx={{ bgcolor: `${COLORS.red}20`, color: COLORS.red, border: `1px solid ${COLORS.red}44` }} />
                    }
                  </TableCell>
                  <TableCell>
                    {p.checkin.evidencia_id && (
                      <Button size="small" startIcon={<GpsFixed sx={{ fontSize: 12 }} />} sx={{ color: COLORS.orange, fontSize: 11 }}>
                        Evidência
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}
