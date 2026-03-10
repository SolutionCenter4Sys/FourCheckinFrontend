import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Grid, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, LinearProgress,
  Avatar, Chip, CircularProgress, Alert, IconButton, Snackbar,
  Tooltip, Divider,
} from '@mui/material'
import {
  ArrowBack, NotificationsActive, Download, GpsFixed, CheckCircle, Cancel,
  WhatsApp, Email, Videocam, Gavel, Business, Person, WarningAmber,
  LinkOff, RadioButtonUnchecked, DoneAll, Send,
} from '@mui/icons-material'
import { audienciasApi } from '../../services/api'
import { COLORS } from '../../theme'
import type { Audiencia, Participante, TipoParticipante, StatusCheckinLink, AlertaCheckin } from '../../models/types'
import MetricCard from '../../components/shared/MetricCard'
import StatusChip from '../../components/shared/StatusChip'

// ─── Config visual por tipo de participante (EP-08 / F-08.08) ────────────────
const TIPO_CONFIG: Record<TipoParticipante, { label: string; color: string; icon: React.ReactNode }> = {
  ADVOGADO:  { label: 'Advogado',   color: '#3B82F6', icon: <Gavel sx={{ fontSize: 12 }} /> },
  PREPOSTO:  { label: 'Preposto',   color: COLORS.orange, icon: <Business sx={{ fontSize: 12 }} /> },
  TESTEMUNHA:{ label: 'Testemunha', color: '#4ADE80', icon: <Person sx={{ fontSize: 12 }} /> },
}

// ─── Config visual por status de checkin (EP-08 / F-08.06) ───────────────────
const STATUS_CHECKIN_CONFIG: Record<StatusCheckinLink, { label: string; color: string; icon: React.ReactNode }> = {
  PENDENTE:          { label: 'Pendente',         color: COLORS.gray4,   icon: <RadioButtonUnchecked sx={{ fontSize: 14 }} /> },
  LINK_ENVIADO:      { label: 'Link enviado',      color: '#FBBF24',      icon: <Send sx={{ fontSize: 14 }} /> },
  LINK_ABERTO:       { label: 'Link aberto',       color: '#3B82F6',      icon: <CheckCircle sx={{ fontSize: 14 }} /> },
  CHECKIN_REALIZADO: { label: 'Check-in OK',       color: '#4ADE80',      icon: <DoneAll sx={{ fontSize: 14 }} /> },
  AUSENTE:           { label: 'Ausente',           color: '#F87171',      icon: <Cancel sx={{ fontSize: 14 }} /> },
}

// ─── Mock de participantes estendidos (EP-08 / F-08.06) ──────────────────────
interface ParticipanteEP08 {
  id: string
  nome: string
  email: string
  telefone: string
  whatsapp?: string
  tipo: TipoParticipante
  oab?: string
  empresa?: string
  statusCheckin: StatusCheckinLink
  linkEnviadoWhatsapp: boolean
  linkEnviadoEmail: boolean
  distanciaKm?: number
  alertas: AlertaCheckin[]
}

const MOCK_PARTICIPANTES_EP08: ParticipanteEP08[] = [
  {
    id: 'pep-01', nome: 'Dr. Carlos Alberto Ferreira', email: 'carlos.ferreira@advocacia.com.br',
    telefone: '(11) 99001-0001', whatsapp: '11990010001', tipo: 'ADVOGADO', oab: 'SP 123456',
    statusCheckin: 'CHECKIN_REALIZADO', linkEnviadoWhatsapp: true, linkEnviadoEmail: true, distanciaKm: 0.3,
    alertas: [],
  },
  {
    id: 'pep-02', nome: 'Jonas Rodrigues Barros', email: 'jonas.barros@bancoa.com.br',
    telefone: '(11) 98001-0001', whatsapp: '11980010001', tipo: 'PREPOSTO', empresa: 'Banco Alfa S.A.',
    statusCheckin: 'LINK_ABERTO', linkEnviadoWhatsapp: true, linkEnviadoEmail: true, distanciaKm: 28.5,
    alertas: [
      { id: 'alr-01', tipo: 'AUSENCIA_PROVAVEL', mensagem: 'Participante a 28.5km do fórum. Audiência em 1h30. Risco de ausência.', participanteNome: 'Jonas Rodrigues Barros', criadoEm: new Date(Date.now() - 30 * 60000).toISOString(), resolvido: false },
    ],
  },
  {
    id: 'pep-03', nome: 'João Paulo Ribeiro Souza', email: 'joao.ribeiro@gmail.com',
    telefone: '(11) 97001-0001', tipo: 'TESTEMUNHA',
    statusCheckin: 'LINK_ENVIADO', linkEnviadoWhatsapp: false, linkEnviadoEmail: true,
    alertas: [
      { id: 'alr-02', tipo: 'LINK_NAO_ABERTO', mensagem: 'Link enviado há 3h por e-mail e não foi aberto. Audiência em 5h.', participanteNome: 'João Paulo Ribeiro Souza', criadoEm: new Date(Date.now() - 3 * 3600000).toISOString(), resolvido: false },
    ],
  },
]

// ─── Tipo de alerta ───────────────────────────────────────────────────────────
const ALERTA_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  LINK_NAO_ABERTO:   { label: 'Link não aberto',   color: '#FBBF24', icon: <LinkOff sx={{ fontSize: 14 }} /> },
  AUSENCIA_PROVAVEL: { label: 'Ausência provável',  color: '#F87171', icon: <WarningAmber sx={{ fontSize: 14 }} /> },
  DISTANCIA_CRITICA: { label: 'Distância crítica',  color: '#F87171', icon: <GpsFixed sx={{ fontSize: 14 }} /> },
  CHECKIN_PENDENTE:  { label: 'Check-in pendente',  color: '#FBBF24', icon: <RadioButtonUnchecked sx={{ fontSize: 14 }} /> },
}

export default function DetalheAudienciaPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [audiencia, setAudiencia] = useState<Audiencia | null>(null)
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // Estado para EP-08
  const [participantesEP08, setParticipantesEP08] = useState<ParticipanteEP08[]>(MOCK_PARTICIPANTES_EP08)
  const [alertasResolvidos, setAlertasResolvidos] = useState<Set<string>>(new Set())
  const [snack, setSnack] = useState<{ open: boolean; msg: string; tipo: 'success' | 'info' | 'warning' }>({ open: false, msg: '', tipo: 'success' })

  useEffect(() => {
    if (!id) { setErro('ID não informado.'); setLoading(false); return }
    setLoading(true)
    setErro(null)
    Promise.all([audienciasApi.obter(id), audienciasApi.participantes(id)])
      .then(([a, p]: any[]) => {
        const dadosAudiencia = a?.data ?? a
        const dadosParticipantes = p?.data ?? p
        if (!dadosAudiencia) { setErro('Audiência não encontrada.') }
        else {
          setAudiencia(dadosAudiencia)
          setParticipantes(Array.isArray(dadosParticipantes) ? dadosParticipantes : [])
        }
      })
      .catch((err: any) => {
        const status = err?.response?.status
        setErro(status === 404 ? 'Audiência não encontrada.' : 'Não foi possível carregar os dados.')
      })
      .finally(() => setLoading(false))
  }, [id])

  // ── Ações EP-08 ──
  const enviarWhatsApp = (p: ParticipanteEP08) => {
    setParticipantesEP08(prev => prev.map(x => x.id === p.id ? { ...x, linkEnviadoWhatsapp: true, statusCheckin: x.statusCheckin === 'PENDENTE' ? 'LINK_ENVIADO' : x.statusCheckin } : x))
    setSnack({ open: true, msg: `✅ Link de check-in enviado via WhatsApp para ${p.nome}`, tipo: 'success' })
  }

  const enviarEmail = (p: ParticipanteEP08) => {
    setParticipantesEP08(prev => prev.map(x => x.id === p.id ? { ...x, linkEnviadoEmail: true, statusCheckin: x.statusCheckin === 'PENDENTE' ? 'LINK_ENVIADO' : x.statusCheckin } : x))
    setSnack({ open: true, msg: `✅ Link de check-in enviado por e-mail para ${p.nome}`, tipo: 'success' })
  }

  const resolverAlerta = (alertaId: string) => {
    setAlertasResolvidos(prev => new Set([...prev, alertaId]))
    setSnack({ open: true, msg: 'Alerta marcado como resolvido.', tipo: 'info' })
  }

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, gap: 2 }}>
      <CircularProgress sx={{ color: COLORS.orange }} />
      <Typography variant="body2" sx={{ color: COLORS.gray3 }}>Carregando audiência...</Typography>
    </Box>
  )

  if (erro || !audiencia) return (
    <Box sx={{ mt: 4 }}>
      <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => navigate('/audiencias')}>Voltar</Button>}>
        {erro ?? 'Audiência não encontrada.'}
      </Alert>
    </Box>
  )

  const ausentes = participantes.filter(p => !p.checkin.realizado)
  const linkRemoto = (audiencia as any).link_remoto as string | undefined
  const alertasAtivos = participantesEP08.flatMap(p => p.alertas).filter(a => !alertasResolvidos.has(a.id))

  return (
    <Box>
      {/* ── Cabeçalho ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/audiencias')} sx={{ color: COLORS.gray3 }}>
          Audiências
        </Button>
        <Typography variant="h5" sx={{ color: COLORS.white, fontWeight: 700, flexGrow: 1 }} noWrap>
          {audiencia.nome}
        </Typography>
        <StatusChip status={audiencia.status} />
        {linkRemoto && (
          <Tooltip title={`Sala virtual: ${linkRemoto}`}>
            <Button
              variant="outlined"
              startIcon={<Videocam />}
              onClick={() => window.open(linkRemoto, '_blank')}
              sx={{ color: '#A78BFA', borderColor: '#A78BFA55' }}
            >
              Entrar na Sala
            </Button>
          </Tooltip>
        )}
        <Button variant="outlined" startIcon={<NotificationsActive />} disabled={ausentes.length === 0}>
          Notificar Ausentes ({ausentes.length})
        </Button>
        <Button variant="outlined" startIcon={<Download />}>Exportar</Button>
      </Box>

      {/* ── Alerta de audiência remota ── */}
      {linkRemoto && (
        <Alert icon={<Videocam />} severity="info" sx={{ mb: 2, bgcolor: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', color: '#C4B5FD' }}>
          Audiência remota · Link: <strong>{linkRemoto}</strong>
        </Alert>
      )}

      {/* ── KPI Cards ── */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}><MetricCard label="Presentes" value={`${audiencia.presentes}/${audiencia.total_participantes}`} color={COLORS.orange} /></Grid>
        <Grid item xs={6} sm={3}><MetricCard label="Taxa de Presença" value={`${Math.round(audiencia.taxa_presenca * 100)}%`} color={COLORS.green} /></Grid>
        <Grid item xs={6} sm={3}><MetricCard label="Horário" value={`${audiencia.horario_inicio}–${audiencia.horario_fim}`} color={COLORS.gray3} /></Grid>
        <Grid item xs={6} sm={3}><MetricCard label="Alertas Ativos" value={`${alertasAtivos.length}`} color={alertasAtivos.length > 0 ? '#F87171' : COLORS.green} /></Grid>
      </Grid>

      <Typography variant="body2" sx={{ color: COLORS.gray3, mb: 3 }}>
        📍 {audiencia.local} · {audiencia.departamento}
      </Typography>

      {/* ═══════════════════════════════════════════════════════════════════════
          SEÇÃO EP-08: Participantes com Check-in Inteligente (F-08.06 / F-08.08)
         ══════════════════════════════════════════════════════════════════════ */}
      <Paper sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 2, p: 2.5, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ color: COLORS.white }}>
              Participantes — Check-in Inteligente
            </Typography>
            <Typography variant="caption" sx={{ color: COLORS.gray4 }}>
              EP-08 · Preposto / Advogado / Testemunha · Envio de link por WhatsApp e E-mail
            </Typography>
          </Box>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Participante', 'Função', 'Contato', 'Status Check-in', 'GPS / Distância', 'Enviar Link'].map(h => (
                  <TableCell key={h} sx={{ color: COLORS.gray3, fontWeight: 600, fontSize: 12 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {participantesEP08.map(p => {
                const tipoCfg = TIPO_CONFIG[p.tipo]
                const statusCfg = STATUS_CHECKIN_CONFIG[p.statusCheckin]
                const iniciais = p.nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('')
                const temAlertaAtivo = p.alertas.some(a => !alertasResolvidos.has(a.id))
                return (
                  <TableRow key={p.id} hover sx={{ '&:hover': { bgcolor: COLORS.raised }, opacity: 1 }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ position: 'relative' }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: `${tipoCfg.color}22`, color: tipoCfg.color, fontSize: 12, fontWeight: 700 }}>
                            {iniciais}
                          </Avatar>
                          {temAlertaAtivo && (
                            <Box sx={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, bgcolor: '#F87171', borderRadius: '50%', border: `1.5px solid ${COLORS.surface}` }} />
                          )}
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ color: COLORS.white, fontWeight: 500 }}>{p.nome}</Typography>
                          {p.oab && <Typography variant="caption" sx={{ color: COLORS.gray4, fontSize: '0.65rem' }}>OAB: {p.oab}</Typography>}
                          {p.empresa && <Typography variant="caption" sx={{ color: COLORS.gray4, fontSize: '0.65rem' }}>{p.empresa}</Typography>}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={tipoCfg.icon as React.ReactElement}
                        label={tipoCfg.label}
                        size="small"
                        sx={{ bgcolor: `${tipoCfg.color}18`, color: tipoCfg.color, fontWeight: 600, fontSize: 11, border: `1px solid ${tipoCfg.color}30` }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                        <Typography variant="caption" sx={{ color: COLORS.gray3 }}>{p.email}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {p.whatsapp
                            ? <WhatsApp sx={{ fontSize: 11, color: '#4ADE80' }} />
                            : <Email sx={{ fontSize: 11, color: COLORS.gray4 }} />
                          }
                          <Typography variant="caption" sx={{ color: COLORS.gray4 }}>{p.telefone}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={statusCfg.icon as React.ReactElement}
                        label={statusCfg.label}
                        size="small"
                        sx={{ bgcolor: `${statusCfg.color}15`, color: statusCfg.color, fontWeight: 600, fontSize: 11, border: `1px solid ${statusCfg.color}30` }}
                      />
                    </TableCell>
                    <TableCell>
                      {p.distanciaKm !== undefined ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <GpsFixed sx={{ fontSize: 13, color: p.distanciaKm > 20 ? '#F87171' : '#4ADE80' }} />
                          <Typography variant="caption" sx={{ color: p.distanciaKm > 20 ? '#F87171' : '#4ADE80', fontWeight: 600 }}>
                            {p.distanciaKm.toFixed(1)} km
                          </Typography>
                          {p.distanciaKm > 20 && (
                            <Chip label="⚠ longe" size="small" sx={{ bgcolor: 'rgba(248,113,113,0.1)', color: '#F87171', fontSize: 9, height: 16 }} />
                          )}
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: COLORS.gray4 }}>GPS não ativo</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title={p.linkEnviadoWhatsapp ? 'WhatsApp já enviado — Reenviar' : 'Enviar por WhatsApp'}>
                          <IconButton
                            size="small"
                            onClick={() => enviarWhatsApp(p)}
                            sx={{
                              color: p.linkEnviadoWhatsapp ? '#4ADE80' : COLORS.gray4,
                              bgcolor: p.linkEnviadoWhatsapp ? 'rgba(74,222,128,0.1)' : 'transparent',
                              border: `1px solid ${p.linkEnviadoWhatsapp ? '#4ADE8040' : COLORS.border}`,
                              borderRadius: 1,
                            }}
                          >
                            <WhatsApp sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={p.linkEnviadoEmail ? 'E-mail já enviado — Reenviar' : 'Enviar por E-mail'}>
                          <IconButton
                            size="small"
                            onClick={() => enviarEmail(p)}
                            sx={{
                              color: p.linkEnviadoEmail ? '#3B82F6' : COLORS.gray4,
                              bgcolor: p.linkEnviadoEmail ? 'rgba(59,130,246,0.1)' : 'transparent',
                              border: `1px solid ${p.linkEnviadoEmail ? '#3B82F640' : COLORS.border}`,
                              borderRadius: 1,
                            }}
                          >
                            <Email sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ═══════════════════════════════════════════════════════════════════════
          SEÇÃO EP-08: Alertas Ativos (F-08.07)
         ══════════════════════════════════════════════════════════════════════ */}
      {alertasAtivos.length > 0 && (
        <Paper sx={{ bgcolor: COLORS.surface, border: `1px solid rgba(248,113,113,0.3)`, borderRadius: 2, p: 2.5, mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#F87171', mb: 2 }}>
            ⚠ Alertas Ativos ({alertasAtivos.length})
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {alertasAtivos.map(alerta => {
              const cfg = ALERTA_CONFIG[alerta.tipo] ?? ALERTA_CONFIG.LINK_NAO_ABERTO
              return (
                <Box
                  key={alerta.id}
                  sx={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2,
                    p: 1.5, bgcolor: `${cfg.color}0D`, borderRadius: 1.5,
                    border: `1px solid ${cfg.color}30`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box sx={{ color: cfg.color, mt: 0.25 }}>{cfg.icon}</Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                        <Chip label={cfg.label} size="small" sx={{ bgcolor: `${cfg.color}18`, color: cfg.color, fontWeight: 700, fontSize: 10, height: 18 }} />
                        <Typography variant="caption" sx={{ color: COLORS.gray3, fontWeight: 600 }}>{alerta.participanteNome}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: COLORS.gray4 }}>{alerta.mensagem}</Typography>
                      <Typography variant="caption" sx={{ color: COLORS.gray4, display: 'block', fontSize: '0.65rem', mt: 0.25 }}>
                        {new Date(alerta.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<CheckCircle sx={{ fontSize: 13 }} />}
                    onClick={() => resolverAlerta(alerta.id)}
                    sx={{ color: '#4ADE80', borderColor: '#4ADE8040', border: '1px solid', whiteSpace: 'nowrap', fontSize: 11, minWidth: 90 }}
                  >
                    Resolver
                  </Button>
                </Box>
              )
            })}
          </Box>
        </Paper>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SEÇÃO EXISTENTE: Check-ins via GPS (mantida sem alteração)
         ══════════════════════════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 2, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: COLORS.white }}>
            Check-ins GPS ({participantes.length})
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress variant="determinate" value={audiencia.taxa_presenca * 100} sx={{ width: 120, height: 6 }} />
            <Typography variant="caption" sx={{ color: COLORS.orange, fontWeight: 600 }}>
              {Math.round(audiencia.taxa_presenca * 100)}%
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ borderColor: COLORS.border, mb: 2 }} />
        <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Participante', 'Departamento', 'Check-in', 'GPS', 'Status', 'Ações'].map(h => (
                  <TableCell key={h} sx={{ color: COLORS.gray3, fontWeight: 600, fontSize: 12 }}>{h}</TableCell>
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
                    {p.checkin.realizado
                      ? <Chip label="✅ GPS OK" size="small" sx={{ bgcolor: `${COLORS.green}20`, color: COLORS.green, border: `1px solid ${COLORS.green}44`, fontSize: 10 }} />
                      : <Typography variant="caption" sx={{ color: COLORS.gray4 }}>—</Typography>
                    }
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

      {/* ── Snackbar de feedback ── */}
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.tipo} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))} sx={{ minWidth: 320 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
