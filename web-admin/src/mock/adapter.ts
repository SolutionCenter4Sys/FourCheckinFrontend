import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { audiencias, checkins, evidencias, notificacoes, auditoria, usuarios, perfis, questionarioTemplates, buildDashboard } from './data'

type MockResult = { status: number; data: unknown }

function route(method: string, url: string, body?: any): MockResult | null {
  const path = url.replace(/\/$/, '')

  if (method === 'POST' && path === '/auth/token')
    return { status: 200, data: { access_token: 'mock-token', token_type: 'Bearer', expires_in: 86400, user: { name: 'Rodrigo Pedrosa', email: 'rodrigo.pedrosa@banco.com.br' } } }

  if (method === 'GET' && path === '/dashboard')
    return { status: 200, data: buildDashboard() }

  if (method === 'GET' && path === '/audiencias')
    return { status: 200, data: audiencias }

  const audId = path.match(/^\/audiencias\/([^/]+)$/)
  if (audId) {
    const aud = audiencias.find(a => a.id === audId[1])
    if (method === 'GET') return aud ? { status: 200, data: aud } : { status: 404, data: { erro: 'Não encontrada' } }
    if (method === 'PATCH' && aud) { Object.assign(aud, body); return { status: 200, data: aud } }
  }

  const audPart = path.match(/^\/audiencias\/([^/]+)\/participantes$/)
  if (audPart && method === 'GET') {
    const aud = audiencias.find(a => a.id === audPart[1])
    return aud ? { status: 200, data: aud.participantes } : { status: 404, data: { erro: 'Não encontrada' } }
  }

  const audChk = path.match(/^\/audiencias\/([^/]+)\/checkins$/)
  if (audChk && method === 'GET')
    return { status: 200, data: checkins.filter(c => c.audiencia_id === audChk[1]) }

  if (method === 'POST' && path === '/audiencias') {
    const nova = { id: `AUD-${String(audiencias.length + 1).padStart(3, '0')}`, ...body, status: 'agendada', presentes: 0, ausentes: 0, taxa_presenca: 0, participantes: [] } as any
    audiencias.push(nova)
    return { status: 201, data: nova }
  }

  if (method === 'GET' && path === '/checkins')
    return { status: 200, data: checkins }

  if (method === 'POST' && path === '/checkins') {
    const id = `CHK-${String(checkins.length + 1).padStart(3, '0')}`
    const evId = `EV-${String(evidencias.length + 1).padStart(3, '0')}`
    const novo = { id, evidencia_id: evId, audiencia_id: body?.audiencia_id, usuario_id: 'USR-001', usuario_nome: 'Rodrigo Pedrosa', timestamp: new Date().toISOString(), latitude: body?.latitude, longitude: body?.longitude, precisao_metros: body?.precisao_metros, dentro_geofence: true, distancia_do_local_metros: 10, modo_offline: body?.modo_offline || false, editado: false, hash_sha256: id }
    checkins.push(novo)
    return { status: 201, data: { id, evidencia_id: evId, hash_sha256: id, mensagem: 'Check-in registrado!', timestamp: novo.timestamp } }
  }

  const chkPatch = path.match(/^\/checkins\/([^/]+)$/)
  if (chkPatch && method === 'PATCH') {
    const chk = checkins.find(c => c.id === chkPatch[1])
    if (chk) { Object.assign(chk, body, { editado: true }); return { status: 200, data: chk } }
    return { status: 404, data: { erro: 'Não encontrado' } }
  }

  if (method === 'GET' && path === '/notificacoes')
    return { status: 200, data: { data: notificacoes } }

  if (method === 'GET' && path === '/evidencias')
    return { status: 200, data: { data: evidencias } }

  const evById = path.match(/^\/evidencias\/([^/]+)$/)
  if (evById && method === 'GET') {
    const ev = evidencias.find(e => e.id === evById[1])
    return ev ? { status: 200, data: ev } : { status: 404, data: { erro: 'Não encontrada' } }
  }

  if (method === 'GET' && path === '/auditoria')
    return { status: 200, data: { data: auditoria } }

  if (method === 'GET' && path === '/usuarios')
    return { status: 200, data: { data: usuarios } }

  if (method === 'GET' && path === '/perfis')
    return { status: 200, data: { data: perfis } }

  if (method === 'GET' && path === '/questionarios/templates')
    return { status: 200, data: questionarioTemplates }

  if (method === 'GET' && path === '/questionarios/respostas')
    return { status: 200, data: [] }

  if (method === 'POST' && path === '/questionarios/respostas')
    return { status: 201, data: { id: `QR-${Date.now()}`, ...body, enviado_em: new Date().toISOString() } }

  if (method === 'POST' && path === '/upload/participantes')
    return { status: 200, data: { sucesso: true, processados: 10, erros: 0, mensagem: '10 participantes importados.' } }

  return null
}

export function installMockAdapter(axiosInstance: AxiosInstance) {
  const originalAdapter = axiosInstance.defaults.adapter

  axiosInstance.defaults.adapter = (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    const method = (config.method || 'get').toUpperCase()
    const url = (config.url || '').replace(/^\/api\/v1/, '')
    let body: any
    if (config.data) {
      try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data } catch { body = config.data }
    }

    const result = route(method, url, body)
    if (result) {
      return Promise.resolve({
        data: result.data,
        status: result.status,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse)
    }

    if (typeof originalAdapter === 'function') return originalAdapter(config)
    return Promise.reject(new Error(`No adapter and no mock for ${method} ${url}`))
  }
}
