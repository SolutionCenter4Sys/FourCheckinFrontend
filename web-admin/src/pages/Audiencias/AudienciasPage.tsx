import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, LinearProgress,
  IconButton, CircularProgress, TextField, InputAdornment, Tooltip,
  Alert, Select, MenuItem, FormControl, InputLabel, Chip,
} from '@mui/material'
import {
  Add, Search, Visibility, Edit, LocationOn, Refresh, Upload,
  Videocam, FilterAlt, FilterAltOff,
} from '@mui/icons-material'
import { audienciasApi } from '../../services/api'
import { COLORS } from '../../theme'
import type { Audiencia } from '../../models/types'
import StatusChip from '../../components/shared/StatusChip'

// ─── Dados auxiliares para filtros (EP-08 / F-08.03) ─────────────────────────
const DEPARTAMENTOS = [
  'Jurídico Regulatório', 'Compliance e Regulatório', 'Risco de Crédito',
  'Risco Operacional', 'Auditoria Interna', 'Financeiro e Contabilidade', 'PLD/FT — Prevenção',
]

const FORUNS_SP = [
  'Fórum João Mendes Jr. (Centro)',
  'Fórum Regional de Santo Amaro',
  'Fórum Regional de Pinheiros',
  'Fórum Regional de Santana',
  'Fórum Regional da Penha',
  'Fórum Regional de Itaquera',
  'Fórum de Guarulhos',
  'Fórum de Santo André',
  'Fórum de São Bernardo do Campo',
  'Fórum de Osasco',
  'Fórum de Diadema',
  'Fórum de Mogi das Cruzes',
  'Fórum de Carapicuíba',
  'Fórum de Taboão da Serra',
  'Fórum de Barueri',
]

export default function AudienciasPage() {
  const [audiencias, setAudiencias] = useState<Audiencia[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // Filtros básicos
  const [busca, setBusca] = useState('')

  // Filtros avançados (EP-08 / F-08.03)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [filtroDataDe, setFiltroDataDe] = useState('')
  const [filtroDataAte, setFiltroDataAte] = useState('')
  const [filtroDepartamento, setFiltroDepartamento] = useState('')
  const [filtroForum, setFiltroForum] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroModalidade, setFiltroModalidade] = useState('')

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
        setErro(err?.message || 'Não foi possível carregar as audiências.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  const filtradas = useMemo(() => audiencias.filter(a => {
    const q = busca.toLowerCase()
    const matchBusca = !q ||
      a.nome.toLowerCase().includes(q) ||
      a.departamento.toLowerCase().includes(q) ||
      a.local.toLowerCase().includes(q)

    const matchDe = !filtroDataDe || a.data >= filtroDataDe
    const matchAte = !filtroDataAte || a.data <= filtroDataAte
    const matchDept = !filtroDepartamento || a.departamento === filtroDepartamento
    const matchForum = !filtroForum || a.local.toLowerCase().includes(filtroForum.toLowerCase().split(' ')[1] ?? filtroForum)
    const matchStatus = !filtroStatus || a.status === filtroStatus
    const matchModal = !filtroModalidade || (filtroModalidade === 'remota' ? !!(a as any).link_remoto : !(a as any).link_remoto)

    return matchBusca && matchDe && matchAte && matchDept && matchForum && matchStatus && matchModal
  }), [audiencias, busca, filtroDataDe, filtroDataAte, filtroDepartamento, filtroForum, filtroStatus, filtroModalidade])

  const filtrosAtivos = !!(busca || filtroDataDe || filtroDataAte || filtroDepartamento || filtroForum || filtroStatus || filtroModalidade)

  const limparFiltros = () => {
    setBusca('')
    setFiltroDataDe('')
    setFiltroDataAte('')
    setFiltroDepartamento('')
    setFiltroForum('')
    setFiltroStatus('')
    setFiltroModalidade('')
  }

  return (
    <Box>
      {/* ── Cabeçalho ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: COLORS.white, fontWeight: 800 }}>Audiências</Typography>
          {!loading && (
            <Typography variant="caption" sx={{ color: COLORS.gray3 }}>
              {filtradas.length} de {audiencias.length} audiências
              {filtrosAtivos && <Chip label="Filtros ativos" size="small" sx={{ ml: 1, bgcolor: `${COLORS.orange}22`, color: COLORS.orange, fontSize: 10, height: 18 }} />}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            sx={{ color: COLORS.gray3, borderColor: COLORS.border }}
            onClick={() => navigate('/upload')}
          >
            Upload Audiências
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/audiencias/nova')}>
            Nova Audiência
          </Button>
        </Box>
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

      {/* ── Barra de busca + botão de filtros ── */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: mostrarFiltros ? 1.5 : 2 }}>
        <TextField
          placeholder="Buscar audiência, departamento ou local..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          fullWidth
          size="small"
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: COLORS.gray3 }} /></InputAdornment> }}
        />
        <Button
          variant={mostrarFiltros ? 'contained' : 'outlined'}
          startIcon={mostrarFiltros ? <FilterAltOff /> : <FilterAlt />}
          onClick={() => setMostrarFiltros(v => !v)}
          sx={{ whiteSpace: 'nowrap', borderColor: COLORS.border, color: mostrarFiltros ? '#fff' : COLORS.gray3 }}
        >
          Filtros{filtrosAtivos && !mostrarFiltros ? ' •' : ''}
        </Button>
        {filtrosAtivos && (
          <Button size="small" sx={{ color: COLORS.gray3, whiteSpace: 'nowrap' }} onClick={limparFiltros}>
            Limpar
          </Button>
        )}
      </Box>

      {/* ── Painel de filtros avançados (EP-08 / F-08.03) ── */}
      {mostrarFiltros && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Data de" type="date" size="small" InputLabelProps={{ shrink: true }}
            value={filtroDataDe} onChange={e => setFiltroDataDe(e.target.value)}
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="Data até" type="date" size="small" InputLabelProps={{ shrink: true }}
            value={filtroDataAte} onChange={e => setFiltroDataAte(e.target.value)}
            sx={{ minWidth: 150 }}
          />
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Departamento</InputLabel>
            <Select value={filtroDepartamento} label="Departamento" onChange={e => setFiltroDepartamento(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              {DEPARTAMENTOS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel>Fórum / Local</InputLabel>
            <Select value={filtroForum} label="Fórum / Local" onChange={e => setFiltroForum(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              {FORUNS_SP.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={filtroStatus} label="Status" onChange={e => setFiltroStatus(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="agendada">Agendada</MenuItem>
              <MenuItem value="em_andamento">Em andamento</MenuItem>
              <MenuItem value="encerrada">Encerrada</MenuItem>
              <MenuItem value="cancelada">Cancelada</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Modalidade</InputLabel>
            <Select value={filtroModalidade} label="Modalidade" onChange={e => setFiltroModalidade(e.target.value)}>
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="presencial">Presencial</MenuItem>
              <MenuItem value="remota">Remota 🎥</MenuItem>
            </Select>
          </FormControl>
        </Paper>
      )}

      {/* ── Tabela ── */}
      {loading ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}><CircularProgress sx={{ color: COLORS.orange }} /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
          <Table>
            <TableHead>
              <TableRow>
                {['Nome / Processo', 'Departamento', 'Data', 'Horário', 'Local / Fórum', 'Modalidade', 'Presença', 'Status', 'Ações'].map(h => (
                  <TableCell key={h} sx={{ color: COLORS.gray3, fontWeight: 600, fontSize: 12 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtradas.map(a => {
                const linkRemoto = (a as any).link_remoto as string | undefined
                const isRemota = !!linkRemoto
                return (
                  <TableRow key={a.id} hover sx={{ '&:hover': { bgcolor: COLORS.raised } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: COLORS.white, fontWeight: 500 }}>{a.nome}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: COLORS.gray3 }}>{a.departamento}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(a.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{a.horario_inicio} – {a.horario_fim}</Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 180, maxWidth: 220 }}>
                      <Tooltip title={a.local} placement="top" arrow>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                            <LocationOn sx={{ fontSize: 13, color: COLORS.gray4, mt: '1px', flexShrink: 0 }} />
                            <Typography
                              variant="caption"
                              sx={{
                                color: COLORS.gray3, lineHeight: 1.4,
                                display: '-webkit-box', WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical', overflow: 'hidden',
                              }}
                            >
                              {a.local.includes(' — ') ? a.local.split(' — ')[0] : a.local}
                            </Typography>
                          </Box>
                          {a.local.includes(' — ') && (
                            <Typography variant="caption" sx={{ color: COLORS.gray4, fontSize: '0.7rem', pl: 2.5 }}>
                              {a.local.split(' — ').slice(1).join(' — ')}
                            </Typography>
                          )}
                        </Box>
                      </Tooltip>
                    </TableCell>

                    {/* ── Badge de modalidade (EP-08 / F-08.05) ── */}
                    <TableCell>
                      {isRemota ? (
                        <Tooltip title={`Audiência remota — ${linkRemoto}`} placement="top" arrow>
                          <Chip
                            icon={<Videocam sx={{ fontSize: 13 }} />}
                            label="Remota"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(167,139,250,0.15)',
                              color: '#A78BFA',
                              fontWeight: 600, fontSize: 11,
                              border: '1px solid rgba(167,139,250,0.3)',
                              cursor: 'pointer',
                            }}
                            onClick={() => window.open(linkRemoto, '_blank')}
                          />
                        </Tooltip>
                      ) : (
                        <Chip label="Presencial" size="small" sx={{ bgcolor: `${COLORS.orange}12`, color: COLORS.orange, fontSize: 11 }} />
                      )}
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
                )
              })}
              {filtradas.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4, color: COLORS.gray3 }}>
                    {filtrosAtivos ? 'Nenhuma audiência encontrada para os filtros selecionados.' : 'Nenhuma audiência cadastrada.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
