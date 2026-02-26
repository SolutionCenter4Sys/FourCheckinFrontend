import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Grid, TextField, Button, Switch,
  FormControlLabel, Slider, Select, MenuItem, FormControl, InputLabel,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemAvatar, ListItemText, Avatar, IconButton,
  Alert, CircularProgress, Snackbar,
} from '@mui/material'
import {
  ArrowBack, Save, Publish, PersonAdd, Delete,
  FileUpload, Search, MyLocation,
} from '@mui/icons-material'
import {
  GoogleMap, useJsApiLoader, Marker, Circle,
} from '@react-google-maps/api'
import { audienciasApi } from '../../services/api'
import { COLORS } from '../../theme'

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface ParticipanteLocal {
  id: string
  nome: string
  email: string
  matricula: string
  departamento: string
  avatar_iniciais: string
}

interface LatLng {
  lat: number
  lng: number
}

// ─── Constante de bibliotecas (fora do componente para evitar re-renders) ───
const LIBRARIES: ('places' | 'geocoding')[] = ['places']

const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0c1021' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0c1021' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#374155' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e2a3a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#374155' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#060b14' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
]

// ─── Componente do Mapa ───────────────────────────────────────────────────────
function MapaGeofence({
  centro, raio, onCentroChange,
}: {
  centro: LatLng
  raio: number
  onCentroChange: (pos: LatLng) => void
}) {
  const mapRef = useRef<google.maps.Map | null>(null)

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      onCentroChange({ lat: e.latLng.lat(), lng: e.latLng.lng() })
    }
  }, [onCentroChange])

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '240px', borderRadius: '8px' }}
      center={centro}
      zoom={16}
      onLoad={onLoad}
      options={{
        styles: MAP_STYLE,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
      }}
    >
      <Marker
        position={centro}
        draggable
        onDragEnd={onMarkerDragEnd}
        title="Arraste para reposicionar"
      />
      <Circle
        center={centro}
        radius={raio}
        options={{
          fillColor: '#FF6600',
          fillOpacity: 0.15,
          strokeColor: '#FF6600',
          strokeOpacity: 0.8,
          strokeWeight: 2,
        }}
      />
    </GoogleMap>
  )
}

// ─── Dialog de Adicionar Participante ────────────────────────────────────────
const DEPARTAMENTOS = [
  'Jurídico Regulatório', 'Compliance e Regulatório', 'Risco de Crédito',
  'Risco Operacional', 'Auditoria Interna', 'Financeiro e Contabilidade', 'PLD/FT — Prevenção',
]

function DialogAdicionarParticipante({
  aberto,
  onFechar,
  onAdicionar,
}: {
  aberto: boolean
  onFechar: () => void
  onAdicionar: (p: ParticipanteLocal) => void
}) {
  const [form, setForm] = useState({ nome: '', email: '', matricula: '', departamento: '' })
  const [erro, setErro] = useState('')

  const setF = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleAdicionar = () => {
    if (!form.nome.trim() || !form.email.trim()) {
      setErro('Nome e e-mail são obrigatórios.')
      return
    }
    const iniciais = form.nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0].toUpperCase())
      .join('')
    onAdicionar({
      id: `tmp-${Date.now()}`,
      nome: form.nome.trim(),
      email: form.email.trim(),
      matricula: form.matricula.trim(),
      departamento: form.departamento,
      avatar_iniciais: iniciais,
    })
    setForm({ nome: '', email: '', matricula: '', departamento: '' })
    setErro('')
    onFechar()
  }

  const handleFechar = () => {
    setForm({ nome: '', email: '', matricula: '', departamento: '' })
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
      <DialogTitle sx={{ color: COLORS.white, borderBottom: `1px solid ${COLORS.border}` }}>
        Adicionar Participante
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth label="Nome completo *"
              value={form.nome}
              onChange={e => setF('nome', e.target.value)}
              autoFocus
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth label="E-mail *" type="email"
              value={form.email}
              onChange={e => setF('email', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth label="Matrícula"
              value={form.matricula}
              onChange={e => setF('matricula', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Departamento</InputLabel>
              <Select
                value={form.departamento}
                label="Departamento"
                onChange={e => setF('departamento', e.target.value)}
              >
                {DEPARTAMENTOS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ borderTop: `1px solid ${COLORS.border}`, px: 3, py: 2, gap: 1 }}>
        <Button onClick={handleFechar} sx={{ color: COLORS.gray3 }}>Cancelar</Button>
        <Button variant="contained" onClick={handleAdicionar} startIcon={<PersonAdd />}>
          Adicionar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Página Principal ─────────────────────────────────────────────────────────
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string
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
  const [centraMapa, setCentraMapa] = useState<LatLng>(CENTRO_PADRAO)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)

  const [form, setForm] = useState({
    nome: '', departamento: '', data: '', horario_inicio: '', horario_fim: '',
    local: '', descricao: '', raio_geofence_metros: 200,
    pre_checkin_habilitado: true, offline_habilitado: true, questionario_habilitado: true,
    lembrete_24h: true, lembrete_4h: true, lembrete_30min: true, alerta_ausencia: true,
    latitude: CENTRO_PADRAO.lat, longitude: CENTRO_PADRAO.lng,
  })

  // ── Google Maps Loader ──
  const apiKeyValida = GOOGLE_MAPS_KEY && GOOGLE_MAPS_KEY !== 'SUA_CHAVE_AQUI'
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKeyValida ? GOOGLE_MAPS_KEY : '',
    libraries: LIBRARIES,
    language: 'pt-BR',
    region: 'BR',
  })

  useEffect(() => {
    if (isLoaded && apiKeyValida && !geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder()
    }
  }, [isLoaded, apiKeyValida])

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }))

  // ── Geocodificação do endereço ──
  const geocodificarEndereco = useCallback(() => {
    if (!geocoderRef.current || !form.local.trim()) return
    setGeocodando(true)
    setErroGeo('')
    geocoderRef.current.geocode(
      { address: form.local + ', Brasil', region: 'BR' },
      (results, status) => {
        setGeocodando(false)
        if (status === 'OK' && results && results[0]) {
          const loc = results[0].geometry.location
          const pos = { lat: loc.lat(), lng: loc.lng() }
          setCentraMapa(pos)
          setForm(f => ({ ...f, latitude: pos.lat, longitude: pos.lng }))
        } else {
          setErroGeo('Endereço não encontrado. Verifique e tente novamente.')
        }
      }
    )
  }, [form.local])

  const atualizarCentro = useCallback((pos: LatLng) => {
    setCentraMapa(pos)
    setForm(f => ({ ...f, latitude: pos.lat, longitude: pos.lng }))
  }, [])

  // ── Geolocalização do navegador ──
  const usarMinhaLocalizacao = () => {
    if (!navigator.geolocation) return
    setGeocodando(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCentraMapa(coords)
        setForm(f => ({ ...f, latitude: coords.lat, longitude: coords.lng }))
        setGeocodando(false)
      },
      () => {
        setErroGeo('Não foi possível obter a localização.')
        setGeocodando(false)
      }
    )
  }

  const removerParticipante = (id: string) =>
    setParticipantes(prev => prev.filter(p => p.id !== id))

  const handleSalvar = async (publicar = false) => {
    if (!form.nome.trim()) {
      setSnack({ open: true, msg: 'Informe o nome da audiência.', tipo: 'error' })
      return
    }
    setSalvando(true)
    try {
      await audienciasApi.criar({
        ...form,
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

  const chaveInformada = apiKeyValida

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
                  value={form.nome} onChange={e => set('nome', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Data *" type="date" InputLabelProps={{ shrink: true }}
                  value={form.data} onChange={e => set('data', e.target.value)} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth label="Início *" type="time" InputLabelProps={{ shrink: true }}
                  value={form.horario_inicio} onChange={e => set('horario_inicio', e.target.value)} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth label="Fim *" type="time" InputLabelProps={{ shrink: true }}
                  value={form.horario_fim} onChange={e => set('horario_fim', e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth label="Local / Endereço *"
                    placeholder="Ex: Av. Paulista 1452, São Paulo"
                    value={form.local}
                    onChange={e => set('local', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && geocodificarEndereco()}
                  />
                  {chaveInformada && (
                    <>
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
                    </>
                  )}
                </Box>
                {erroGeo && (
                  <Typography variant="caption" sx={{ color: '#F87171', mt: 0.5, display: 'block' }}>
                    {erroGeo}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Departamento *</InputLabel>
                  <Select value={form.departamento} label="Departamento *" onChange={e => set('departamento', e.target.value)}>
                    {DEPARTAMENTOS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={2} label="Descrição / Pauta"
                  value={form.descricao} onChange={e => set('descricao', e.target.value)} />
              </Grid>
            </Grid>
          </Paper>

          {/* Geofence */}
          <Paper sx={{ p: 3, mt: 2, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <Typography variant="h6" sx={{ color: COLORS.white, mb: 2 }}>📍 Configuração de Geofence</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>Raio do Geofence: {form.raio_geofence_metros}m</Typography>
            <Slider
              value={form.raio_geofence_metros}
              onChange={(_, v) => set('raio_geofence_metros', v as number)}
              min={50} max={1000} step={50}
              marks={[{ value: 100, label: '100m' }, { value: 500, label: '500m' }, { value: 1000, label: '1km' }]}
              sx={{ color: COLORS.orange, mb: 2 }}
            />
            <FormControlLabel
              control={<Switch checked={form.pre_checkin_habilitado} onChange={e => set('pre_checkin_habilitado', e.target.checked)} />}
              label="Permitir pré-check-in por proximidade"
              sx={{ color: COLORS.gray3, display: 'block', mb: 1 }}
            />
            <FormControlLabel
              control={<Switch checked={form.offline_habilitado} onChange={e => set('offline_habilitado', e.target.checked)} />}
              label="Modo Offline habilitado"
              sx={{ color: COLORS.gray3, display: 'block' }}
            />
          </Paper>

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
                control={<Switch checked={(form as any)[item.key]} onChange={e => set(item.key, e.target.checked)} />}
                label={item.label}
                sx={{ color: COLORS.gray3, display: 'block', mb: 0.5 }}
              />
            ))}
          </Paper>
        </Grid>

        {/* ── Coluna direita ── */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, position: 'sticky', top: 80 }}>
            <Typography variant="h6" sx={{ color: COLORS.white, mb: 2 }}>🗺️ Preview do Mapa</Typography>

            {/* ── Área do mapa ── */}
            {!chaveInformada ? (
              <Box sx={{
                height: 240, bgcolor: COLORS.raised, borderRadius: 2,
                border: `1px dashed ${COLORS.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1, p: 2,
              }}>
                <Typography sx={{ fontSize: 28 }}>🗺️</Typography>
                <Typography variant="caption" sx={{ color: COLORS.gray3, textAlign: 'center' }}>
                  Configure <code>VITE_GOOGLE_MAPS_API_KEY</code> no arquivo <code>.env</code> para ativar o mapa interativo.
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.gray4, textAlign: 'center', fontSize: '0.65rem' }}>
                  console.cloud.google.com → APIs & Services → Credentials
                </Typography>
              </Box>
            ) : loadError ? (
              <Box sx={{ height: 240, bgcolor: COLORS.raised, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" sx={{ color: '#F87171' }}>Erro ao carregar o mapa. Verifique a chave API.</Typography>
              </Box>
            ) : !isLoaded ? (
              <Box sx={{ height: 240, bgcolor: COLORS.raised, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress sx={{ color: COLORS.orange }} />
              </Box>
            ) : (
              <MapaGeofence
                centro={centraMapa}
                raio={form.raio_geofence_metros}
                onCentroChange={atualizarCentro}
              />
            )}

            {chaveInformada && (
              <Typography variant="caption" sx={{ color: COLORS.gray4, display: 'block', mt: 0.75, textAlign: 'center' }}>
                Arraste o marcador para reposicionar · Raio: {form.raio_geofence_metros}m
              </Typography>
            )}

            {/* ── Participantes ── */}
            <Box sx={{ mt: 2, p: 1.5, bgcolor: COLORS.raised, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography variant="body2" sx={{ color: COLORS.white, mb: 1.5, fontWeight: 600 }}>
                Participantes ({participantes.length})
              </Typography>

              {participantes.length > 0 && (
                <List dense disablePadding sx={{ mb: 1.5, maxHeight: 180, overflowY: 'auto' }}>
                  {participantes.map(p => (
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
                        <Avatar sx={{ width: 28, height: 28, bgcolor: `${COLORS.orange}30`, color: COLORS.orange, fontSize: 11, fontWeight: 700 }}>
                          {p.avatar_iniciais}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="caption" sx={{ color: COLORS.white, fontWeight: 500 }}>{p.nome}</Typography>}
                        secondary={<Typography variant="caption" sx={{ color: COLORS.gray4, fontSize: '0.65rem' }}>{p.email}</Typography>}
                        sx={{ my: 0 }}
                      />
                    </ListItem>
                  ))}
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
