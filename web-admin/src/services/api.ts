import axios from 'axios'
import { installMockAdapter } from '../mock/adapter'

const BASE_URL = '/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

installMockAdapter(api)

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    console.error('[API Error]', err.message)
    return Promise.reject(err)
  }
)

// Audiências
export const audienciasApi = {
  listar: ()                              => api.get('/audiencias').then(r => r.data),
  obter: (id: string)                     => api.get(`/audiencias/${id}`).then(r => r.data),
  participantes: (id: string)             => api.get(`/audiencias/${id}/participantes`).then(r => r.data),
  checkins: (id: string)                  => api.get(`/audiencias/${id}/checkins`).then(r => r.data),
  criar: (dados: unknown)                 => api.post('/audiencias', dados).then(r => r.data),
  atualizar: (id: string, dados: unknown) => api.patch(`/audiencias/${id}`, dados).then(r => r.data),
}

// Dashboard
export const dashboardApi = {
  obter: () => api.get('/dashboard').then(r => r.data),
}

// Check-ins
export const checkinsApi = {
  listar: ()                               => api.get('/checkins').then(r => r.data),
  registrar: (dados: unknown)              => api.post('/checkins', dados).then(r => r.data),
  editar: (id: string, dados: unknown)     => api.patch(`/checkins/${id}`, dados).then(r => r.data),
}

// Notificações
export const notificacoesApi = {
  listar: () => api.get('/notificacoes').then(r => r.data),
}

// Evidências
export const evidenciasApi = {
  listar: ()          => api.get('/evidencias').then(r => r.data),
  obter: (id: string) => api.get(`/evidencias/${id}`).then(r => r.data),
}

// Auditoria
export const auditoriaApi = {
  listar: () => api.get('/auditoria').then(r => r.data),
}

// Usuários e Perfis
export const usuariosApi = {
  listar: () => api.get('/usuarios').then(r => r.data),
  perfis: () => api.get('/perfis').then(r => r.data),
}

// Questionários
export const questionariosApi = {
  templates: ()            => api.get('/questionarios/templates').then(r => r.data),
  respostas: ()            => api.get('/questionarios/respostas').then(r => r.data),
  enviar: (dados: unknown) => api.post('/questionarios/respostas', dados).then(r => r.data),
}

// Upload
export const uploadApi = {
  participantes: (dados: unknown) => api.post('/upload/participantes', dados).then(r => r.data),
}
