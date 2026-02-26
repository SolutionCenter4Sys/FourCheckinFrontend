import { useState } from 'react'
import {
  Box, Typography, Grid, Paper, Radio, RadioGroup, FormControlLabel,
  FormControl, FormLabel, Switch, Button, Table, TableBody,
  TableCell, TableRow, Chip,
} from '@mui/material'
import { Download, Schedule } from '@mui/icons-material'
import { COLORS } from '../../theme'

const switchSx = {
  '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.orange },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: COLORS.orange },
}

const tiposExport = [
  { id: 'presencas',  label: 'Relatório de Presenças',       desc: 'Check-ins, participantes e taxas de presença' },
  { id: 'auditoria',  label: 'Log de Auditoria',             desc: 'Trilha completa de eventos SHA-256' },
  { id: 'questionarios', label: 'Respostas de Questionários', desc: 'Avaliações pós-audiência' },
  { id: 'usuarios',   label: 'Dados de Usuários/Perfis',     desc: 'Perfis RBAC e permissões' },
  { id: 'evidencias', label: 'Check-ins com Evidências GPS', desc: 'Inclui coordenadas e hashes' },
]

const historicoExports = [
  { nome: 'Presenças Q1',     formato: 'XLSX', tamanho: '1.2MB', status: 'concluido', data: '22/02 15:30' },
  { nome: 'Log Auditoria',    formato: 'CSV',  tamanho: '4.8MB', status: 'concluido', data: '22/02 10:00' },
  { nome: 'Questionários Jan', formato: 'XLSX', tamanho: '890KB', status: 'concluido', data: '21/02 09:15' },
  { nome: 'Full Export',      formato: 'JSON', tamanho: '12MB',  status: 'expirando', data: '20/02 16:00' },
]

export default function ExportacaoPage() {
  const [tipo, setTipo] = useState('presencas')
  const [formato, setFormato] = useState('xlsx')
  const [gps, setGps] = useState(true)
  const [sha, setSha] = useState(true)

  return (
    <Box>
      <Typography variant="h4" sx={{ color: COLORS.white, fontWeight: 800, mb: 3 }}>Exportação de Dados</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 2, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel sx={{ color: COLORS.white, fontWeight: 600, mb: 1, '&.Mui-focused': { color: COLORS.white } }}>
                📋 Tipo de Export
              </FormLabel>
              <RadioGroup value={tipo} onChange={e => setTipo(e.target.value)}>
                {tiposExport.map(t => (
                  <Box
                    key={t.id}
                    onClick={() => setTipo(t.id)}
                    sx={{
                      p: 1.5, mb: 1, borderRadius: 1.5, cursor: 'pointer',
                      bgcolor: tipo === t.id ? `${COLORS.orange}15` : COLORS.raised,
                      border: `2px solid ${tipo === t.id ? COLORS.orange : COLORS.border}`,
                    }}
                  >
                    <FormControlLabel
                      value={t.id}
                      control={<Radio sx={{ color: COLORS.border, '&.Mui-checked': { color: COLORS.orange } }} />}
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ color: COLORS.white, fontWeight: 500 }}>{t.label}</Typography>
                          <Typography variant="caption" sx={{ color: COLORS.gray3 }}>{t.desc}</Typography>
                        </Box>
                      }
                    />
                  </Box>
                ))}
              </RadioGroup>
            </FormControl>
          </Paper>

          <Paper sx={{ p: 3, mb: 2, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <Typography variant="h6" sx={{ color: COLORS.white, mb: 2 }}>📄 Formato</Typography>
            <RadioGroup row value={formato} onChange={e => setFormato(e.target.value)}>
              {['XLSX', 'CSV', 'PDF', 'JSON'].map(f => (
                <FormControlLabel
                  key={f}
                  value={f.toLowerCase()}
                  control={<Radio sx={{ '&.Mui-checked': { color: COLORS.orange } }} />}
                  label={f}
                  sx={{ color: COLORS.gray3 }}
                />
              ))}
            </RadioGroup>
          </Paper>

          <Paper sx={{ p: 3, mb: 2, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <Typography variant="h6" sx={{ color: COLORS.white, mb: 2 }}>🔐 Dados Sensíveis (LGPD)</Typography>
            <FormControlLabel
              control={<Switch checked={gps} onChange={e => setGps(e.target.checked)} sx={switchSx} />}
              label="Incluir coordenadas GPS"
              sx={{ color: COLORS.gray3, display: 'block', mb: 1 }}
            />
            <FormControlLabel
              control={<Switch checked={sha} onChange={e => setSha(e.target.checked)} sx={switchSx} />}
              label="Incluir hashes SHA-256 das evidências"
              sx={{ color: COLORS.gray3, display: 'block' }}
            />
          </Paper>

          <Button variant="contained" fullWidth size="large" startIcon={<Download />} sx={{ py: 1.5 }}>
            ⬇️ Gerar Export
          </Button>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2.5, mb: 2, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <Typography variant="h6" sx={{ color: COLORS.white, mb: 2 }}>Preview</Typography>
            <Box sx={{ bgcolor: COLORS.raised, borderRadius: 1, overflow: 'auto', mb: 2 }}>
              <Table size="small">
                <TableBody>
                  {['João Augusto Silva', 'Maria Rodrigues', 'Ana Oliveira'].map((n, i) => (
                    <TableRow key={i}>
                      <TableCell><Typography variant="caption" sx={{ color: COLORS.gray3 }}>{n}</Typography></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Typography variant="caption" sx={{ color: COLORS.gray3 }}>Estimativa: ~1.847 linhas · ~2.4 MB</Typography>
          </Paper>

          <Paper sx={{ p: 2.5, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <Typography variant="h6" sx={{ color: COLORS.white, mb: 2 }}>Histórico de Exports</Typography>
            {historicoExports.map((e, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: COLORS.white, fontWeight: 500 }}>{e.nome}</Typography>
                  <Typography variant="caption" sx={{ color: COLORS.gray3 }}>
                    {e.data} · {e.formato} · {e.tamanho}
                  </Typography>
                </Box>
                <Chip
                  label={e.status === 'concluido' ? '✅' : '⚠️'}
                  size="small"
                  sx={{
                    bgcolor: `${e.status === 'concluido' ? COLORS.green : COLORS.amber}20`,
                    color: e.status === 'concluido' ? COLORS.green : COLORS.amber,
                    minWidth: 32,
                  }}
                />
                <Button size="small" sx={{ color: COLORS.orange, minWidth: 0, px: 0.5 }}>⬇️</Button>
              </Box>
            ))}
          </Paper>

          <Paper sx={{ p: 2.5, mt: 2, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: COLORS.white, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Schedule sx={{ fontSize: 16 }} /> Export Agendado
              </Typography>
              <Switch size="small" sx={switchSx} />
            </Box>
            <Typography variant="caption" sx={{ color: COLORS.gray4 }}>Configure exportações automáticas recorrentes</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
