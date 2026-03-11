import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import type { SyntheticEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Grid, TextField, Button, Switch,
  FormControlLabel, Slider, Select, MenuItem, FormControl, InputLabel,
  Autocomplete, Chip, ToggleButton, ToggleButtonGroup,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemAvatar, ListItemText, Avatar, IconButton,
  Alert, CircularProgress, Snackbar, Divider,
} from '@mui/material'
import {
  ArrowBack, Save, Publish, PersonAdd, Delete,
  FileUpload, Search, MyLocation, Link as LinkIcon,
  Gavel, WorkOutline, RecordVoiceOver, CheckCircle, PersonSearch,
} from '@mui/icons-material'
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet'
import * as L from 'leaflet'
import type { LeafletEventHandlerFnMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { audienciasApi } from '../../services/api'
import { COLORS } from '../../theme'

// ─── Tipos ───────────────────────────────────────────────────────────────────
type TipoParticipante = 'ADVOGADO' | 'PREPOSTO' | 'TESTEMUNHA'

interface ParticipanteLocal {
  id: string
  nome: string
  email: string
  matricula: string
  departamento: string
  avatar_iniciais: string
  tipo: TipoParticipante
  telefone: string
  cpf: string
  oab: string
  cidade: string
  estado: string
  isExistente: boolean
  persona_id?: string
}

interface LatLng {
  lat: number
  lng: number
}

interface ForumOption {
  id: string
  nome: string
  endereco: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  lat: number
  lng: number
}

type ModalidadeAudiencia = 'PRESENCIAL' | 'REMOTA'

const defaultMapIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = defaultMapIcon

// ─── Componente do Mapa ───────────────────────────────────────────────────────
function CentralizarMapa({ centro }: { centro: LatLng }) {
  const map = useMap()
  useEffect(() => {
    map.setView([centro.lat, centro.lng], map.getZoom(), { animate: true })
  }, [map, centro.lat, centro.lng])
  return null
}

function MapaGeofence({
  centro, raio, onCentroChange,
}: {
  centro: LatLng
  raio: number
  onCentroChange: (pos: LatLng) => void
}) {
  const markerRef = useRef<L.Marker | null>(null)
  const eventHandlers = useMemo<LeafletEventHandlerFnMap>(() => ({
    dragend() {
      const marker = markerRef.current
      if (marker) {
        const pos = marker.getLatLng()
        onCentroChange({ lat: pos.lat, lng: pos.lng })
      }
    },
  }), [onCentroChange])

  return (
    <MapContainer
      center={[centro.lat, centro.lng]}
      zoom={15}
      style={{ width: '100%', height: 240, borderRadius: 8 }}
      scrollWheelZoom
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CentralizarMapa centro={centro} />
      <Marker
        ref={markerRef}
        position={[centro.lat, centro.lng]}
        draggable
        eventHandlers={eventHandlers}
        title="Arraste para reposicionar"
      />
      <Circle
        center={[centro.lat, centro.lng]}
        radius={raio}
        pathOptions={{
          color: '#FF6600',
          fillColor: '#FF6600',
          fillOpacity: 0.15,
          weight: 2,
        }}
      />
    </MapContainer>
  )
}

// ─── Dialog de Adicionar Participante ────────────────────────────────────────
const DEPARTAMENTOS = [
  'Jurídico Regulatório', 'Compliance e Regulatório', 'Risco de Crédito',
  'Risco Operacional', 'Auditoria Interna', 'Financeiro e Contabilidade', 'PLD/FT — Prevenção',
]

const ESTADOS_BR = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const TIPO_CONFIG: Record<TipoParticipante, { label: string; color: string; icon: JSX.Element; desc: string }> = {
  ADVOGADO:   { label: 'Advogado',   color: '#3B82F6', icon: <Gavel />,              desc: 'Representação legal' },
  PREPOSTO:   { label: 'Preposto',   color: '#8B5CF6', icon: <WorkOutline />,        desc: 'Representante da empresa' },
  TESTEMUNHA: { label: 'Testemunha', color: '#F59E0B', icon: <RecordVoiceOver />,    desc: 'Testemunho no processo' },
}

// Personas cadastradas — catálogo compartilhado (sincronizado com PersonasPage)
const PERSONAS_CADASTRADAS = [
  { id: 'per-01', nome: 'Dr. Carlos Alberto Ferreira', email: 'carlos.ferreira@advocacia.com.br', telefone: '(11) 99001-0001', cpf: '111.222.333-01', oab: 'SP 123456', cidade: 'São Paulo', estado: 'SP', tipo: 'ADVOGADO' as TipoParticipante },
  { id: 'per-02', nome: 'Dra. Beatriz Mendonça Costa',  email: 'beatriz.mendonca@jur.com.br',     telefone: '(11) 99001-0002', cpf: '111.222.333-02', oab: 'SP 234567', cidade: 'São Paulo', estado: 'SP', tipo: 'ADVOGADO' as TipoParticipante },
  { id: 'per-03', nome: 'Dr. Roberto Alves Pinheiro',   email: 'roberto.pinheiro@escritorio.adv.br', telefone: '(11) 99001-0003', cpf: '111.222.333-03', oab: 'SP 345678', cidade: 'Guarulhos', estado: 'SP', tipo: 'ADVOGADO' as TipoParticipante },
  { id: 'per-04', nome: 'Dra. Silvia Torres Andrade',   email: 'silvia.torres@stadvogados.com.br',telefone: '(11) 99001-0004', cpf: '111.222.333-04', oab: 'SP 456789', cidade: 'São Paulo', estado: 'SP', tipo: 'ADVOGADO' as TipoParticipante },
  { id: 'per-05', nome: 'Dr. Marcus Vinícius Souza',    email: 'marcus.souza@vsjur.adv.br',        telefone: '(11) 99001-0005', cpf: '111.222.333-05', oab: 'SP 567890', cidade: 'Osasco', estado: 'SP', tipo: 'ADVOGADO' as TipoParticipante },
  { id: 'per-21', nome: 'João Paulo Carvalho',          email: 'joao.carvalho@empresa.com.br',     telefone: '(11) 98002-0001', cpf: '222.333.444-01', oab: '', cidade: 'São Paulo', estado: 'SP', tipo: 'PREPOSTO' as TipoParticipante },
  { id: 'per-22', nome: 'Fernanda Cristina Lima',       email: 'fernanda.lima@corporativo.com.br', telefone: '(11) 98002-0002', cpf: '222.333.444-02', oab: '', cidade: 'São Paulo', estado: 'SP', tipo: 'PREPOSTO' as TipoParticipante },
  { id: 'per-23', nome: 'Marcos Antônio Reis',          email: 'marcos.reis@holding.com.br',       telefone: '(11) 98002-0003', cpf: '222.333.444-03', oab: '', cidade: 'Santo André', estado: 'SP', tipo: 'PREPOSTO' as TipoParticipante },
  { id: 'per-41', nome: 'Ana Carolina Batista',         email: 'ana.batista@gmail.com',            telefone: '(11) 97003-0001', cpf: '333.444.555-01', oab: '', cidade: 'São Paulo', estado: 'SP', tipo: 'TESTEMUNHA' as TipoParticipante },
  { id: 'per-42', nome: 'Ricardo Monteiro Filho',       email: 'ricardo.monteiro@outlook.com',     telefone: '(11) 97003-0002', cpf: '333.444.555-02', oab: '', cidade: 'São Bernardo do Campo', estado: 'SP', tipo: 'TESTEMUNHA' as TipoParticipante },
  { id: 'per-43', nome: 'Patrícia Duarte Neves',        email: 'patricia.duarte@yahoo.com.br',     telefone: '(11) 97003-0003', cpf: '333.444.555-03', oab: '', cidade: 'Guarulhos', estado: 'SP', tipo: 'TESTEMUNHA' as TipoParticipante },
]

type PersonaCadastrada = typeof PERSONAS_CADASTRADAS[number]

function mkIniciais(nome: string) {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('')
}

function DialogAdicionarParticipante({
  aberto,
  onFechar,
  onAdicionar,
  jaAdicionados,
}: {
  aberto: boolean
  onFechar: () => void
  onAdicionar: (p: ParticipanteLocal) => void
  jaAdicionados: string[]
}) {
  const FORM_VAZIO = {
    nome: '', email: '', telefone: '', cpf: '', oab: '',
    matricula: '', departamento: '', cidade: '', estado: 'SP',
  }

  const [personaSelecionada, setPersonaSelecionada] = useState<PersonaCadastrada | null>(null)
  const [tipo, setTipo] = useState<TipoParticipante | null>(null)
  const [form, setForm] = useState(FORM_VAZIO)
  const [erro, setErro] = useState('')

  const setF = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const disponiveis = useMemo(
    () => PERSONAS_CADASTRADAS.filter(p => !jaAdicionados.includes(p.id)),
    [jaAdicionados],
  )

  const handleSelecionarExistente = (persona: PersonaCadastrada | null) => {
    setPersonaSelecionada(persona)
    if (persona) {
      setTipo(persona.tipo)
      setForm({
        nome: persona.nome,
        email: persona.email,
        telefone: persona.telefone,
        cpf: persona.cpf,
        oab: persona.oab,
        matricula: '',
        departamento: '',
        cidade: persona.cidade,
        estado: persona.estado,
      })
      setErro('')
    }
  }

  const handleAdicionar = () => {
    if (!tipo) { setErro('Selecione o tipo de participante.'); return }
    if (!form.nome.trim()) { setErro('Nome completo é obrigatório.'); return }
    if (!form.email.trim()) { setErro('E-mail é obrigatório.'); return }
    if (!form.telefone.trim()) { setErro('Telefone é obrigatório.'); return }
    if (tipo === 'ADVOGADO' && !form.oab.trim()) { setErro('OAB é obrigatório para Advogados.'); return }

    onAdicionar({
      id: personaSelecionada ? personaSelecionada.id : `tmp-${Date.now()}`,
      nome: form.nome.trim(),
      email: form.email.trim(),
      matricula: form.matricula.trim(),
      departamento: form.departamento,
      avatar_iniciais: mkIniciais(form.nome),
      tipo,
      telefone: form.telefone.trim(),
      cpf: form.cpf.trim(),
      oab: form.oab.trim(),
      cidade: form.cidade.trim(),
      estado: form.estado,
      isExistente: !!personaSelecionada,
      persona_id: personaSelecionada?.id,
    })
    handleFechar()
  }

  const handleFechar = () => {
    setPersonaSelecionada(null)
    setTipo(null)
    setForm(FORM_VAZIO)
    setErro('')
    onFechar()
  }

  return (
    <Dialog
      open={aberto}
      onClose={handleFechar}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` } }}
    >
      <DialogTitle sx={{ color: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonAdd sx={{ color: COLORS.orange }} />
        Adicionar Participante
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5, pb: 1 }}>
        {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}

        {/* ── Busca de persona existente ── */}
        <Autocomplete
          options={disponiveis}
          value={personaSelecionada}
          onChange={(_, v) => handleSelecionarExistente(v)}
          getOptionLabel={p => p.nome}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.id}>
              <Avatar sx={{ width: 30, height: 30, bgcolor: `${TIPO_CONFIG[option.tipo].color}22`, color: TIPO_CONFIG[option.tipo].color, fontSize: 11, mr: 1.5 }}>
                {mkIniciais(option.nome)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ color: COLORS.white, fontWeight: 600 }} noWrap>{option.nome}</Typography>
                <Typography variant="caption" sx={{ color: COLORS.gray3 }}>{option.email}</Typography>
              </Box>
              <Chip
                label={TIPO_CONFIG[option.tipo].label}
                size="small"
                sx={{ ml: 1, height: 18, fontSize: '0.6rem', bgcolor: `${TIPO_CONFIG[option.tipo].color}22`, color: TIPO_CONFIG[option.tipo].color }}
              />
            </Box>
          )}
          renderInput={params => (
            <TextField
              {...params}
              label="Buscar persona cadastrada"
              placeholder="Digite o nome para buscar ou deixe em branco para novo cadastro"
              InputProps={{
                ...params.InputProps,
                startAdornment: <><PersonSearch sx={{ color: COLORS.gray3, mr: 0.5, fontSize: 20 }} />{params.InputProps.startAdornment}</>,
              }}
            />
          )}
          noOptionsText={
            <Typography variant="body2" sx={{ color: COLORS.gray3, py: 0.5 }}>
              Nenhuma persona encontrada — preencha os dados abaixo para novo cadastro
            </Typography>
          }
        />

        {personaSelecionada && (
          <Box sx={{ mt: 1.5, p: 1, bgcolor: `${COLORS.green}12`, borderRadius: 1, border: `1px solid ${COLORS.green}30`, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle sx={{ color: COLORS.green, fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: COLORS.green, fontWeight: 600 }}>
              Persona cadastrada — campos pré-preenchidos e editáveis
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2, borderColor: COLORS.border }} />

        {/* ── Tipo de participante ── */}
        <Typography variant="caption" sx={{ color: COLORS.gray3, display: 'block', mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Tipo de participante *
        </Typography>
        <ToggleButtonGroup
          value={tipo}
          exclusive
          onChange={(_, v) => { if (v) setTipo(v) }}
          fullWidth
          sx={{ mb: 2.5 }}
        >
          {(Object.entries(TIPO_CONFIG) as [TipoParticipante, typeof TIPO_CONFIG.ADVOGADO][]).map(([key, cfg]) => (
            <ToggleButton
              key={key}
              value={key}
              sx={{
                flex: 1,
                flexDirection: 'column',
                gap: 0.5,
                py: 1.25,
                border: `1px solid ${COLORS.border} !important`,
                color: COLORS.gray3,
                '&.Mui-selected': {
                  bgcolor: `${cfg.color}18 !important`,
                  color: `${cfg.color} !important`,
                  border: `1px solid ${cfg.color}66 !important`,
                },
                '&:hover': { bgcolor: `${cfg.color}10` },
              }}
            >
              <Box sx={{ fontSize: 20 }}>{cfg.icon}</Box>
              <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1 }}>{cfg.label}</Typography>
              <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1, display: { xs: 'none', sm: 'block' } }}>{cfg.desc}</Typography>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* ── Campos do formulário ── */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth label="Nome completo *"
              value={form.nome}
              onChange={e => setF('nome', e.target.value)}
              autoFocus={!personaSelecionada}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="E-mail *" type="email"
              value={form.email}
              onChange={e => setF('email', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Telefone / WhatsApp *"
              placeholder="(11) 99999-0000"
              value={form.telefone}
              onChange={e => setF('telefone', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="CPF"
              placeholder="000.000.000-00"
              value={form.cpf}
              onChange={e => setF('cpf', e.target.value)}
            />
          </Grid>

          {tipo === 'ADVOGADO' && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="OAB *"
                placeholder="SP 000000"
                value={form.oab}
                onChange={e => setF('oab', e.target.value)}
              />
            </Grid>
          )}

          <Grid item xs={8}>
            <TextField
              fullWidth label="Cidade"
              value={form.cidade}
              onChange={e => setF('cidade', e.target.value)}
            />
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select value={form.estado} label="Estado" onChange={e => setF('estado', e.target.value)}>
                {ESTADOS_BR.map(uf => <MenuItem key={uf} value={uf}>{uf}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Matrícula"
              value={form.matricula}
              onChange={e => setF('matricula', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Departamento</InputLabel>
              <Select value={form.departamento} label="Departamento" onChange={e => setF('departamento', e.target.value)}>
                {DEPARTAMENTOS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ borderTop: `1px solid ${COLORS.border}`, px: 3, py: 2, gap: 1 }}>
        <Button onClick={handleFechar} sx={{ color: COLORS.gray3 }}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleAdicionar}
          startIcon={<PersonAdd />}
          disabled={!tipo}
        >
          {personaSelecionada ? 'Adicionar Cadastrado' : 'Adicionar Novo'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const FORUNS_GRANDE_SP: ForumOption[] = [
  { id: 'f01', nome: 'Fórum João Mendes Jr.', endereco: 'Praça João Mendes, s/n', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP', cep: '01501-900', lat: -23.5505, lng: -46.6342 },
  { id: 'f02', nome: 'Fórum Regional de Santo Amaro', endereco: 'Av. Adolfo Pinheiro, 1992', bairro: 'Santo Amaro', cidade: 'São Paulo', estado: 'SP', cep: '04734-000', lat: -23.6525, lng: -46.7081 },
  { id: 'f03', nome: 'Fórum Regional de Pinheiros', endereco: 'Rua Sumidouro, 487', bairro: 'Pinheiros', cidade: 'São Paulo', estado: 'SP', cep: '05403-000', lat: -23.5672, lng: -46.6973 },
  { id: 'f04', nome: 'Fórum Regional de Santana', endereco: 'Av. Luís Dumont Villares, 255', bairro: 'Santana', cidade: 'São Paulo', estado: 'SP', cep: '02063-000', lat: -23.5035, lng: -46.6259 },
  { id: 'f05', nome: 'Fórum Regional da Penha', endereco: 'Rua Cinira, 45', bairro: 'Penha', cidade: 'São Paulo', estado: 'SP', cep: '03630-020', lat: -23.5259, lng: -46.5428 },
  { id: 'f06', nome: 'Fórum Regional de Itaquera', endereco: 'Av. Nagib Farah Maluf, 400', bairro: 'Itaquera', cidade: 'São Paulo', estado: 'SP', cep: '08290-000', lat: -23.5435, lng: -46.4736 },
  { id: 'f07', nome: 'Fórum de Guarulhos', endereco: 'Rua Sete de Setembro, 1655', bairro: 'Centro', cidade: 'Guarulhos', estado: 'SP', cep: '07043-001', lat: -23.4628, lng: -46.5322 },
  { id: 'f08', nome: 'Fórum de Santo André', endereco: 'Rua Coronel Oliveira Lima, 89', bairro: 'Centro', cidade: 'Santo André', estado: 'SP', cep: '09010-081', lat: -23.6639, lng: -46.5383 },
  { id: 'f09', nome: 'Fórum de São Bernardo do Campo', endereco: 'Av. Senador Vergueiro, 202', bairro: 'Centro', cidade: 'São Bernardo do Campo', estado: 'SP', cep: '09750-000', lat: -23.6939, lng: -46.5657 },
  { id: 'f10', nome: 'Fórum de Osasco', endereco: 'Rua Avelar Peixoto, 85', bairro: 'Centro', cidade: 'Osasco', estado: 'SP', cep: '06018-190', lat: -23.5328, lng: -46.7917 },
  { id: 'f11', nome: 'Fórum de Diadema', endereco: 'Av. Antônio Piranga, 1100', bairro: 'Centro', cidade: 'Diadema', estado: 'SP', cep: '09920-670', lat: -23.6861, lng: -46.6228 },
  { id: 'f12', nome: 'Fórum de Mogi das Cruzes', endereco: 'Av. Francisco Ferreira Lopes, 135', bairro: 'Centro', cidade: 'Mogi das Cruzes', estado: 'SP', cep: '08710-380', lat: -23.5229, lng: -46.1883 },
  { id: 'f13', nome: 'Fórum de Carapicuíba', endereco: 'Rua José Manfré, 220', bairro: 'Centro', cidade: 'Carapicuíba', estado: 'SP', cep: '06320-000', lat: -23.5226, lng: -46.8353 },
  { id: 'f14', nome: 'Fórum de Taboão da Serra', endereco: 'Rua da Independência, 100', bairro: 'Centro', cidade: 'Taboão da Serra', estado: 'SP', cep: '06765-000', lat: -23.6156, lng: -46.7664 },
  { id: 'f15', nome: 'Fórum de Barueri', endereco: 'Av. Henriqueta Mendes Guerra, 550', bairro: 'Centro', cidade: 'Barueri', estado: 'SP', cep: '06401-025', lat: -23.5057, lng: -46.8792 },
]

// ─── Página Principal ─────────────────────────────────────────────────────────
const CENTRO_PADRAO: LatLng = { lat: -23.5614, lng: -46.6559 } // Av. Paulista, SP

export default function NovaAudienciaPage() {
  const navigate = useNavigate()
  const [salvando, setSalvando] = useState(false)
  const [dialogAberto, setDialogAberto] = useState(false)
  const [snack, setSnack] = useState<{ open: boolean; msg: string; tipo: 'success' | 'error' }>({
    open: false, msg: '', tipo: 'success',
  })
  const [participantes, setParticipantes] = useState<ParticipanteLocal[]>([])
  const [geocodando, setGeocodando] = useState(false)
  const [erroGeo, setErroGeo] = useState('')
  const [centroMapa, setCentroMapa] = useState<LatLng>(CENTRO_PADRAO)
  const [forumSelecionado, setForumSelecionado] = useState<ForumOption | null>(null)
  const [forumInput, setForumInput] = useState('')

  const [form, setForm] = useState({
    nome: '', modalidade: 'PRESENCIAL' as ModalidadeAudiencia, forum_nome: '', link_remoto: '',
    departamento: '', data: '', horario_inicio: '', horario_fim: '',
    local: '', descricao: '', raio_geofence_metros: 200,
    pre_checkin_habilitado: true, offline_habilitado: true, questionario_habilitado: true,
    lembrete_24h: true, lembrete_4h: true, lembrete_30min: true, alerta_ausencia: true,
    latitude: CENTRO_PADRAO.lat, longitude: CENTRO_PADRAO.lng,
  })

  const setCampo = (key: string, value: unknown) => setForm(f => ({ ...f, [key]: value }))

  const atualizarCentro = useCallback((pos: LatLng) => {
    setCentroMapa(pos)
    setForm(f => ({ ...f, latitude: pos.lat, longitude: pos.lng }))
  }, [])

  const aplicarForum = useCallback((forum: ForumOption) => {
    setForumSelecionado(forum)
    setForumInput(forum.nome)
    setForm(f => ({
      ...f,
      forum_nome: forum.nome,
      local: `${forum.nome} — ${forum.endereco}, ${forum.bairro}, ${forum.cidade}/${forum.estado}`,
    }))
    atualizarCentro({ lat: forum.lat, lng: forum.lng })
    setErroGeo('')
  }, [atualizarCentro])

  // ── Geocodificação do endereço ──
  const geocodificarEndereco = useCallback(async () => {
    if (form.modalidade === 'REMOTA' || !form.local.trim()) return
    setGeocodando(true)
    setErroGeo('')
    try {
      const query = encodeURIComponent(`${form.local}, Brasil`)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${query}`)
      if (!response.ok) throw new Error(`Status ${response.status}`)
      const data = await response.json() as Array<{ lat: string; lon: string }>
      if (!Array.isArray(data) || !data[0]) {
        setErroGeo('Endereço não encontrado. Verifique e tente novamente.')
        return
      }
      const pos = { lat: Number(data[0].lat), lng: Number(data[0].lon) }
      if (!Number.isFinite(pos.lat) || !Number.isFinite(pos.lng)) {
        setErroGeo('Coordenadas inválidas para este endereço.')
        return
      }
      atualizarCentro(pos)
    } catch {
      setErroGeo('Não foi possível localizar este endereço agora. Tente novamente em instantes.')
    } finally {
      setGeocodando(false)
    }
  }, [form.local, form.modalidade, atualizarCentro])

  // ── Geolocalização do navegador ──
  const usarMinhaLocalizacao = () => {
    if (form.modalidade === 'REMOTA') return
    if (!navigator.geolocation) return
    setGeocodando(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        atualizarCentro(coords)
        setGeocodando(false)
      },
      () => {
        setErroGeo('Não foi possível obter a localização.')
        setGeocodando(false)
      }
    )
  }

  const handleModalidadeChange = (modalidade: ModalidadeAudiencia) => {
    setForm(prev => ({
      ...prev,
      modalidade,
      link_remoto: modalidade === 'REMOTA' ? prev.link_remoto : '',
      local: modalidade === 'REMOTA' ? '' : prev.local,
    }))
    if (modalidade === 'REMOTA') {
      setForumSelecionado(null)
      setForumInput('')
      setErroGeo('')
    }
  }

  const handleForumChange = (
    _: SyntheticEvent,
    newValue: string | ForumOption | null,
  ) => {
    if (typeof newValue === 'string') {
      setForumSelecionado(null)
      setForumInput(newValue)
      setCampo('forum_nome', newValue)
      if (!form.local.trim()) setCampo('local', newValue)
      return
    }

    if (newValue) {
      aplicarForum(newValue)
      return
    }

    setForumSelecionado(null)
    setForumInput('')
    setCampo('forum_nome', '')
  }

  const removerParticipante = (id: string) =>
    setParticipantes(prev => prev.filter(p => p.id !== id))

  const handleSalvar = async (publicar = false) => {
    if (!form.nome.trim()) {
      setSnack({ open: true, msg: 'Informe o nome da audiência.', tipo: 'error' })
      return
    }
    if (form.modalidade === 'PRESENCIAL' && !form.local.trim()) {
      setSnack({ open: true, msg: 'Para audiência presencial, informe o local/endereço.', tipo: 'error' })
      return
    }
    if (form.modalidade === 'REMOTA' && !form.link_remoto.trim()) {
      setSnack({ open: true, msg: 'Para audiência remota, informe o link da reunião.', tipo: 'error' })
      return
    }
    if (form.modalidade === 'REMOTA') {
      try {
        new URL(form.link_remoto.trim())
      } catch {
        setSnack({ open: true, msg: 'Informe um link remoto válido (ex: https://...).', tipo: 'error' })
        return
      }
    }

    setSalvando(true)
    try {
      await audienciasApi.criar({
        ...form,
        modalidade: form.modalidade.toLowerCase(),
        local: form.modalidade === 'REMOTA' ? 'Audiência remota' : form.local.trim(),
        link_remoto: form.modalidade === 'REMOTA' ? form.link_remoto.trim() : null,
        latitude: form.modalidade === 'REMOTA' ? null : form.latitude,
        longitude: form.modalidade === 'REMOTA' ? null : form.longitude,
        raio_geofence_metros: form.modalidade === 'REMOTA' ? 0 : form.raio_geofence_metros,
        status: publicar ? 'agendada' : 'rascunho',
        participantes_ids: participantes.map(p => p.id),
      })
      setSnack({ open: true, msg: publicar ? 'Audiência publicada com sucesso!' : 'Rascunho salvo!', tipo: 'success' })
      setTimeout(() => navigate('/audiencias'), 1200)
    } catch (e) {
      console.error(e)
      setSnack({ open: true, msg: 'Erro ao salvar. Verifique se o servidor mock está rodando.', tipo: 'error' })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Box>
      {/* ── Cabeçalho ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/audiencias')} sx={{ color: COLORS.gray3 }}>
          Audiências
        </Button>
        <Typography variant="h5" sx={{ color: COLORS.white, fontWeight: 700, flexGrow: 1 }}>
          Nova Audiência
        </Typography>
        <Button variant="outlined" startIcon={<Save />} onClick={() => handleSalvar(false)} disabled={salvando}>
          Salvar Rascunho
        </Button>
        <Button variant="contained" startIcon={<Publish />} onClick={() => handleSalvar(true)} disabled={salvando}>
          Publicar
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* ── Coluna esquerda ── */}
        <Grid item xs={12} md={7}>
          {/* Informações Básicas */}
          <Paper sx={{ p: 3, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <Typography variant="h6" sx={{ color: COLORS.white, mb: 2 }}>📋 Informações Básicas</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Nome da Audiência *"
                  placeholder="Ex: Audiência BACEN — DEBAN Q1 2026"
                  value={form.nome} onChange={e => setCampo('nome', e.target.value)} />
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Modalidade *</InputLabel>
                  <Select
                    value={form.modalidade}
                    label="Modalidade *"
                    onChange={e => handleModalidadeChange(e.target.value as ModalidadeAudiencia)}
                  >
                    <MenuItem value="PRESENCIAL">Presencial</MenuItem>
                    <MenuItem value="REMOTA">Remota</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={8}>
                {form.modalidade === 'PRESENCIAL' ? (
                  <Autocomplete
                    freeSolo
                    options={FORUNS_GRANDE_SP}
                    value={forumSelecionado}
                    inputValue={forumInput}
                    onChange={handleForumChange}
                    onInputChange={(_, value, reason) => {
                      setForumInput(value)
                      if (reason === 'input') {
                        setForumSelecionado(null)
                        setCampo('forum_nome', value)
                      }
                    }}
                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.nome)}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="body2" sx={{ color: COLORS.white }}>{option.nome}</Typography>
                          <Typography variant="caption" sx={{ color: COLORS.gray4 }}>
                            {option.endereco}, {option.bairro} · {option.cidade}/{option.estado}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Fórum (opcional)"
                        placeholder="Selecione um fórum ou digite um local não cadastrado"
                      />
                    )}
                  />
                ) : (
                  <TextField
                    fullWidth
                    label="Link da Reunião *"
                    placeholder="https://teams.microsoft.com/... ou https://meet.google.com/..."
                    value={form.link_remoto}
                    onChange={e => setCampo('link_remoto', e.target.value)}
                    InputProps={{
                      startAdornment: <LinkIcon sx={{ fontSize: 16, color: COLORS.gray3, mr: 1 }} />,
                    }}
                  />
                )}
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Data *" type="date" InputLabelProps={{ shrink: true }}
                  value={form.data} onChange={e => setCampo('data', e.target.value)} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth label="Início *" type="time" InputLabelProps={{ shrink: true }}
                  value={form.horario_inicio} onChange={e => setCampo('horario_inicio', e.target.value)} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth label="Fim *" type="time" InputLabelProps={{ shrink: true }}
                  value={form.horario_fim} onChange={e => setCampo('horario_fim', e.target.value)} />
              </Grid>
              {form.modalidade === 'PRESENCIAL' && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth label="Local / Endereço *"
                      placeholder="Ex: Av. Paulista 1452, São Paulo"
                      value={form.local}
                      onChange={e => setCampo('local', e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && geocodificarEndereco()}
                    />
                    <IconButton
                      onClick={geocodificarEndereco}
                      disabled={geocodando || !form.local.trim()}
                      title="Buscar no mapa"
                      sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 1, px: 1.5, color: COLORS.orange }}
                    >
                      {geocodando ? <CircularProgress size={18} sx={{ color: COLORS.orange }} /> : <Search />}
                    </IconButton>
                    <IconButton
                      onClick={usarMinhaLocalizacao}
                      title="Usar minha localização"
                      sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 1, px: 1.5, color: COLORS.gray3 }}
                    >
                      <MyLocation />
                    </IconButton>
                  </Box>
                  <Typography variant="caption" sx={{ color: COLORS.gray4, mt: 0.5, display: 'block' }}>
                    Selecionar fórum preenche o endereço automaticamente, mas você pode editar ou informar um local não cadastrado.
                  </Typography>
                  {erroGeo && (
                    <Typography variant="caption" sx={{ color: '#F87171', mt: 0.5, display: 'block' }}>
                      {erroGeo}
                    </Typography>
                  )}
                </Grid>
              )}
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Departamento *</InputLabel>
                  <Select value={form.departamento} label="Departamento *" onChange={e => setCampo('departamento', e.target.value)}>
                    {DEPARTAMENTOS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={2} label="Descrição / Pauta"
                  value={form.descricao} onChange={e => setCampo('descricao', e.target.value)} />
              </Grid>
            </Grid>
          </Paper>

          {form.modalidade === 'PRESENCIAL' && (
            <Paper sx={{ p: 3, mt: 2, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
              <Typography variant="h6" sx={{ color: COLORS.white, mb: 2 }}>📍 Configuração de Geofence</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>Raio do Geofence: {form.raio_geofence_metros}m</Typography>
              <Slider
                value={form.raio_geofence_metros}
                onChange={(_, v) => setCampo('raio_geofence_metros', v as number)}
                min={50} max={1000} step={50}
                marks={[{ value: 100, label: '100m' }, { value: 500, label: '500m' }, { value: 1000, label: '1km' }]}
                sx={{ color: COLORS.orange, mb: 2 }}
              />
              <FormControlLabel
                control={<Switch checked={form.pre_checkin_habilitado} onChange={e => setCampo('pre_checkin_habilitado', e.target.checked)} />}
                label="Permitir pré-check-in por proximidade"
                sx={{ color: COLORS.gray3, display: 'block', mb: 1 }}
              />
              <FormControlLabel
                control={<Switch checked={form.offline_habilitado} onChange={e => setCampo('offline_habilitado', e.target.checked)} />}
                label="Modo Offline habilitado"
                sx={{ color: COLORS.gray3, display: 'block' }}
              />
            </Paper>
          )}

          {/* Notificações */}
          <Paper sx={{ p: 3, mt: 2, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <Typography variant="h6" sx={{ color: COLORS.white, mb: 2 }}>🔔 Notificações</Typography>
            {[
              { key: 'lembrete_24h', label: 'Lembrete T-24h' },
              { key: 'lembrete_4h', label: 'Lembrete T-4h com Confirmação' },
              { key: 'lembrete_30min', label: 'Lembrete T-30min' },
              { key: 'alerta_ausencia', label: 'Alerta de ausência ao gestor' },
              { key: 'questionario_habilitado', label: 'Enviar questionário pós-audiência' },
            ].map(item => (
              <FormControlLabel
                key={item.key}
                control={<Switch checked={(form as any)[item.key]} onChange={e => setCampo(item.key, e.target.checked)} />}
                label={item.label}
                sx={{ color: COLORS.gray3, display: 'block', mb: 0.5 }}
              />
            ))}
          </Paper>
        </Grid>

        {/* ── Coluna direita ── */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, position: 'sticky', top: 80 }}>
            <Typography variant="h6" sx={{ color: COLORS.white, mb: 2 }}>
              {form.modalidade === 'REMOTA' ? '💻 Audiência Remota' : '🗺️ Preview do Mapa'}
            </Typography>

            {/* ── Área do mapa ── */}
            {form.modalidade === 'REMOTA' ? (
              <Box
                sx={{
                  minHeight: 180,
                  bgcolor: COLORS.raised,
                  borderRadius: 2,
                  border: `1px dashed ${COLORS.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 1,
                  p: 2,
                }}
              >
                <Chip
                  icon={<LinkIcon sx={{ fontSize: 14 }} />}
                  label="Mapa oculto para audiência remota"
                  sx={{ bgcolor: 'rgba(167,139,250,0.15)', color: '#C4B5FD', border: '1px solid rgba(167,139,250,0.3)' }}
                />
                {form.link_remoto.trim() ? (
                  <Typography variant="caption" sx={{ color: COLORS.gray3, textAlign: 'center', wordBreak: 'break-all' }}>
                    {form.link_remoto}
                  </Typography>
                ) : (
                  <Typography variant="caption" sx={{ color: COLORS.gray4, textAlign: 'center' }}>
                    Informe o link da reunião para habilitar acesso remoto.
                  </Typography>
                )}
              </Box>
            ) : (
              <MapaGeofence
                centro={centroMapa}
                raio={form.raio_geofence_metros}
                onCentroChange={atualizarCentro}
              />
            )}

            {form.modalidade === 'PRESENCIAL' && (
              <Typography variant="caption" sx={{ color: COLORS.gray4, display: 'block', mt: 0.75, textAlign: 'center' }}>
                OpenStreetMap (gratuito) · Arraste o marcador para reposicionar · Raio: {form.raio_geofence_metros}m
              </Typography>
            )}

            {/* ── Participantes ── */}
            <Box sx={{ mt: 2, p: 1.5, bgcolor: COLORS.raised, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography variant="body2" sx={{ color: COLORS.white, mb: 1.5, fontWeight: 600 }}>
                Participantes ({participantes.length})
              </Typography>

              {participantes.length > 0 && (
                <List dense disablePadding sx={{ mb: 1.5, maxHeight: 220, overflowY: 'auto' }}>
                  {participantes.map(p => {
                    const cfg = TIPO_CONFIG[p.tipo]
                    return (
                      <ListItem
                        key={p.id}
                        disableGutters
                        secondaryAction={
                          <IconButton size="small" onClick={() => removerParticipante(p.id)} sx={{ color: COLORS.gray4 }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemAvatar sx={{ minWidth: 36 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: `${cfg?.color ?? COLORS.orange}30`, color: cfg?.color ?? COLORS.orange, fontSize: 11, fontWeight: 700 }}>
                            {p.avatar_iniciais}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="caption" sx={{ color: COLORS.white, fontWeight: 600 }}>{p.nome}</Typography>
                              {cfg && (
                                <Chip label={cfg.label} size="small" sx={{ height: 14, fontSize: '0.55rem', bgcolor: `${cfg.color}22`, color: cfg.color }} />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: COLORS.gray4, fontSize: '0.65rem' }}>
                              {p.email}{p.telefone ? ` · ${p.telefone}` : ''}
                            </Typography>
                          }
                          sx={{ my: 0 }}
                        />
                      </ListItem>
                    )
                  })}
                </List>
              )}

              <Button
                size="small" variant="outlined" fullWidth
                startIcon={<PersonAdd />}
                onClick={() => setDialogAberto(true)}
                sx={{ mb: 1 }}
              >
                Adicionar Participante
              </Button>
              <Button size="small" fullWidth startIcon={<FileUpload />} sx={{ color: COLORS.gray3 }}>
                Importar CSV
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Dialog ── */}
      <DialogAdicionarParticipante
        aberto={dialogAberto}
        onFechar={() => setDialogAberto(false)}
        onAdicionar={p => setParticipantes(prev => [...prev, p])}
        jaAdicionados={participantes.map(p => p.persona_id ?? p.id)}
      />

      {/* ── Snackbar de feedback ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          severity={snack.tipo}
          variant="filled"
          sx={{ minWidth: 320 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
