import {
  Box, Typography, Paper, Grid, Switch, FormControlLabel,
  Button, Chip,
} from '@mui/material'
import { Save, NotificationsActive } from '@mui/icons-material'
import { COLORS } from '../../theme'

const switchSx = {
  '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.orange },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: COLORS.orange },
}

export default function NotifConfigPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ color: COLORS.white, fontWeight: 800 }}>Configuração de Notificações</Typography>
        <Button variant="contained" startIcon={<Save />}>Salvar Configurações</Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          {[
            {
              titulo: '⏰ Lembretes em Cascata', items: [
                { label: 'Lembrete T-24h', desc: 'Enviado 24 horas antes da audiência', default: true },
                { label: 'Lembrete T-4h com Confirmação', desc: 'Permite confirmar presença via push', default: true },
                { label: 'Lembrete T-30min', desc: 'Lembrete final (omitir se já fez check-in)', default: true },
              ],
            },
            {
              titulo: '⚠️ Alertas de Ausência', items: [
                { label: 'Alertar gestor por ausência', desc: 'Envia alerta 15min após encerramento', default: true },
                { label: 'Incluir participante ausente', desc: 'Notificar o próprio ausente', default: true },
              ],
            },
            {
              titulo: '📋 Questionários', items: [
                { label: 'Disparar questionário automaticamente', desc: '1 hora após encerramento', default: true },
                { label: 'Lembrete se não respondido em 24h', desc: 'Reenvio automático', default: true },
              ],
            },
          ].map(sec => (
            <Paper key={sec.titulo} sx={{ p: 2.5, mb: 2, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
              <Typography variant="h6" sx={{ color: COLORS.white, mb: 2 }}>{sec.titulo}</Typography>
              {sec.items.map(item => (
                <Box key={item.label} sx={{ mb: 1.5 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked={item.default} sx={switchSx} />}
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ color: COLORS.white }}>{item.label}</Typography>
                        <Typography variant="caption" sx={{ color: COLORS.gray3 }}>{item.desc}</Typography>
                      </Box>
                    }
                  />
                </Box>
              ))}
            </Paper>
          ))}

          <Paper sx={{ p: 2.5, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <Typography variant="h6" sx={{ color: COLORS.white, mb: 2 }}>📡 Canais de Envio</Typography>
            {[
              { label: '🔥 Firebase FCM', status: 'Conectado', color: COLORS.green },
              { label: '🍎 Apple APNs', status: 'Conectado', color: COLORS.green },
              { label: '📧 AWS SES (Email)', status: 'Conectado', color: COLORS.green },
              { label: '🔌 WebSocket (Real-time)', status: 'Ativo', color: COLORS.green },
            ].map(canal => (
              <Box key={canal.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Switch defaultChecked sx={switchSx} />
                  <Typography variant="body2" sx={{ color: COLORS.white }}>{canal.label}</Typography>
                </Box>
                <Chip
                  label={`✅ ${canal.status}`}
                  size="small"
                  sx={{ bgcolor: `${canal.color}20`, color: canal.color, fontSize: 10 }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2.5, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, position: 'sticky', top: 80 }}>
            <Typography variant="h6" sx={{ color: COLORS.white, mb: 2 }}>Preview Push Notification</Typography>
            <Box sx={{ bgcolor: COLORS.raised, borderRadius: 2, p: 2, border: `1px solid ${COLORS.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box sx={{
                  width: 24, height: 24, bgcolor: COLORS.orange, borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <NotificationsActive sx={{ fontSize: 14, color: '#fff' }} />
                </Box>
                <Typography variant="caption" sx={{ color: COLORS.gray3, fontWeight: 600 }}>CheckIn Audiências</Typography>
                <Typography variant="caption" sx={{ color: COLORS.gray4, ml: 'auto' }}>agora</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: COLORS.white, fontWeight: 600, mb: 0.5 }}>
                ⏰ Audiência BACEN em 30 minutos
              </Typography>
              <Typography variant="caption" sx={{ color: COLORS.gray3 }}>Av. Paulista 1452 · Sala 304</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                {['Ver', '✅ Check-in'].map(btn => (
                  <Box key={btn} sx={{ px: 2, py: 0.5, bgcolor: COLORS.surface, borderRadius: 1, border: `1px solid ${COLORS.border}` }}>
                    <Typography variant="caption" sx={{ color: COLORS.orange, fontWeight: 600 }}>{btn}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
