import { useState, useMemo } from 'react'
import {
  Box, Typography, Paper, Grid, Chip, TextField, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, Accordion, AccordionSummary,
  AccordionDetails, Table, TableBody, TableCell, TableHead, TableRow,
  Divider,
} from '@mui/material'
import {
  Search, ExpandMore, Apartment, MeetingRoom,
  LocationOn, Phone, Email,
} from '@mui/icons-material'
import { COLORS } from '../../theme'
import type { Forum, TipoSalaForum } from '../../models/types'

// ─── Mock — 15 Fóruns da Grande SP (carga inicial EP-08 / F-08.04) ──────────

const MOCK_FORUNS: Forum[] = [
  {
    id: 'forum-01', sigla: 'FJMJ', nome: 'Fórum João Mendes Jr.',
    endereco: 'Praça João Mendes, s/n', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP', cep: '01501-900',
    telefone: '(11) 3150-0100', email: 'fjmj@tjsp.jus.br', ativo: true,
    salas: [
      { id: 's01-01', numero: '1', nome: '1ª Vara do Trabalho', andar: 1, tipo: 'VARA', capacidade: 30 },
      { id: 's01-02', numero: '2', nome: '2ª Vara do Trabalho', andar: 1, tipo: 'VARA', capacidade: 30 },
      { id: 's01-03', numero: '101', nome: 'Plenário Central', andar: 1, tipo: 'PLENARIO', capacidade: 80 },
      { id: 's01-04', numero: '201', nome: '1ª Vara Cível', andar: 2, tipo: 'VARA', capacidade: 25 },
      { id: 's01-05', numero: '202', nome: '2ª Vara Cível', andar: 2, tipo: 'VARA', capacidade: 25 },
      { id: 's01-06', numero: '301', nome: 'Auditório Especial', andar: 3, tipo: 'AUDITORIO', capacidade: 50 },
    ],
  },
  {
    id: 'forum-02', sigla: 'FRSA', nome: 'Fórum Regional de Santo Amaro',
    endereco: 'Av. Adolfo Pinheiro, 1992', bairro: 'Santo Amaro', cidade: 'São Paulo', estado: 'SP', cep: '04734-000',
    telefone: '(11) 5182-4000', email: 'frsa@tjsp.jus.br', ativo: true,
    salas: [
      { id: 's02-01', numero: '1', nome: '1ª Vara do Trabalho', andar: 1, tipo: 'VARA', capacidade: 20 },
      { id: 's02-02', numero: '2', nome: '2ª Vara Cível', andar: 1, tipo: 'VARA', capacidade: 20 },
      { id: 's02-03', numero: '101', nome: 'Plenário', andar: 1, tipo: 'PLENARIO', capacidade: 60 },
      { id: 's02-04', numero: '201', nome: '1ª Vara de Família', andar: 2, tipo: 'VARA', capacidade: 20 },
      { id: 's02-05', numero: 'VR-01', nome: 'Sala Virtual 1', andar: 2, tipo: 'SALA_VIRTUAL' },
    ],
  },
  {
    id: 'forum-03', sigla: 'FRP', nome: 'Fórum Regional de Pinheiros',
    endereco: 'Rua Sumidouro, 487', bairro: 'Pinheiros', cidade: 'São Paulo', estado: 'SP', cep: '05403-000',
    telefone: '(11) 3816-0900', email: 'frp@tjsp.jus.br', ativo: true,
    salas: [
      { id: 's03-01', numero: '1', nome: '1ª Vara Criminal', andar: 1, tipo: 'VARA', capacidade: 25 },
      { id: 's03-02', numero: '2', nome: '2ª Vara Criminal', andar: 1, tipo: 'VARA', capacidade: 25 },
      { id: 's03-03', numero: '101', nome: 'Plenário', andar: 1, tipo: 'PLENARIO', capacidade: 70 },
      { id: 's03-04', numero: 'VR-01', nome: 'Sala Virtual 1', andar: 2, tipo: 'SALA_VIRTUAL' },
    ],
  },
  {
    id: 'forum-04', sigla: 'FRSAN', nome: 'Fórum Regional de Santana',
    endereco: 'Av. Luís Dumont Villares, 255', bairro: 'Santana', cidade: 'São Paulo', estado: 'SP', cep: '02063-000',
    telefone: '(11) 2282-3400', email: 'frsan@tjsp.jus.br', ativo: true,
    salas: [
      { id: 's04-01', numero: '1', nome: '1ª Vara do Trabalho', andar: 1, tipo: 'VARA', capacidade: 20 },
      { id: 's04-02', numero: '2', nome: '1ª Vara Cível', andar: 1, tipo: 'VARA', capacidade: 20 },
      { id: 's04-03', numero: '201', nome: 'Auditório', andar: 2, tipo: 'AUDITORIO', capacidade: 45 },
      { id: 's04-04', numero: 'VR-01', nome: 'Sala Virtual', andar: 2, tipo: 'SALA_VIRTUAL' },
    ],
  },
  {
    id: 'forum-05', sigla: 'FRPEN', nome: 'Fórum Regional da Penha',
    endereco: 'Rua Cinira, 45', bairro: 'Penha', cidade: 'São Paulo', estado: 'SP', cep: '03630-020',
    telefone: '(11) 2291-5500', email: 'frpenha@tjsp.jus.br', ativo: true,
    salas: [
      { id: 's05-01', numero: '1', nome: '1ª Vara Trabalhista', andar: 1, tipo: 'VARA', capacidade: 20 },
      { id: 's05-02', numero: '2', nome: '2ª Vara Cível', andar: 1, tipo: 'VARA', capacidade: 20 },
      { id: 's05-03', numero: '3', nome: '1ª Vara de Família', andar: 2, tipo: 'VARA', capacidade: 20 },
    ],
  },
  {
    id: 'forum-06', sigla: 'FRIT', nome: 'Fórum Regional de Itaquera',
    endereco: 'Av. Nagib Farah Maluf, 400', bairro: 'Itaquera', cidade: 'São Paulo', estado: 'SP', cep: '08290-000',
    telefone: '(11) 2079-2400', email: 'frit@tjsp.jus.br', ativo: true,
    salas: [
      { id: 's06-01', numero: '1', nome: '1ª Vara do Trabalho', andar: 1, tipo: 'VARA', capacidade: 20 },
      { id: 's06-02', numero: '2', nome: '1ª Vara Criminal', andar: 1, tipo: 'VARA', capacidade: 25 },
      { id: 's06-03', numero: 'VR-01', nome: 'Sala Virtual 1', andar: 2, tipo: 'SALA_VIRTUAL' },
    ],
  },
  {
    id: 'forum-07', sigla: 'FGU', nome: 'Fórum de Guarulhos',
    endereco: 'Rua Sete de Setembro, 1655', bairro: 'Centro', cidade: 'Guarulhos', estado: 'SP', cep: '07043-001',
    telefone: '(11) 2473-8000', email: 'fgu@tjsp.jus.br', ativo: true,
    salas: [
      { id: 's07-01', numero: '1', nome: '1ª Vara do Trabalho', andar: 1, tipo: 'VARA', capacidade: 30 },
      { id: 's07-02', numero: '2', nome: '2ª Vara do Trabalho', andar: 1, tipo: 'VARA', capacidade: 30 },
      { id: 's07-03', numero: '101', nome: 'Plenário', andar: 1, tipo: 'PLENARIO', capacidade: 80 },
      { id: 's07-04', numero: '201', nome: '1ª Vara Criminal', andar: 2, tipo: 'VARA', capacidade: 25 },
      { id: 's07-05', numero: '202', nome: '2ª Vara Criminal', andar: 2, tipo: 'VARA', capacidade: 25 },
    ],
  },
  {
    id: 'forum-08', sigla: 'FSA', nome: 'Fórum de Santo André',
    endereco: 'Rua Coronel Oliveira Lima, 89', bairro: 'Centro', cidade: 'Santo André', estado: 'SP', cep: '09010-081',
    telefone: '(11) 4433-5000', email: 'fsa@tjsp.jus.br', ativo: true,
    salas: [
      { id: 's08-01', numero: '1', nome: '1ª Vara do Trabalho', andar: 1, tipo: 'VARA', capacidade: 25 },
      { id: 's08-02', numero: '2', nome: '2ª Vara do Trabalho', andar: 1, tipo: 'VARA', capacidade: 25 },
      { id: 's08-03', numero: '101', nome: 'Plenário', andar: 1, tipo: 'PLENARIO', capacidade: 60 },
      { id: 's08-04', numero: '201', nome: '1ª Vara Cível', andar: 2, tipo: 'VARA', capacidade: 20 },
    ],
  },
  {
    id: 'forum-09', sigla: 'FSBC', nome: 'Fórum de São Bernardo do Campo',
    endereco: 'Av. Senador Vergueiro, 202', bairro: 'Centro', cidade: 'São Bernardo do Campo', estado: 'SP', cep: '09750-000',
    telefone: '(11) 4122-9000', email: 'fsbc@tjsp.jus.br', ativo: true,
    salas: [
      { id: 's09-01', numero: '1', nome: '1ª Vara Trabalhista', andar: 1, tipo: 'VARA', capacidade: 25 },
      { id: 's09-02', numero: '2', nome: '2ª Vara Trabalhista', andar: 1, tipo: 'VARA', capacidade: 25 },
      { id: 's09-03', numero: '3', nome: '1ª Vara Criminal', andar: 2, tipo: 'VARA', capacidade: 25 },
      { id: 's09-04', numero: '4', nome: 'Sala de Conciliação', andar: 2, tipo: 'AUDITORIO', capacidade: 30 },
    ],
  },
  {
    id: 'forum-10', sigla: 'FOS', nome: 'Fórum de Osasco',
    endereco: 'Rua Avelar Peixoto, 85', bairro: 'Centro', cidade: 'Osasco', estado: 'SP', cep: '06018-190',
    telefone: '(11) 3601-3600', email: 'fos@tjsp.jus.br', ativo: true,
    salas: [
      { id: 's10-01', numero: '1', nome: '1ª Vara Trabalhista', andar: 1, tipo: 'VARA', capacidade: 25 },
      { id: 's10-02', numero: '2', nome: '1ª Vara Cível', andar: 1, tipo: 'VARA', capacidade: 20 },
      { id: 's10-03', numero: 'VR-01', nome: 'Sala Virtual 1', andar: 2, tipo: 'SALA_VIRTUAL' },
    ],
  },
  {
    id: 'forum-11', sigla: 'FDI', nome: 'Fórum de Diadema',
    endereco: 'Av. Antônio Piranga, 1100', bairro: 'Centro', cidade: 'Diadema', estado: 'SP', cep: '09920-670',
    telefone: '(11) 4056-5000', email: 'fdi@tjsp.jus.br', ativo: true,
    salas: [
      { id: 's11-01', numero: '1', nome: '1ª Vara do Trabalho', andar: 1, tipo: 'VARA', capacidade: 20 },
      { id: 's11-02', numero: '2', nome: '2ª Vara Cível', andar: 1, tipo: 'VARA', capacidade: 20 },
      { id: 's11-03', numero: '201', nome: 'Plenário', andar: 2, tipo: 'PLENARIO', capacidade: 50 },
    ],
  },
  {
    id: 'forum-12', sigla: 'FMC', nome: 'Fórum de Mogi das Cruzes',
    endereco: 'Av. Francisco Ferreira Lopes, 135', bairro: 'Centro', cidade: 'Mogi das Cruzes', estado: 'SP', cep: '08710-380',
    telefone: '(11) 4798-5000', email: 'fmc@tjsp.jus.br', ativo: true,
    salas: [
      { id: 's12-01', numero: '1', nome: '1ª Vara Trabalhista', andar: 1, tipo: 'VARA', capacidade: 20 },
      { id: 's12-02', numero: '2', nome: '1ª Vara Criminal', andar: 1, tipo: 'VARA', capacidade: 25 },
      { id: 's12-03', numero: '3', nome: '1ª Vara de Família', andar: 2, tipo: 'VARA', capacidade: 20 },
    ],
  },
  {
    id: 'forum-13', sigla: 'FCA', nome: 'Fórum de Carapicuíba',
    endereco: 'Rua José Manfré, 220', bairro: 'Centro', cidade: 'Carapicuíba', estado: 'SP', cep: '06320-000',
    telefone: '(11) 4186-4500', email: 'fca@tjsp.jus.br', ativo: true,
    salas: [
      { id: 's13-01', numero: '1', nome: '1ª Vara do Trabalho', andar: 1, tipo: 'VARA', capacidade: 20 },
      { id: 's13-02', numero: '2', nome: '1ª Vara Cível', andar: 1, tipo: 'VARA', capacidade: 20 },
      { id: 's13-03', numero: 'VR-01', nome: 'Sala Virtual', andar: 1, tipo: 'SALA_VIRTUAL' },
    ],
  },
  {
    id: 'forum-14', sigla: 'FTS', nome: 'Fórum de Taboão da Serra',
    endereco: 'Rua da Independência, 100', bairro: 'Centro', cidade: 'Taboão da Serra', estado: 'SP', cep: '06765-000',
    telefone: '(11) 4787-9100', email: 'fts@tjsp.jus.br', ativo: true,
    salas: [
      { id: 's14-01', numero: '1', nome: '1ª Vara Trabalhista', andar: 1, tipo: 'VARA', capacidade: 20 },
      { id: 's14-02', numero: '2', nome: '2ª Vara Cível', andar: 1, tipo: 'VARA', capacidade: 20 },
    ],
  },
  {
    id: 'forum-15', sigla: 'FBA', nome: 'Fórum de Barueri',
    endereco: 'Av. Henriqueta Mendes Guerra, 550', bairro: 'Centro', cidade: 'Barueri', estado: 'SP', cep: '06401-025',
    telefone: '(11) 4198-7000', email: 'fba@tjsp.jus.br', ativo: true,
    salas: [
      { id: 's15-01', numero: '1', nome: '1ª Vara do Trabalho', andar: 1, tipo: 'VARA', capacidade: 25 },
      { id: 's15-02', numero: '2', nome: '2ª Vara do Trabalho', andar: 1, tipo: 'VARA', capacidade: 25 },
      { id: 's15-03', numero: '101', nome: 'Plenário', andar: 1, tipo: 'PLENARIO', capacidade: 65 },
      { id: 's15-04', numero: '201', nome: '1ª Vara Criminal', andar: 2, tipo: 'VARA', capacidade: 25 },
      { id: 's15-05', numero: 'VR-01', nome: 'Sala Virtual 1', andar: 2, tipo: 'SALA_VIRTUAL' },
    ],
  },
]

// ─── Configuração visual por tipo de sala ────────────────────────────────────
const SALA_CONFIG: Record<TipoSalaForum, { label: string; color: string }> = {
  VARA:        { label: 'Vara',         color: '#3B82F6' },
  PLENARIO:    { label: 'Plenário',     color: COLORS.orange },
  AUDITORIO:   { label: 'Auditório',    color: '#4ADE80' },
  SALA_VIRTUAL:{ label: 'Sala Virtual', color: '#A78BFA' },
}

// ─── Componente principal ──────────────────────────────────────────────────
export default function ForunsPage() {
  const [busca, setBusca] = useState('')
  const [filtroCidade, setFiltroCidade] = useState('')
  const [expandido, setExpandido] = useState<string | false>(false)

  const cidades = useMemo(() => [...new Set(MOCK_FORUNS.map(f => f.cidade))].sort(), [])

  const filtrados = useMemo(() => MOCK_FORUNS.filter(f => {
    const q = busca.toLowerCase()
    const matchBusca = !q || f.nome.toLowerCase().includes(q) || f.sigla.toLowerCase().includes(q) || f.bairro.toLowerCase().includes(q)
    const matchCidade = !filtroCidade || f.cidade === filtroCidade
    return matchBusca && matchCidade
  }), [busca, filtroCidade])

  // Agrupar por cidade
  const porCidade = useMemo(() => {
    const map: Record<string, Forum[]> = {}
    filtrados.forEach(f => {
      if (!map[f.cidade]) map[f.cidade] = []
      map[f.cidade].push(f)
    })
    return map
  }, [filtrados])

  return (
    <Box>
      {/* ── Cabeçalho ── */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ color: COLORS.white, fontWeight: 800 }}>Fóruns</Typography>
        <Typography variant="body2" sx={{ color: COLORS.gray3, mt: 0.5 }}>
          {MOCK_FORUNS.length} fóruns cadastrados na Grande SP · Carga inicial EP-08
        </Typography>
      </Box>

      {/* ── Cards de resumo ── */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Fóruns', value: MOCK_FORUNS.length, color: COLORS.orange },
          { label: 'Salas / Varas', value: MOCK_FORUNS.reduce((s, f) => s + f.salas.length, 0), color: '#3B82F6' },
          { label: 'Cidades', value: cidades.length, color: '#4ADE80' },
          { label: 'Salas Virtuais', value: MOCK_FORUNS.reduce((s, f) => s + f.salas.filter(sl => sl.tipo === 'SALA_VIRTUAL').length, 0), color: '#A78BFA' },
        ].map(c => (
          <Paper key={c.label} sx={{ px: 3, py: 2, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, flex: '1 1 130px' }}>
            <Typography variant="h5" sx={{ color: c.color, fontWeight: 800 }}>{c.value}</Typography>
            <Typography variant="caption" sx={{ color: COLORS.gray3 }}>{c.label}</Typography>
          </Paper>
        ))}
      </Box>

      {/* ── Filtros ── */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Buscar fórum ou sigla..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          size="small"
          sx={{ flex: '1 1 260px' }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: COLORS.gray3, fontSize: 18 }} /></InputAdornment> }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Cidade</InputLabel>
          <Select value={filtroCidade} label="Cidade" onChange={e => setFiltroCidade(e.target.value)}>
            <MenuItem value="">Todas as cidades</MenuItem>
            {cidades.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {/* ── Lista agrupada por cidade ── */}
      {Object.entries(porCidade).map(([cidade, foruns]) => (
        <Box key={cidade} sx={{ mb: 3 }}>
          <Typography variant="overline" sx={{ color: COLORS.gray3, fontWeight: 700, letterSpacing: 2, mb: 1, display: 'block' }}>
            {cidade} — {foruns.length} {foruns.length === 1 ? 'fórum' : 'fóruns'}
          </Typography>
          <Grid container spacing={2}>
            {foruns.map(forum => (
              <Grid item xs={12} md={6} key={forum.id}>
                <Accordion
                  expanded={expandido === forum.id}
                  onChange={(_, isOpen) => setExpandido(isOpen ? forum.id : false)}
                  sx={{
                    bgcolor: COLORS.surface,
                    border: `1px solid ${expandido === forum.id ? COLORS.orange : COLORS.border}`,
                    borderRadius: '8px !important',
                    '&:before': { display: 'none' },
                    boxShadow: 'none',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore sx={{ color: COLORS.gray3 }} />}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1 }}>
                      <Box sx={{ bgcolor: `${COLORS.orange}18`, p: 1, borderRadius: 1 }}>
                        <Apartment sx={{ color: COLORS.orange, fontSize: 20 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ color: COLORS.white, fontWeight: 700 }}>
                            {forum.nome}
                          </Typography>
                          <Chip label={forum.sigla} size="small" sx={{ bgcolor: `${COLORS.orange}22`, color: COLORS.orange, fontSize: 10, fontWeight: 700, height: 18 }} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                          <LocationOn sx={{ fontSize: 11, color: COLORS.gray4 }} />
                          <Typography variant="caption" sx={{ color: COLORS.gray4 }}>
                            {forum.bairro} · {forum.endereco}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                          {(['VARA','PLENARIO','AUDITORIO','SALA_VIRTUAL'] as TipoSalaForum[]).map(tipo => {
                            const count = forum.salas.filter(s => s.tipo === tipo).length
                            if (!count) return null
                            const cfg = SALA_CONFIG[tipo]
                            return (
                              <Chip key={tipo} label={`${count} ${cfg.label}${count > 1 ? 's' : ''}`} size="small"
                                sx={{ bgcolor: `${cfg.color}12`, color: cfg.color, fontSize: 10, height: 18 }} />
                            )
                          })}
                        </Box>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Divider sx={{ borderColor: COLORS.border, mb: 1.5 }} />

                    {/* Contatos */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                      {forum.telefone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Phone sx={{ fontSize: 13, color: COLORS.gray4 }} />
                          <Typography variant="caption" sx={{ color: COLORS.gray3 }}>{forum.telefone}</Typography>
                        </Box>
                      )}
                      {forum.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Email sx={{ fontSize: 13, color: COLORS.gray4 }} />
                          <Typography variant="caption" sx={{ color: COLORS.gray3 }}>{forum.email}</Typography>
                        </Box>
                      )}
                      <Typography variant="caption" sx={{ color: COLORS.gray4 }}>CEP: {forum.cep}</Typography>
                    </Box>

                    {/* Tabela de salas */}
                    <Typography variant="caption" sx={{ color: COLORS.gray3, fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MeetingRoom sx={{ fontSize: 14 }} /> Salas e Varas ({forum.salas.length})
                    </Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {['Nº', 'Nome', 'Andar', 'Tipo', 'Capacidade'].map(h => (
                            <TableCell key={h} sx={{ color: COLORS.gray4, fontSize: 11, fontWeight: 600, py: 0.5, borderColor: COLORS.border }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {forum.salas.map(sala => {
                          const cfg = SALA_CONFIG[sala.tipo]
                          return (
                            <TableRow key={sala.id} sx={{ '&:last-child td': { border: 0 } }}>
                              <TableCell sx={{ color: COLORS.white, fontSize: 12, py: 0.75, borderColor: COLORS.border }}>{sala.numero}</TableCell>
                              <TableCell sx={{ color: COLORS.gray3, fontSize: 12, py: 0.75, borderColor: COLORS.border }}>{sala.nome ?? '—'}</TableCell>
                              <TableCell sx={{ color: COLORS.gray3, fontSize: 12, py: 0.75, borderColor: COLORS.border }}>{sala.andar}º</TableCell>
                              <TableCell sx={{ py: 0.75, borderColor: COLORS.border }}>
                                <Chip label={cfg.label} size="small"
                                  sx={{ bgcolor: `${cfg.color}18`, color: cfg.color, fontSize: 10, height: 18, fontWeight: 600 }} />
                              </TableCell>
                              <TableCell sx={{ color: COLORS.gray4, fontSize: 12, py: 0.75, borderColor: COLORS.border }}>
                                {sala.capacidade ? `${sala.capacidade} lugares` : '—'}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {filtrados.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography sx={{ color: COLORS.gray3 }}>Nenhum fórum encontrado para os filtros selecionados.</Typography>
        </Box>
      )}
    </Box>
  )
}
