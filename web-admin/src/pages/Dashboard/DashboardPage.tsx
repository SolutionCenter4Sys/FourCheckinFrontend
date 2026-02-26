import { useEffect, useState, useCallback } from 'react'
import { Box, Grid, Typography, Alert, LinearProgress, Chip, CircularProgress } from '@mui/material'
import { TrendingUp, Warning, CheckCircle } from '@mui/icons-material'
import { dashboardApi } from '../../services/api'
import { COLORS } from '../../theme'
import MetricCard from '../../components/shared/MetricCard'

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
            ) : alertas.map((a: any) => (
              <Alert
                key={a.id}
                severity="warning"
                sx={{ mb: 1, bgcolor: `${COLORS.amber}15`, color: COLORS.amber, '& .MuiAlert-icon': { color: COLORS.amber } }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{a.usuario}</Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Ausente há {a.tempo_decorrido_min}min — {a.audiencia}
                </Typography>
              </Alert>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
