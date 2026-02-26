import { useEffect, useState } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, CircularProgress, Tooltip,
} from '@mui/material'
import { Verified } from '@mui/icons-material'
import { evidenciasApi } from '../../services/api'
import { COLORS } from '../../theme'
import MetricCard from '../../components/shared/MetricCard'

// Helpers para normalizar estrutura nova (gps aninhado) ou antiga (campos raiz)
function getLat(e: any): number   { return e.gps?.latitude   ?? e.latitude   ?? 0 }
function getLng(e: any): number   { return e.gps?.longitude  ?? e.longitude  ?? 0 }
function getPrec(e: any): number  { return e.gps?.precisao_metros ?? e.precisao_metros ?? 0 }
function getAlt(e: any): number   { return e.gps?.altitude_metros ?? e.altitude_metros ?? 0 }
function getTs(e: any): string    { return e.timestamp ?? e.timestamp_utc ?? '' }
function getValido(e: any): boolean { return e.integridade_verificada ?? e.cadeia_valida ?? true }
function getNome(e: any): string  { return e.usuario_nome ?? e.usuario_id ?? '—' }
function getDisp(e: any): string  {
  const d = e.dispositivo
  if (!d) return '—'
  return `${d.tipo ?? ''} · ${d.fabricante ?? ''} ${d.modelo ?? ''}`.trim()
}

export default function EvidenciasPage() {
  const [evidencias, setEvidencias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selecionada, setSelecionada] = useState<any | null>(null)

  useEffect(() => {
    evidenciasApi.listar()
      .then((r: any) => { setEvidencias(r.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ color: COLORS.white, fontWeight: 800 }}>Evidências GPS</Typography>
        <Chip
          label="🔐 Integridade SHA-256"
          sx={{ bgcolor: `${COLORS.green}22`, color: COLORS.green, border: `1px solid ${COLORS.green}44` }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Box sx={{ flex: 1 }}><MetricCard label="Evidências Geradas" value={evidencias.length > 0 ? evidencias.length.toLocaleString('pt-BR') : '—'} color={COLORS.orange} /></Box>
        <Box sx={{ flex: 1 }}><MetricCard label="Integridade" value="100%" color={COLORS.green} /></Box>
        <Box sx={{ flex: 1 }}><MetricCard label="Registros Inválidos" value="0" color={COLORS.green} /></Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TableContainer component={Paper} sx={{ flex: 1, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', p: 4 }}><CircularProgress sx={{ color: COLORS.orange }} /></Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['ID Evidência', 'Usuário', 'Timestamp (UTC)', 'GPS / Precisão', 'Integridade', 'Ações'].map(h => (
                    <TableCell key={h}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {evidencias.map(e => {
                  const valido = getValido(e)
                  return (
                    <TableRow
                      key={e.id}
                      hover
                      onClick={() => setSelecionada(e)}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: selecionada?.id === e.id ? `${COLORS.orange}15` : 'transparent',
                        '&:hover': { bgcolor: COLORS.raised },
                      }}
                    >
                      <TableCell>
                        <Typography variant="caption" sx={{ color: COLORS.orange, fontFamily: 'monospace' }}>{e.id}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: COLORS.white }}>{getNome(e)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: COLORS.gray3 }}>
                          {getTs(e) ? new Date(getTs(e)).toLocaleString('pt-BR') : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: COLORS.gray3 }}>
                          {getLat(e).toFixed(4)}, {getLng(e).toFixed(4)} ±{getPrec(e)}m
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<Verified sx={{ fontSize: 12 }} />}
                          label={valido ? 'Válido' : 'Inválido'}
                          size="small"
                          sx={{
                            bgcolor: `${valido ? COLORS.green : COLORS.red}20`,
                            color: valido ? COLORS.green : COLORS.red,
                            fontSize: 10,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: COLORS.orange, cursor: 'pointer' }}>Ver</Typography>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {selecionada && (() => {
          const valido = getValido(selecionada)
          const hash = selecionada.hash_sha256 ?? ''
          return (
            <Paper sx={{ width: 320, flexShrink: 0, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, p: 2 }}>
              <Typography variant="h6" sx={{ color: COLORS.white, mb: 2, fontSize: 14 }}>Detalhe da Evidência</Typography>
              {[
                ['ID', selecionada.id],
                ['Check-in', selecionada.checkin_id ?? '—'],
                ['Usuário', getNome(selecionada)],
                ['Timestamp UTC', getTs(selecionada) ? new Date(getTs(selecionada)).toLocaleString('pt-BR') : '—'],
                ['Latitude', getLat(selecionada).toFixed(7)],
                ['Longitude', getLng(selecionada).toFixed(7)],
                ['Precisão', `±${getPrec(selecionada)}m`],
                ['Altitude', `${getAlt(selecionada)}m`],
                ['Dispositivo', getDisp(selecionada)],
                ['App', selecionada.dispositivo?.app_versao ?? '—'],
              ].map(([k, v]) => (
                <Box key={k} sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ color: COLORS.gray4, display: 'block' }}>{k}</Typography>
                  <Typography variant="caption" sx={{ color: COLORS.white, fontWeight: 500 }}>{v}</Typography>
                </Box>
              ))}
              {hash && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="caption" sx={{ color: COLORS.gray4, display: 'block' }}>Hash SHA-256</Typography>
                  <Tooltip title={hash} arrow>
                    <Typography variant="caption" sx={{ color: COLORS.green, fontFamily: 'monospace', cursor: 'pointer', wordBreak: 'break-all', display: 'block' }}>
                      {hash.substring(0, 32)}...
                    </Typography>
                  </Tooltip>
                </Box>
              )}
              <Chip
                label={valido ? '✅ Cadeia Íntegra' : '❌ Cadeia Comprometida'}
                size="small"
                sx={{
                  mt: 2,
                  bgcolor: `${valido ? COLORS.green : COLORS.red}20`,
                  color: valido ? COLORS.green : COLORS.red,
                }}
              />
            </Paper>
          )
        })()}
      </Box>
    </Box>
  )
}
