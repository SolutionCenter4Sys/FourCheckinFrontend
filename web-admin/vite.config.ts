import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import type { Plugin, Connect } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'

// ─── Dados Mock ───────────────────────────────────────────────────────────────

const hoje = new Date().toISOString().split('T')[0]
const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0]

const audiencias = [
  {
    id: 'AUD-001',
    nome: 'Conciliação — Contrato 2024/0012',
    departamento: 'Jurídico Contencioso — Dr. Carlos Mendes',
    data: hoje,
    horario_inicio: '09:00',
    horario_fim: '10:30',
    local: 'Sala de Reuniões A — 3º Andar',
    latitude: -23.5505, longitude: -46.6333,
    raio_geofence_metros: 150,
    status: 'em_andamento',
    total_participantes: 12, presentes: 9, ausentes: 3, taxa_presenca: 0.75,
    pre_checkin_habilitado: true, offline_habilitado: true, questionario_habilitado: true,
    participantes: [
      { id: 'P-001', nome: 'Ana Souza',      email: 'ana.souza@banco.com.br',      matricula: 'MAT-001', departamento: 'Jurídico Contencioso', cargo: 'Advogada',   perfil_rbac: 'participante', avatar_iniciais: 'AS', checkin: { realizado: true,  timestamp: `${hoje}T08:58:00.000Z`, latitude: -23.5505, longitude: -46.6333, precisao_metros: 5,  dentro_geofence: true,  evidencia_id: 'EV-001', hash_sha256: 'a3f5d8e2b1c4f7a9d2e5b8c1f4a7d0e3' } },
      { id: 'P-002', nome: 'Bruno Lima',     email: 'bruno.lima@banco.com.br',     matricula: 'MAT-002', departamento: 'Jurídico Trabalhista', cargo: 'Testemunha', perfil_rbac: 'participante', avatar_iniciais: 'BL', checkin: { realizado: true,  timestamp: `${hoje}T09:02:00.000Z`, latitude: -23.5506, longitude: -46.6334, precisao_metros: 8,  dentro_geofence: true,  evidencia_id: 'EV-002', hash_sha256: 'b4g6e9f3c2d5g8b1e4f7c0d3g6b9e2f5' } },
      { id: 'P-003', nome: 'Carla Nunes',    email: 'carla.nunes@banco.com.br',    matricula: 'MAT-003', departamento: 'Jurídico Cível',       cargo: 'Requerente', perfil_rbac: 'participante', avatar_iniciais: 'CN', checkin: { realizado: false, timestamp: null,                        latitude: null,     longitude: null,     precisao_metros: null, dentro_geofence: null,  evidencia_id: null,     hash_sha256: null } },
      { id: 'P-004', nome: 'Diego Faria',    email: 'diego.faria@banco.com.br',    matricula: 'MAT-004', departamento: 'Jurídico Corporativo', cargo: 'Advogado',   perfil_rbac: 'participante', avatar_iniciais: 'DF', checkin: { realizado: true,  timestamp: `${hoje}T09:05:00.000Z`, latitude: -23.5504, longitude: -46.6332, precisao_metros: 6,  dentro_geofence: true,  evidencia_id: 'EV-003', hash_sha256: 'c5h7f0g4d3e6h9c2f5g8d1e4h7c0f3g6' } },
      { id: 'P-005', nome: 'Elisa Torres',   email: 'elisa.torres@banco.com.br',   matricula: 'MAT-005', departamento: 'Compliance',           cargo: 'Requerida',  perfil_rbac: 'participante', avatar_iniciais: 'ET', checkin: { realizado: false, timestamp: null,                        latitude: null,     longitude: null,     precisao_metros: null, dentro_geofence: null,  evidencia_id: null,     hash_sha256: null } },
      { id: 'P-006', nome: 'Felipe Gomes',   email: 'felipe.gomes@banco.com.br',   matricula: 'MAT-006', departamento: 'Perícia Técnica',      cargo: 'Perito',     perfil_rbac: 'participante', avatar_iniciais: 'FG', checkin: { realizado: true,  timestamp: `${hoje}T08:55:00.000Z`, latitude: -23.5507, longitude: -46.6335, precisao_metros: 4,  dentro_geofence: true,  evidencia_id: 'EV-004', hash_sha256: 'd6i8g1h5e4f7i0d3g6h9e2f5i8d1g4h7' } },
      { id: 'P-007', nome: 'Gabriela Ramos', email: 'gabriela.ramos@banco.com.br', matricula: 'MAT-007', departamento: 'Assessoria Jurídica',  cargo: 'Assessora',  perfil_rbac: 'participante', avatar_iniciais: 'GR', checkin: { realizado: true,  timestamp: `${hoje}T09:10:00.000Z`, latitude: -23.5503, longitude: -46.6331, precisao_metros: 10, dentro_geofence: true,  evidencia_id: 'EV-005', hash_sha256: 'e7j9h2i6f5g8j1e4h7i0f3g6j9e2h5i8' } },
      { id: 'P-008', nome: 'Henrique Alves', email: 'henrique.alves@banco.com.br', matricula: 'MAT-008', departamento: 'Jurídico Contencioso', cargo: 'Advogado',   perfil_rbac: 'participante', avatar_iniciais: 'HA', checkin: { realizado: true,  timestamp: `${hoje}T09:03:00.000Z`, latitude: -23.5508, longitude: -46.6336, precisao_metros: 7,  dentro_geofence: true,  evidencia_id: 'EV-006', hash_sha256: 'f8k0i3j7g6h9k2f5i8j1g4h7k0f3i6j9' } },
      { id: 'P-009', nome: 'Isabel Costa',   email: 'isabel.costa@banco.com.br',   matricula: 'MAT-009', departamento: 'Mediação',             cargo: 'Mediadora',  perfil_rbac: 'gestor',       avatar_iniciais: 'IC', checkin: { realizado: true,  timestamp: `${hoje}T08:50:00.000Z`, latitude: -23.5502, longitude: -46.6330, precisao_metros: 3,  dentro_geofence: true,  evidencia_id: 'EV-007', hash_sha256: 'g9l1j4k8h7i0l3g6j9k2h5i8l1g4j7k0' } },
      { id: 'P-010', nome: 'João Martins',   email: 'joao.martins@banco.com.br',   matricula: 'MAT-010', departamento: 'Jurídico Trabalhista', cargo: 'Testemunha', perfil_rbac: 'participante', avatar_iniciais: 'JM', checkin: { realizado: false, timestamp: null,                        latitude: null,     longitude: null,     precisao_metros: null, dentro_geofence: null,  evidencia_id: null,     hash_sha256: null } },
      { id: 'P-011', nome: 'Kátia Freitas',  email: 'katia.freitas@banco.com.br',  matricula: 'MAT-011', departamento: 'Jurídico Cível',       cargo: 'Advogada',   perfil_rbac: 'participante', avatar_iniciais: 'KF', checkin: { realizado: true,  timestamp: `${hoje}T09:08:00.000Z`, latitude: -23.5509, longitude: -46.6337, precisao_metros: 9,  dentro_geofence: true,  evidencia_id: 'EV-008', hash_sha256: 'h0m2k5l9i8j1m4h7k0l3i6j9m2h5k8l1' } },
      { id: 'P-012', nome: 'Lucas Barbosa',  email: 'lucas.barbosa@banco.com.br',  matricula: 'MAT-012', departamento: 'Jurídico Corporativo', cargo: 'Advogado',   perfil_rbac: 'participante', avatar_iniciais: 'LB', checkin: { realizado: true,  timestamp: `${hoje}T09:15:00.000Z`, latitude: -23.5501, longitude: -46.6329, precisao_metros: 11, dentro_geofence: true,  evidencia_id: 'EV-009', hash_sha256: 'i1n3l6m0j9k2n5i8l1m4j7k0n3i6l9m2' } },
    ],
  },
  {
    id: 'AUD-002',
    nome: 'Trabalhista — Processo 0045/2025',
    departamento: 'Jurídico Trabalhista — Dra. Fernanda Lopes',
    data: hoje,
    horario_inicio: '11:00', horario_fim: '12:30',
    local: 'Sala Virtual — Microsoft Teams',
    latitude: -23.5489, longitude: -46.6388,
    raio_geofence_metros: 200,
    status: 'agendada',
    total_participantes: 6, presentes: 0, ausentes: 0, taxa_presenca: 0,
    pre_checkin_habilitado: true, offline_habilitado: false, questionario_habilitado: false,
    participantes: [
      { id: 'P-013', nome: 'Marcos Oliveira', email: 'marcos.oliveira@banco.com.br', matricula: 'MAT-013', departamento: 'Jurídico Trabalhista', cargo: 'Reclamante', perfil_rbac: 'participante', avatar_iniciais: 'MO', checkin: { realizado: false, timestamp: null, latitude: null, longitude: null, precisao_metros: null, dentro_geofence: null, evidencia_id: null, hash_sha256: null } },
      { id: 'P-014', nome: 'Natália Cunha',   email: 'natalia.cunha@banco.com.br',   matricula: 'MAT-014', departamento: 'Jurídico Trabalhista', cargo: 'Advogada',   perfil_rbac: 'participante', avatar_iniciais: 'NC', checkin: { realizado: false, timestamp: null, latitude: null, longitude: null, precisao_metros: null, dentro_geofence: null, evidencia_id: null, hash_sha256: null } },
      { id: 'P-015', nome: 'Oscar Ribeiro',   email: 'oscar.ribeiro@banco.com.br',   matricula: 'MAT-015', departamento: 'Operações',            cargo: 'Reclamado',  perfil_rbac: 'participante', avatar_iniciais: 'OR', checkin: { realizado: false, timestamp: null, latitude: null, longitude: null, precisao_metros: null, dentro_geofence: null, evidencia_id: null, hash_sha256: null } },
      { id: 'P-016', nome: 'Paula Vieira',    email: 'paula.vieira@banco.com.br',    matricula: 'MAT-016', departamento: 'Jurídico Corporativo', cargo: 'Advogada',   perfil_rbac: 'participante', avatar_iniciais: 'PV', checkin: { realizado: false, timestamp: null, latitude: null, longitude: null, precisao_metros: null, dentro_geofence: null, evidencia_id: null, hash_sha256: null } },
      { id: 'P-017', nome: 'Rafael Santos',   email: 'rafael.santos@banco.com.br',   matricula: 'MAT-017', departamento: 'RH',                   cargo: 'Testemunha', perfil_rbac: 'participante', avatar_iniciais: 'RS', checkin: { realizado: false, timestamp: null, latitude: null, longitude: null, precisao_metros: null, dentro_geofence: null, evidencia_id: null, hash_sha256: null } },
      { id: 'P-018', nome: 'Sandra Melo',     email: 'sandra.melo@banco.com.br',     matricula: 'MAT-018', departamento: 'Mediação',             cargo: 'Mediadora',  perfil_rbac: 'gestor',       avatar_iniciais: 'SM', checkin: { realizado: false, timestamp: null, latitude: null, longitude: null, precisao_metros: null, dentro_geofence: null, evidencia_id: null, hash_sha256: null } },
    ],
  },
  {
    id: 'AUD-003',
    nome: 'Mediação Cível — Contrato 2023/0789',
    departamento: 'Jurídico Cível — Dr. Alberto Pinto',
    data: hoje,
    horario_inicio: '14:00', horario_fim: '16:00',
    local: 'Sala de Reuniões B — 5º Andar',
    latitude: -23.5521, longitude: -46.6311,
    raio_geofence_metros: 100,
    status: 'agendada',
    total_participantes: 8, presentes: 0, ausentes: 0, taxa_presenca: 0,
    pre_checkin_habilitado: true, offline_habilitado: true, questionario_habilitado: true,
    participantes: [],
  },
  {
    id: 'AUD-004',
    nome: 'Instrução — Processo 0112/2024',
    departamento: 'Jurídico Corporativo — Dra. Renata Campos',
    data: ontem,
    horario_inicio: '10:00', horario_fim: '12:00',
    local: 'Fórum Central — Sala 7',
    latitude: -23.5461, longitude: -46.6414,
    raio_geofence_metros: 120,
    status: 'encerrada',
    total_participantes: 10, presentes: 10, ausentes: 0, taxa_presenca: 1,
    pre_checkin_habilitado: false, offline_habilitado: false, questionario_habilitado: false,
    participantes: [],
  },
]

const checkins = [
  { id: 'CHK-001', audiencia_id: 'AUD-001', audiencia_nome: 'Audiência de Conciliação — Contrato 2024/0012', participante_id: 'P-001', participante_nome: 'Ana Souza',   data: hoje, horario: '08:58', timestamp: new Date(Date.now() - 3600000).toISOString(), local: 'Sala de Reuniões A — 3º Andar', status: 'confirmado', modo_offline: false, hash_sha256: 'a3f5d8e2b1c4f7a9d2e5b8c1f4a7d0e3b6c9f2a5d8e1b4c7f0a3d6e9b2c5f8a1', latitude: -23.5505, longitude: -46.6333, precisao_metros: 5 },
  { id: 'CHK-002', audiencia_id: 'AUD-001', audiencia_nome: 'Audiência de Conciliação — Contrato 2024/0012', participante_id: 'P-002', participante_nome: 'Bruno Lima',  data: hoje, horario: '09:02', timestamp: new Date(Date.now() - 3400000).toISOString(), local: 'Sala de Reuniões A — 3º Andar', status: 'confirmado', modo_offline: false, hash_sha256: 'b4g6e9f3c2d5g8b1e4f7c0d3g6b9e2f5c8d1g4b7e0f3c6d9g2b5e8f1c4d7g0b2', latitude: -23.5506, longitude: -46.6334, precisao_metros: 8 },
  { id: 'CHK-003', audiencia_id: 'AUD-004', audiencia_nome: 'Audiência de Instrução — Processo 0112/2024',   participante_id: 'P-006', participante_nome: 'Felipe Gomes', data: ontem, horario: '09:55', timestamp: new Date(Date.now() - 86400000).toISOString(), local: 'Fórum Central — Sala 7',           status: 'confirmado', modo_offline: true,  hash_sha256: 'c5h7f0g4d3e6h9c2f5g8d1e4h7c0f3g6d9e2h5c8f1g4d7e0h3c6f9g2d5e8h1c3', latitude: -23.5461, longitude: -46.6414, precisao_metros: 12 },
]

const notificacoes = [
  { id: 'NOT-001', tipo: 'alerta',  titulo: 'Ausência Crítica Detectada', mensagem: 'Carla Nunes (Requerente) não realizou check-in na AUD-001.', data_hora: new Date(Date.now() - 600000).toISOString(),  lida: false, audiencia_id: 'AUD-001' },
  { id: 'NOT-002', tipo: 'alerta',  titulo: 'Ausência Crítica Detectada', mensagem: 'Elisa Torres (Requerida) não realizou check-in na AUD-001.',  data_hora: new Date(Date.now() - 540000).toISOString(),  lida: false, audiencia_id: 'AUD-001' },
  { id: 'NOT-003', tipo: 'info',    titulo: 'Audiência AUD-002 Confirmada', mensagem: 'Audiência Trabalhista agendada para 11:00.',                  data_hora: new Date(Date.now() - 7200000).toISOString(), lida: true,  audiencia_id: 'AUD-002' },
  { id: 'NOT-004', tipo: 'sucesso', titulo: 'Check-in Registrado',          mensagem: 'Ana Souza realizou check-in às 08:58.',                       data_hora: new Date(Date.now() - 3700000).toISOString(), lida: true,  audiencia_id: 'AUD-001' },
  { id: 'NOT-005', tipo: 'info',    titulo: 'Novo Participante Adicionado', mensagem: 'Lucas Barbosa adicionado via upload CSV.',                    data_hora: new Date(Date.now() - 10800000).toISOString(),lida: true,  audiencia_id: 'AUD-001' },
]

const evidencias = [
  { id: 'EV-001', checkin_id: 'CHK-001', audiencia_id: 'AUD-001', participante_nome: 'Ana Souza',   tipo: 'checkin_geolocalizacao', timestamp: new Date(Date.now() - 3600000).toISOString(),  hash_sha256: 'a3f5d8e2b1c4f7a9d2e5b8c1f4a7d0e3b6c9f2a5d8e1b4c7f0a3d6e9b2c5f8a1', integra: true },
  { id: 'EV-002', checkin_id: 'CHK-002', audiencia_id: 'AUD-001', participante_nome: 'Bruno Lima',  tipo: 'checkin_geolocalizacao', timestamp: new Date(Date.now() - 3400000).toISOString(),  hash_sha256: 'b4g6e9f3c2d5g8b1e4f7c0d3g6b9e2f5c8d1g4b7e0f3c6d9g2b5e8f1c4d7g0b2', integra: true },
  { id: 'EV-003', checkin_id: 'CHK-003', audiencia_id: 'AUD-004', participante_nome: 'Felipe Gomes',tipo: 'checkin_offline',        timestamp: new Date(Date.now() - 86400000).toISOString(), hash_sha256: 'c5h7f0g4d3e6h9c2f5g8d1e4h7c0f3g6d9e2h5c8f1g4d7e0h3c6f9g2d5e8h1c3', integra: true },
]

const auditoria = [
  { id: 'AUD-LOG-001', usuario: 'admin@banco.com.br',        acao: 'AUDIENCIA_CRIADA',  recurso: 'Audiência AUD-001', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), ip: '10.0.1.42',    detalhes: 'Criada com 12 participantes' },
  { id: 'AUD-LOG-002', usuario: 'admin@banco.com.br',        acao: 'CSV_UPLOAD',        recurso: 'Participantes AUD-001', timestamp: new Date(Date.now() - 86400000).toISOString(),   ip: '10.0.1.42',    detalhes: 'Upload CSV com 12 participantes' },
  { id: 'AUD-LOG-003', usuario: 'ana.souza@banco.com.br',    acao: 'CHECKIN_REALIZADO', recurso: 'CHK-001',           timestamp: new Date(Date.now() - 3600000).toISOString(),        ip: '192.168.1.55', detalhes: 'Check-in com precisão de 5m' },
  { id: 'AUD-LOG-004', usuario: 'sistema',                   acao: 'ALERTA_GERADO',    recurso: 'NOT-001',           timestamp: new Date(Date.now() - 600000).toISOString(),         ip: '10.0.0.1',     detalhes: 'Ausência crítica: Carla Nunes' },
]

const usuarios = [
  { id: 'USR-001', nome: 'Rodrigo Pedrosa', email: 'rodrigo.pedrosa@banco.com.br', perfil: 'admin',        status: 'ativo', ultimo_acesso: new Date(Date.now() - 3600000).toISOString() },
  { id: 'USR-002', nome: 'Ana Souza',       email: 'ana.souza@banco.com.br',       perfil: 'participante', status: 'ativo', ultimo_acesso: new Date(Date.now() - 3400000).toISOString() },
  { id: 'USR-003', nome: 'Bruno Lima',      email: 'bruno.lima@banco.com.br',      perfil: 'participante', status: 'ativo', ultimo_acesso: new Date(Date.now() - 3200000).toISOString() },
  { id: 'USR-004', nome: 'Fernanda Lopes',  email: 'fernanda.lopes@banco.com.br',  perfil: 'gestor',       status: 'ativo', ultimo_acesso: new Date(Date.now() - 7200000).toISOString() },
  { id: 'USR-005', nome: 'Carlos Mendes',   email: 'carlos.mendes@banco.com.br',   perfil: 'gestor',       status: 'ativo', ultimo_acesso: new Date(Date.now() - 14400000).toISOString() },
]

const perfis = [
  { id: 'ROLE-001', nome: 'admin',        descricao: 'Administrador — acesso total',                           permissoes: ['*'] },
  { id: 'ROLE-002', nome: 'gestor',       descricao: 'Gestor — cria e gerencia audiências',                    permissoes: ['audiencias:read', 'audiencias:write', 'checkins:read'] },
  { id: 'ROLE-003', nome: 'participante', descricao: 'Participante — realiza check-in',                        permissoes: ['audiencias:read', 'checkins:write'] },
  { id: 'ROLE-004', nome: 'auditoria',    descricao: 'Auditor — somente leitura',                              permissoes: ['audiencias:read', 'checkins:read', 'auditoria:read'] },
]

const questionarioTemplates = [
  {
    id: 'QT-001', titulo: 'Pesquisa de Satisfação — Padrão',
    perguntas: [
      { id: 'p1', texto: 'Como você avalia o ambiente da audiência?',  tipo: 'escala',           obrigatoria: true },
      { id: 'p2', texto: 'O processo de check-in foi fácil?',          tipo: 'multipla_escolha', opcoes: ['Sim', 'Não', 'Parcialmente'], obrigatoria: true },
      { id: 'p3', texto: 'A duração foi adequada?',                    tipo: 'multipla_escolha', opcoes: ['Muito curta', 'Adequada', 'Muito longa'], obrigatoria: true },
      { id: 'p4', texto: 'Comentários adicionais',                     tipo: 'texto',            obrigatoria: false },
    ],
  },
]

function buildDashboard() {
  const audienciasHoje = audiencias.filter(a => a.data === hoje)
  const emAndamento    = audienciasHoje.filter(a => a.status === 'em_andamento')
  const totalPresentes = audienciasHoje.reduce((s, a) => s + a.presentes, 0)
  const totalPart      = audienciasHoje.reduce((s, a) => s + a.total_participantes, 0)
  const taxa           = totalPart > 0 ? totalPresentes / totalPart : 0
  const checkinsHoje   = checkins.filter(c => c.data === hoje)
  const alertasAtivos  = notificacoes.filter(n => !n.lida && n.tipo === 'alerta')

  return {
    kpis: {
      audiencias_hoje:           { valor: audienciasHoje.length, em_andamento: emAndamento.length },
      total_participantes_hoje:  { valor: totalPart, presentes: totalPresentes },
      taxa_presenca_geral:       { percentual: `${(taxa * 100).toFixed(0)}%`, meta: 0.85, atingiu_meta: taxa >= 0.85 },
      checkins_realizados_hoje:  { valor: checkinsHoje.length, mobile: checkinsHoje.filter(c => !c.modo_offline).length },
      alertas_ativos:            { valor: alertasAtivos.length, ausencias_criticas: alertasAtivos.length },
      evidencias_geradas:        { total: evidencias.length, integras: evidencias.filter(e => e.integra).length, taxa_integridade: evidencias.length ? evidencias.filter(e => e.integra).length / evidencias.length : 1 },
    },
    audiencias_ativas: emAndamento.map(a => ({
      id: a.id, nome: a.nome,
      horario: `${a.horario_inicio} – ${a.horario_fim}`,
      local: a.local, presentes: a.presentes, total: a.total_participantes,
      taxa: a.total_participantes > 0 ? a.presentes / a.total_participantes : 0,
    })),
    alertas_recentes: alertasAtivos.slice(0, 5).map(n => ({
      id: n.id,
      usuario: n.mensagem.split(' ').slice(0, 2).join(' '),
      tempo_decorrido_min: Math.floor((Date.now() - new Date(n.data_hora).getTime()) / 60000),
      audiencia: n.audiencia_id,
    })),
  }
}

// ─── Plugin Mock ──────────────────────────────────────────────────────────────

function mockApiPlugin(): Plugin {
  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
        const url  = (req.url || '').split('?')[0].replace(/\/$/, '')
        const method = (req.method || 'GET').toUpperCase()

        if (!url.startsWith('/api/v1')) { next(); return }

        const json = (status: number, data: unknown) => {
          const body = JSON.stringify(data)
          res.writeHead(status, { 'Content-Type': 'application/json' })
          res.end(body)
        }

        const readBody = (): Promise<Record<string, unknown>> =>
          new Promise(resolve => {
            let raw = ''
            req.on('data', (chunk: Buffer) => { raw += chunk.toString() })
            req.on('end', () => { try { resolve(JSON.parse(raw || '{}')) } catch { resolve({}) } })
          })

        console.log(`[mock] ${method} ${url}`)

        // Auth
        if (method === 'POST' && url === '/api/v1/auth/token') {
          json(200, { access_token: 'mock-token-foursys', token_type: 'Bearer', expires_in: 86400, user: { name: 'Rodrigo Pedrosa', email: 'rodrigo.pedrosa@banco.com.br' } })
          return
        }

        // Dashboard
        if (method === 'GET' && url === '/api/v1/dashboard') { json(200, buildDashboard()); return }

        // Audiências
        if (method === 'GET' && url === '/api/v1/audiencias') { json(200, audiencias); return }

        const audId = url.match(/^\/api\/v1\/audiencias\/([^/]+)$/)
        if (audId) {
          const aud = audiencias.find(a => a.id === audId[1])
          if (method === 'GET') { aud ? json(200, aud) : json(404, { erro: 'Não encontrada' }); return }
          if (method === 'PATCH') {
            readBody().then(body => {
              const idx = audiencias.findIndex(a => a.id === audId[1])
              if (idx === -1) { json(404, { erro: 'Não encontrada' }); return }
              Object.assign(audiencias[idx], body)
              json(200, audiencias[idx])
            })
            return
          }
        }

        const audPart = url.match(/^\/api\/v1\/audiencias\/([^/]+)\/participantes$/)
        if (audPart && method === 'GET') {
          const aud = audiencias.find(a => a.id === audPart[1])
          aud ? json(200, aud.participantes) : json(404, { erro: 'Não encontrada' })
          return
        }

        const audChk = url.match(/^\/api\/v1\/audiencias\/([^/]+)\/checkins$/)
        if (audChk && method === 'GET') { json(200, checkins.filter(c => c.audiencia_id === audChk[1])); return }

        if (method === 'POST' && url === '/api/v1/audiencias') {
          readBody().then(body => {
            const nova = { id: `AUD-${String(audiencias.length + 1).padStart(3, '0')}`, ...body, status: 'agendada', presentes: 0, ausentes: 0, taxa_presenca: 0 }
            audiencias.push(nova as typeof audiencias[0])
            json(201, nova)
          })
          return
        }

        // Check-ins
        if (method === 'GET' && url === '/api/v1/checkins') { json(200, checkins); return }

        if (method === 'POST' && url === '/api/v1/checkins') {
          readBody().then(body => {
            const hash = Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')
            const novo = {
              id: `CHK-${String(checkins.length + 1).padStart(3, '0')}`,
              audiencia_id: body.audiencia_id as string,
              audiencia_nome: audiencias.find(a => a.id === body.audiencia_id)?.titulo || 'Audiência',
              data: hoje, horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              timestamp: new Date().toISOString(),
              local: audiencias.find(a => a.id === body.audiencia_id)?.local || 'Local',
              status: 'confirmado', modo_offline: body.modo_offline || false, hash_sha256: hash,
              latitude: body.latitude as number, longitude: body.longitude as number, precisao_metros: body.precisao_metros as number,
              participante_id: 'USR-001', participante_nome: 'Rodrigo Pedrosa',
            }
            checkins.push(novo)
            json(201, { id: novo.id, evidencia_id: `EV-${String(evidencias.length + 1).padStart(3, '0')}`, hash_sha256: hash, mensagem: 'Check-in registrado com sucesso!', timestamp: novo.timestamp })
          })
          return
        }

        // Notificações
        if (method === 'GET' && url === '/api/v1/notificacoes') { json(200, notificacoes); return }

        // Evidências
        if (method === 'GET' && url === '/api/v1/evidencias') { json(200, evidencias); return }
        const evId = url.match(/^\/api\/v1\/evidencias\/([^/]+)$/)
        if (evId && method === 'GET') { const ev = evidencias.find(e => e.id === evId[1]); ev ? json(200, ev) : json(404, { erro: 'Não encontrada' }); return }

        // Auditoria
        if (method === 'GET' && url === '/api/v1/auditoria') { json(200, auditoria); return }

        // Usuários e Perfis
        if (method === 'GET' && url === '/api/v1/usuarios') { json(200, usuarios); return }
        if (method === 'GET' && url === '/api/v1/perfis')   { json(200, perfis);   return }

        // Questionários
        if (method === 'GET' && url === '/api/v1/questionarios/templates') { json(200, questionarioTemplates); return }
        if (method === 'GET' && url === '/api/v1/questionarios/respostas')  { json(200, []); return }
        if (method === 'POST' && url === '/api/v1/questionarios/respostas') { readBody().then(body => json(201, { id: `QR-${Date.now()}`, ...body, enviado_em: new Date().toISOString() })); return }

        // Upload
        if (method === 'POST' && url === '/api/v1/upload/participantes') { json(200, { sucesso: true, processados: 10, erros: 0, mensagem: '10 participantes importados.' }); return }

        // Rota não encontrada (ainda dentro de /api/v1)
        json(404, { erro: `Rota não encontrada: ${method} ${url}` })
      })
    },
  }
}

// ─── Config ───────────────────────────────────────────────────────────────────

export default defineConfig({
  plugins: [react(), mockApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
})
