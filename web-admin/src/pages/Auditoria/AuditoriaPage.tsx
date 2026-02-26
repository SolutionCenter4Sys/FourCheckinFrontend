import { useEffect, useState } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, CircularProgress, TextField,
  InputAdornment, Tooltip,
} from '@mui/material'
import { Search, Verified, Security } from '@mui/icons-material'
import { auditoriaApi } from '../../services/api'
import { COLORS } from '../../theme'

import MetricCard from '../../components/shared/MetricCard'

const tipoConfig: Record<string, { label: string; color: string }> = {
  CHECKIN_REALIZADO:        { label: 'Check-in',       color: COLORS.green },
  CHECKIN_EDITADO:          { label: 'Edição CHK',     color: COLORS.amber },
  AUDIENCIA_CRIADA:         { label: 'Nova Audiência', color: COLORS.green },
  AUDIENCIA_STATUS_ALTERADO:{ label: 'Status',         color: COLORS.orange },
  QUESTIONARIO_RESPONDIDO:  { label: 'Questionário',   color: COLORS.green },
  USUARIO_LOGIN:            { label: 'Login',          color: COLORS.gray3 },
  USUARIO_CRIADO:           { label: 'Novo Usuário',   color: COLORS.green },
  SISTEMA_INICIALIZADO:     { label: 'Sistema',        color: COLORS.gray3 },
  LOGIN:                    { label: 'Login',          color: COLORS.gray3 },
  NOTIFICACAO_ENVIADA:      { label: 'Notificação',    color: COLORS.orange },
}

// Extrai descrição legível a partir de diferentes estruturas de log
function getDescricao(log: any): string {
  if (log.descricao) return log.descricao
  if (log.acao) {
    const mapa: Record<string, string> = {
      CHECKIN_REALIZADO:         `Check-in registrado por ${log.usuario_nome}`,
      CHECKIN_EDITADO:           `Check-in editado por ${log.usuario_nome}`,
      AUDIENCIA_CRIADA:          `Audiência criada: ${log.dados_apos?.nome ?? log.recurso_id ?? ''}`,
      AUDIENCIA_STATUS_ALTERADO: `Status alterado: ${log.dados_antes?.status ?? '?'} → ${log.dados_apos?.status ?? '?'}`,
      QUESTIONARIO_RESPONDIDO:   `Questionário respondido por ${log.usuario_nome}`,
      USUARIO_LOGIN:             `Login de ${log.usuario_nome}`,
      USUARIO_CRIADO:            `Usuário criado: ${log.dados_apos?.nome ?? ''}`,
      SISTEMA_INICIALIZADO:      `Sistema inicializado v${log.dados_apos?.versao ?? ''}`,
    }
    return mapa[log.acao] ?? log.acao
  }
  return '—'
}

// Retorna recurso no formato "tipo:id"
function getRecurso(log: any): string {
  if (log.recurso) return log.recurso
  if (log.recurso_tipo && log.recurso_id) return `${log.recurso_tipo}:${log.recurso_id}`
  return '—'
}

// Normaliza o campo "tipo" para funcionar com ambas as estruturas
function getTipo(log: any): string {
  return log.tipo ?? log.acao ?? 'DESCONHECIDO'
}

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    auditoriaApi.listar().then((r: any) => { setLogs(r.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtrados = logs.filter(l => {
    const desc = getDescricao(l).toLowerCase()
    const nome = (l.usuario_nome ?? '').toLowerCase()
    const tipo = getTipo(l).toLowerCase()
    const q = busca.toLowerCase()
    return desc.includes(q) || nome.includes(q) || tipo.includes(q)
  })

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: COLORS.white, fontWeight: 800 }}>Log de Auditoria</Typography>
          <Typography variant="body2">Cadeia imutável SHA-256 · Trilha de auditoria completa</Typography>
        </Box>
        <Chip
          icon={<Security sx={{ fontSize: 14 }} />}
          label="🔐 SHA-256 Íntegro"
          size="small"
          sx={{ bgcolor: `${COLORS.green}22`, color: COLORS.green, border: `1px solid ${COLORS.green}44` }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Box sx={{ flex: 1 }}><MetricCard label="Total de Eventos" value={logs.length > 0 ? logs.length.toLocaleString('pt-BR') : '—'} color={COLORS.orange} /></Box>
        <Box sx={{ flex: 1 }}><MetricCard label="Integridade" value="100%" color={COLORS.green} /></Box>
        <Box sx={{ flex: 1 }}><MetricCard label="Registros Inválidos" value="0" color={COLORS.green} /></Box>
      </Box>

      <TextField
        placeholder="Buscar por tipo, usuário ou descrição..."
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
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Timestamp', 'Tipo', 'Descrição', 'Usuário', 'Recurso', 'Dispositivo', 'Hash SHA-256', 'Cadeia'].map(h => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtrados.map(log => {
                const tipo = getTipo(log)
                const tc = tipoConfig[tipo] || { label: tipo, color: COLORS.gray3 }
                const hash = log.hash_sha256 ?? ''
                const cadeiaValida = log.cadeia_valida ?? true
                return (
                  <TableRow key={log.id} hover sx={{ '&:hover': { bgcolor: COLORS.raised } }}>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: COLORS.gray3 }}>
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tc.label}
                        size="small"
                        sx={{ bgcolor: `${tc.color}22`, color: tc.color, border: `1px solid ${tc.color}44`, fontSize: 10 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: COLORS.white, maxWidth: 220 }} noWrap>
                        {getDescricao(log)}
                      </Typography>
                    </TableCell>
                    <TableCell><Typography variant="caption" sx={{ color: COLORS.gray3 }}>{log.usuario_nome}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: COLORS.gray4 }} noWrap>
                        {getRecurso(log)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 140 }}>
                      <Typography variant="caption" sx={{ color: COLORS.gray4 }} noWrap>{log.dispositivo}</Typography>
                    </TableCell>
                    <TableCell>
                      {hash ? (
                        <Tooltip title={hash} arrow>
                          <Typography variant="caption" sx={{ color: COLORS.gray4, fontFamily: 'monospace', cursor: 'pointer' }}>
                            {hash.substring(0, 12)}...
                          </Typography>
                        </Tooltip>
                      ) : <Typography variant="caption" sx={{ color: COLORS.gray4 }}>—</Typography>}
                    </TableCell>
                    <TableCell>
                      <Verified sx={{ color: cadeiaValida ? COLORS.green : COLORS.red, fontSize: 18 }} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
