import { useEffect, useState, useCallback } from 'react'
import { Box, Grid, Typography, LinearProgress, Chip, CircularProgress, Tooltip, IconButton, Divider } from '@mui/material'
import { TrendingUp, Warning, CheckCircle, Phone, WhatsApp, Place, AccessTime, DirectionsCar, PersonOutline } from '@mui/icons-material'
import { dashboardApi } from '../../services/api'
import { COLORS } from '../../theme'
import MetricCard from '../../components/shared/MetricCard'

const TIPO_LABEL: Record<string, { label: string; color: string }> = {
  ADVOGADO:   { label: 'Advogado',   color: '#3B82F6' },
  TESTEMUNHA: { label: 'Testemunha', color: '#F59E0B' },
  PREPOSTO:   { label: 'Preposto',   color: '#8B5CF6' },
}

function calcMinutesUntilHearing(horario: string): number {
  const [h, m] = horario.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(h, m, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / 60000)
}

function buildWhatsAppUrl(telefone: string, nomePersona: string, nomeAudiencia: string, local: string, horario: string): string {
  const digits = telefone.replace(/\D/g, '')
  const numero = digits.startsWith('55') ? digits : `55${digits}`
  const msg = encodeURIComponent(
    `Olá ${nomePersona}, você tem uma audiência *${nomeAudiencia}* hoje às *${horario}* no local: *${local}*.\n\nPor favor, confirme sua presença respondendo esta mensagem. Obrigado!`
  )
  return `https://wa.me/${numero}?text=${msg}`
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const fetchDashboard = useCallback(async () => {
    try {
      const resp = await dashboardApi.obter()
      setData(resp)
      setLastUpdate(new Date())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 5000)
    return () => clearInterval(interval)
  }, [fetchDashboard])

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress sx={{ color: COLORS.orange }} />
    </Box>
  )

  const kpis = data?.kpis || {}
  const alertas = data?.alertas_recentes || []

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: COLORS.white, fontWeight: 800 }}>
            Dashboard
          </Typography>
          <Typography variant="body2">
            Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')} · Polling 5s
          </Typography>
        </Box>
        <Chip
          icon={<TrendingUp sx={{ fontSize: 14 }} />}
          label="Tempo Real"
          size="small"
          sx={{ bgcolor: `${COLORS.orange}22`, color: COLORS.orange, border: `1px solid ${COLORS.orange}44` }}
        />
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            label="Audiências Hoje"
            value={kpis.audiencias_hoje?.valor ?? 0}
            subtitle={`${kpis.audiencias_hoje?.em_andamento ?? 0} em andamento`}
            color={COLORS.orange}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            label="Participantes Hoje"
            value={kpis.total_participantes_hoje?.valor ?? 0}
            subtitle={`${kpis.total_participantes_hoje?.presentes ?? 0} presentes`}
            color={COLORS.green}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            label="Taxa de Presença"
            value={kpis.taxa_presenca_geral?.percentual ?? '0%'}
            subtitle={`Meta: ${((kpis.taxa_presenca_geral?.meta ?? 0) * 100).toFixed(0)}%`}
            color={kpis.taxa_presenca_geral?.atingiu_meta ? COLORS.green : COLORS.amber}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            label="Check-ins Realizados"
            value={kpis.checkins_realizados_hoje?.valor ?? 0}
            subtitle={`${kpis.checkins_realizados_hoje?.mobile ?? 0} via mobile`}
            color={COLORS.green}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            label="Alertas Ativos"
            value={kpis.alertas_ativos?.valor ?? 0}
            subtitle={`${kpis.alertas_ativos?.ausencias_criticas ?? 0} ausências críticas`}
            color={kpis.alertas_ativos?.valor > 0 ? COLORS.red : COLORS.green}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            label="Integridade SHA-256"
            value={`${((kpis.evidencias_geradas?.taxa_integridade ?? 1) * 100).toFixed(0)}%`}
            subtitle={`${kpis.evidencias_geradas?.integras ?? 0} evidências válidas`}
            color={COLORS.green}
          />
        </Grid>
      </Grid>

      {/* Alertas e Audiências Ativas */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Box sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 2, p: 2 }}>
            <Typography variant="h6" sx={{ color: COLORS.white, mb: 2 }}>
              Audiências Ativas
            </Typography>
            {(data?.audiencias_ativas || []).map((a: any) => (
              <Box key={a.id} sx={{
                p: 2, mb: 1, bgcolor: COLORS.raised, borderRadius: 1.5,
                border: `1px solid ${COLORS.orange}44`,
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: COLORS.white, fontWeight: 600 }}>{a.nome}</Typography>
                  <Typography variant="caption" sx={{ color: COLORS.gray3 }}>{a.horario}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: COLORS.gray3, display: 'block', mb: 1 }}>
                  {a.local}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={a.taxa * 100}
                    sx={{ flex: 1, height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption" sx={{ color: COLORS.orange, fontWeight: 600, minWidth: 40 }}>
                    {a.presentes}/{a.total}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 2, p: 2 }}>
            <Typography variant="h6" sx={{ color: COLORS.white, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning sx={{ color: COLORS.red, fontSize: 20 }} /> Alertas
            </Typography>
            {alertas.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CheckCircle sx={{ color: COLORS.green, fontSize: 40, mb: 1 }} />
                <Typography variant="body2">Nenhum alerta ativo</Typography>
              </Box>
            ) : alertas.map((a: any, idx: number) => {
              const tipoInfo = TIPO_LABEL[a.tipo_participante] ?? TIPO_LABEL.TESTEMUNHA
              const minutesUntil = calcMinutesUntilHearing(a.audiencia_horario_inicio)
              const urgente = minutesUntil > 0 && minutesUntil < a.tempo_deslocamento_min
              const whatsUrl = buildWhatsAppUrl(a.telefone, a.usuario, a.audiencia, a.audiencia_local, a.audiencia_horario_inicio)

              return (
                <Box key={a.id} sx={{
                  mb: idx < alertas.length - 1 ? 2 : 0,
                  p: 1.5,
                  bgcolor: COLORS.raised,
                  borderRadius: 1.5,
                  border: `1px solid ${urgente ? COLORS.red : COLORS.amber}55`,
                }}>
                  {/* Linha 1: Nome + Tipo + Urgente */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75, flexWrap: 'wrap' }}>
                    <PersonOutline sx={{ color: COLORS.amber, fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: COLORS.white, fontWeight: 700, flex: 1 }}>
                      {a.usuario}
                    </Typography>
                    <Chip
                      label={tipoInfo.label}
                      size="small"
                      sx={{ height: 18, fontSize: '0.65rem', bgcolor: `${tipoInfo.color}22`, color: tipoInfo.color, border: `1px solid ${tipoInfo.color}44` }}
                    />
                    {urgente && (
                      <Chip label="URGENTE" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: `${COLORS.red}22`, color: COLORS.red, border: `1px solid ${COLORS.red}44` }} />
                    )}
                  </Box>

                  {/* Linha 2: Audiência */}
                  <Typography variant="caption" sx={{ color: COLORS.amber, display: 'block', fontWeight: 600, mb: 0.5 }}>
                    {a.audiencia}
                  </Typography>

                  <Divider sx={{ borderColor: COLORS.border, my: 0.75 }} />

                  {/* Linha 3: Local + Horário */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 0.5, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Place sx={{ fontSize: 13, color: COLORS.gray3 }} />
                      <Typography variant="caption" sx={{ color: COLORS.gray3 }}>
                        {a.audiencia_local}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTime sx={{ fontSize: 13, color: COLORS.gray3 }} />
                      <Typography variant="caption" sx={{ color: minutesUntil < 0 ? COLORS.red : minutesUntil < 30 ? COLORS.amber : COLORS.gray3, fontWeight: minutesUntil < 30 ? 700 : 400 }}>
                        {minutesUntil < 0
                          ? `Iniciou há ${Math.abs(minutesUntil)}min`
                          : `Inicia em ${minutesUntil}min`}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Linha 4: Distância + Deslocamento */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                    <DirectionsCar sx={{ fontSize: 13, color: urgente ? COLORS.red : COLORS.gray3 }} />
                    <Typography variant="caption" sx={{ color: urgente ? COLORS.red : COLORS.gray3, fontWeight: urgente ? 700 : 400 }}>
                      {a.distancia_km} km · ~{a.tempo_deslocamento_min}min de deslocamento
                      {urgente && ' ⚠ Chegada improvável a tempo'}
                    </Typography>
                  </Box>

                  <Divider sx={{ borderColor: COLORS.border, my: 0.75 }} />

                  {/* Linha 5: Telefone + Ações */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone sx={{ fontSize: 14, color: COLORS.gray3 }} />
                    <Typography variant="caption" sx={{ color: COLORS.gray3, flex: 1 }}>
                      {a.telefone}
                    </Typography>
                    <Tooltip title={`Ligar para ${a.usuario}`}>
                      <IconButton
                        size="small"
                        component="a"
                        href={`tel:${a.telefone.replace(/\D/g, '')}`}
                        sx={{ color: COLORS.gray3, '&:hover': { color: COLORS.white }, p: 0.5 }}
                      >
                        <Phone sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Enviar confirmação de presença via WhatsApp">
                      <IconButton
                        size="small"
                        component="a"
                        href={whatsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: '#25D366', '&:hover': { bgcolor: '#25D36622' }, p: 0.5 }}
                      >
                        <WhatsApp sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
