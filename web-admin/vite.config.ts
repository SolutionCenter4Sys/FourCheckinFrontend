import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import type { Plugin, Connect } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'

// ═══════════════════════════════════════════════════════════════════════════════
// Utilitários de data
// ═══════════════════════════════════════════════════════════════════════════════
const hoje = new Date().toISOString().split('T')[0]
const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0]
const anteontem = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0]

function hojeISO(h: number, m: number): string {
  const d = new Date(); d.setHours(h, m, 0, 0); return d.toISOString()
}
function ontemISO(h: number, m: number): string {
  const d = new Date(Date.now() - 86400000); d.setHours(h, m, 0, 0); return d.toISOString()
}
function anteontemISO(h: number, m: number): string {
  const d = new Date(Date.now() - 86400000 * 2); d.setHours(h, m, 0, 0); return d.toISOString()
}
function sha256fake(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0
  const hex = Math.abs(h).toString(16).padStart(8, '0')
  return (hex.repeat(8)).substring(0, 64)
}

// ═══════════════════════════════════════════════════════════════════════════════
// Perfis RBAC — 4 perfis, total_usuarios coerente com array de usuarios
// ═══════════════════════════════════════════════════════════════════════════════
const perfis = [
  {
    id: 'ROLE-001', nome: 'Administrador', descricao: 'Acesso total ao sistema', cor: '#FF6600',
    total_usuarios: 2,
    permissoes: {
      audiencias:   { visualizar: true, criar: true, editar: true, excluir: true, exportar: true },
      checkins:     { visualizar: true, criar: true, editar: true, excluir: true, exportar: true },
      participantes:{ visualizar: true, criar: true, editar: true, excluir: true, exportar: true },
      evidencias:   { visualizar: true, criar: false, editar: false, excluir: false, exportar: true },
      auditoria:    { visualizar: true, criar: false, editar: false, excluir: false, exportar: true },
      rbac:         { visualizar: true, criar: true, editar: true, excluir: true, exportar: false },
      notificacoes: { visualizar: true, criar: true, editar: true, excluir: true, exportar: true },
    },
  },
  {
    id: 'ROLE-002', nome: 'Gestor Jurídico', descricao: 'Cria e gerencia audiências do seu departamento', cor: '#3B82F6',
    total_usuarios: 3,
    permissoes: {
      audiencias:   { visualizar: true, criar: true, editar: true, excluir: false, exportar: true },
      checkins:     { visualizar: true, criar: false, editar: false, excluir: false, exportar: true },
      participantes:{ visualizar: true, criar: true, editar: true, excluir: false, exportar: true },
      evidencias:   { visualizar: true, criar: false, editar: false, excluir: false, exportar: true },
      auditoria:    { visualizar: true, criar: false, editar: false, excluir: false, exportar: false },
      notificacoes: { visualizar: true, criar: false, editar: false, excluir: false, exportar: false },
    },
  },
  {
    id: 'ROLE-003', nome: 'Participante', descricao: 'Realiza check-in e responde questionários', cor: '#10B981',
    total_usuarios: 7,
    permissoes: {
      audiencias:   { visualizar: true, criar: false, editar: false, excluir: false, exportar: false },
      checkins:     { visualizar: true, criar: true, editar: false, excluir: false, exportar: false },
      participantes:{ visualizar: false, criar: false, editar: false, excluir: false, exportar: false },
      evidencias:   { visualizar: false, criar: false, editar: false, excluir: false, exportar: false },
    },
  },
  {
    id: 'ROLE-004', nome: 'Auditor', descricao: 'Somente leitura — compliance e auditoria', cor: '#8B5CF6',
    total_usuarios: 2,
    permissoes: {
      audiencias:   { visualizar: true, criar: false, editar: false, excluir: false, exportar: true },
      checkins:     { visualizar: true, criar: false, editar: false, excluir: false, exportar: true },
      evidencias:   { visualizar: true, criar: false, editar: false, excluir: false, exportar: true },
      auditoria:    { visualizar: true, criar: false, editar: false, excluir: false, exportar: true },
      notificacoes: { visualizar: true, criar: false, editar: false, excluir: false, exportar: true },
    },
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// Usuarios — 14 no total (2 admin + 3 gestor + 7 participante + 2 auditor)
// ═══════════════════════════════════════════════════════════════════════════════
const usuarios = [
  { id: 'USR-001', nome: 'Rodrigo Pedrosa',   email: 'rodrigo.pedrosa@banco.com.br',   matricula: 'MAT-001', departamento: 'TI — Sistemas',           perfil_id: 'ROLE-001', perfil_nome: 'Administrador',  ativo: true,  ultimo_acesso: hojeISO(8, 30) },
  { id: 'USR-002', nome: 'Marina Campos',     email: 'marina.campos@banco.com.br',     matricula: 'MAT-002', departamento: 'TI — Segurança',          perfil_id: 'ROLE-001', perfil_nome: 'Administrador',  ativo: true,  ultimo_acesso: hojeISO(9, 15) },
  { id: 'USR-003', nome: 'Carlos Mendes',     email: 'carlos.mendes@banco.com.br',     matricula: 'MAT-003', departamento: 'Jurídico Contencioso',    perfil_id: 'ROLE-002', perfil_nome: 'Gestor Jurídico',ativo: true,  ultimo_acesso: hojeISO(8, 0) },
  { id: 'USR-004', nome: 'Fernanda Lopes',    email: 'fernanda.lopes@banco.com.br',    matricula: 'MAT-004', departamento: 'Jurídico Trabalhista',    perfil_id: 'ROLE-002', perfil_nome: 'Gestor Jurídico',ativo: true,  ultimo_acesso: hojeISO(7, 45) },
  { id: 'USR-005', nome: 'Alberto Pinto',     email: 'alberto.pinto@banco.com.br',     matricula: 'MAT-005', departamento: 'Jurídico Cível',          perfil_id: 'ROLE-002', perfil_nome: 'Gestor Jurídico',ativo: true,  ultimo_acesso: ontemISO(16, 30) },
  { id: 'USR-006', nome: 'Ana Souza',         email: 'ana.souza@banco.com.br',         matricula: 'MAT-006', departamento: 'Jurídico Contencioso',    perfil_id: 'ROLE-003', perfil_nome: 'Participante',   ativo: true,  ultimo_acesso: hojeISO(8, 58) },
  { id: 'USR-007', nome: 'Bruno Lima',        email: 'bruno.lima@banco.com.br',        matricula: 'MAT-007', departamento: 'Jurídico Trabalhista',    perfil_id: 'ROLE-003', perfil_nome: 'Participante',   ativo: true,  ultimo_acesso: hojeISO(9, 2) },
  { id: 'USR-008', nome: 'Diego Faria',       email: 'diego.faria@banco.com.br',       matricula: 'MAT-008', departamento: 'Jurídico Corporativo',    perfil_id: 'ROLE-003', perfil_nome: 'Participante',   ativo: true,  ultimo_acesso: hojeISO(9, 5) },
  { id: 'USR-009', nome: 'Gabriela Ramos',    email: 'gabriela.ramos@banco.com.br',    matricula: 'MAT-009', departamento: 'Assessoria Jurídica',     perfil_id: 'ROLE-003', perfil_nome: 'Participante',   ativo: true,  ultimo_acesso: hojeISO(9, 10) },
  { id: 'USR-010', nome: 'Henrique Alves',    email: 'henrique.alves@banco.com.br',    matricula: 'MAT-010', departamento: 'Jurídico Contencioso',    perfil_id: 'ROLE-003', perfil_nome: 'Participante',   ativo: true,  ultimo_acesso: hojeISO(9, 3) },
  { id: 'USR-011', nome: 'Isabel Costa',      email: 'isabel.costa@banco.com.br',      matricula: 'MAT-011', departamento: 'Mediação',                perfil_id: 'ROLE-003', perfil_nome: 'Participante',   ativo: true,  ultimo_acesso: hojeISO(8, 50) },
  { id: 'USR-012', nome: 'Lucas Barbosa',     email: 'lucas.barbosa@banco.com.br',     matricula: 'MAT-012', departamento: 'Jurídico Corporativo',    perfil_id: 'ROLE-003', perfil_nome: 'Participante',   ativo: false, ultimo_acesso: ontemISO(15, 0) },
  { id: 'USR-013', nome: 'Patrícia Duarte',   email: 'patricia.duarte@banco.com.br',   matricula: 'MAT-013', departamento: 'Compliance',              perfil_id: 'ROLE-004', perfil_nome: 'Auditor',        ativo: true,  ultimo_acesso: hojeISO(10, 0) },
  { id: 'USR-014', nome: 'Ricardo Monteiro',  email: 'ricardo.monteiro@banco.com.br',  matricula: 'MAT-014', departamento: 'Auditoria Interna',       perfil_id: 'ROLE-004', perfil_nome: 'Auditor',        ativo: true,  ultimo_acesso: ontemISO(17, 0) },
]

// ═══════════════════════════════════════════════════════════════════════════════
// Participantes reutilizáveis (vinculados a USR-006..USR-012)
// ═══════════════════════════════════════════════════════════════════════════════
function mkPart(uid: string, checked: boolean, ts: string | null, lat: number | null, lng: number | null, prec: number | null, evId: string | null) {
  const u = usuarios.find(x => x.id === uid)!
  return {
    id: uid, nome: u.nome, email: u.email, matricula: u.matricula,
    departamento: u.departamento, cargo: 'Advogado(a)', perfil_rbac: u.perfil_nome,
    avatar_iniciais: u.nome.split(' ').map(n => n[0]).join('').substring(0, 2),
    checkin: {
      realizado: checked, timestamp: ts,
      latitude: lat, longitude: lng, precisao_metros: prec,
      dentro_geofence: checked ? true : null,
      evidencia_id: evId, hash_sha256: checked ? sha256fake(`chk-${uid}`) : null,
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Audiencias — 6 audiencias (2 em_andamento, 2 agendadas, 1 encerrada, 1 cancelada)
//
// Quantidades coerentes:
//   AUD-001: 8 participantes, 6 presentes, 2 ausentes   → taxa 0.75
//   AUD-002: 4 participantes, 0 presentes, 0 ausentes   → taxa 0 (agendada)
//   AUD-003: 6 participantes, 4 presentes, 2 ausentes   → taxa 0.667
//   AUD-004: 5 participantes, 5 presentes, 0 ausentes   → taxa 1.0 (encerrada ontem)
//   AUD-005: 3 participantes, 0 presentes, 0 ausentes   → taxa 0 (agendada tarde)
//   AUD-006: 4 participantes, 0 presentes, 0 ausentes   → taxa 0 (cancelada)
//
// Total hoje (AUD-001+002+003+005): 21 participantes, 10 presentes
// ═══════════════════════════════════════════════════════════════════════════════
const audiencias = [
  {
    id: 'AUD-001', nome: 'Conciliação — Contrato 2024/0012',
    departamento: 'Jurídico Contencioso — Dr. Carlos Mendes',
    data: hoje, horario_inicio: '09:00', horario_fim: '10:30',
    local: 'Sala de Reuniões A — 3º Andar', latitude: -23.5505, longitude: -46.6333,
    raio_geofence_metros: 150, status: 'em_andamento' as const,
    total_participantes: 8, presentes: 6, ausentes: 2, taxa_presenca: 0.75,
    pre_checkin_habilitado: true, offline_habilitado: true, questionario_habilitado: true,
    participantes: [
      mkPart('USR-006', true,  hojeISO(8, 58), -23.5505, -46.6333, 5,  'EV-001'),
      mkPart('USR-007', true,  hojeISO(9, 2),  -23.5506, -46.6334, 8,  'EV-002'),
      mkPart('USR-008', true,  hojeISO(9, 5),  -23.5504, -46.6332, 6,  'EV-003'),
      mkPart('USR-009', true,  hojeISO(9, 10), -23.5503, -46.6331, 10, 'EV-004'),
      mkPart('USR-010', true,  hojeISO(9, 3),  -23.5508, -46.6336, 7,  'EV-005'),
      mkPart('USR-011', true,  hojeISO(8, 50), -23.5502, -46.6330, 3,  'EV-006'),
      mkPart('USR-012', false, null, null, null, null, null), // ausente — inativo
      { id: 'P-EXT-01', nome: 'Carla Nunes', email: 'carla.nunes@externo.com.br', matricula: 'EXT-001',
        departamento: 'Externo — Requerente', cargo: 'Requerente', perfil_rbac: 'Participante',
        avatar_iniciais: 'CN',
        checkin: { realizado: false, timestamp: null, latitude: null, longitude: null, precisao_metros: null, dentro_geofence: null, evidencia_id: null, hash_sha256: null },
      },
    ],
  },
  {
    id: 'AUD-002', nome: 'Trabalhista — Processo 0045/2025',
    departamento: 'Jurídico Trabalhista — Dra. Fernanda Lopes',
    data: hoje, horario_inicio: '11:00', horario_fim: '12:30',
    local: 'Sala Virtual — Microsoft Teams', latitude: -23.5489, longitude: -46.6388,
    raio_geofence_metros: 200, status: 'agendada' as const,
    total_participantes: 4, presentes: 0, ausentes: 0, taxa_presenca: 0,
    pre_checkin_habilitado: true, offline_habilitado: false, questionario_habilitado: false,
    participantes: [
      mkPart('USR-007', false, null, null, null, null, null),
      mkPart('USR-008', false, null, null, null, null, null),
      mkPart('USR-009', false, null, null, null, null, null),
      mkPart('USR-010', false, null, null, null, null, null),
    ],
  },
  {
    id: 'AUD-003', nome: 'Mediação Cível — Contrato 2023/0789',
    departamento: 'Jurídico Cível — Dr. Alberto Pinto',
    data: hoje, horario_inicio: '09:30', horario_fim: '11:00',
    local: 'Sala de Reuniões B — 5º Andar', latitude: -23.5521, longitude: -46.6311,
    raio_geofence_metros: 100, status: 'em_andamento' as const,
    total_participantes: 6, presentes: 4, ausentes: 2, taxa_presenca: 0.667,
    pre_checkin_habilitado: true, offline_habilitado: true, questionario_habilitado: true,
    participantes: [
      mkPart('USR-006', true,  hojeISO(9, 25), -23.5521, -46.6311, 4,  'EV-007'),
      mkPart('USR-008', true,  hojeISO(9, 28), -23.5520, -46.6312, 6,  'EV-008'),
      mkPart('USR-009', true,  hojeISO(9, 30), -23.5522, -46.6310, 5,  'EV-009'),
      mkPart('USR-011', true,  hojeISO(9, 22), -23.5519, -46.6313, 8,  'EV-010'),
      mkPart('USR-007', false, null, null, null, null, null),
      mkPart('USR-010', false, null, null, null, null, null),
    ],
  },
  {
    id: 'AUD-004', nome: 'Instrução — Processo 0112/2024',
    departamento: 'Jurídico Corporativo — Dra. Renata Campos',
    data: ontem, horario_inicio: '10:00', horario_fim: '12:00',
    local: 'Fórum Central — Sala 7', latitude: -23.5461, longitude: -46.6414,
    raio_geofence_metros: 120, status: 'encerrada' as const,
    total_participantes: 5, presentes: 5, ausentes: 0, taxa_presenca: 1,
    pre_checkin_habilitado: false, offline_habilitado: true, questionario_habilitado: false,
    participantes: [
      mkPart('USR-006', true, ontemISO(9, 55),  -23.5461, -46.6414, 12, 'EV-011'),
      mkPart('USR-007', true, ontemISO(9, 58),  -23.5462, -46.6415, 9,  'EV-012'),
      mkPart('USR-008', true, ontemISO(9, 50),  -23.5460, -46.6413, 7,  'EV-013'),
      mkPart('USR-009', true, ontemISO(10, 0),  -23.5463, -46.6416, 11, 'EV-014'),
      mkPart('USR-010', true, ontemISO(9, 52),  -23.5459, -46.6412, 5,  'EV-015'),
    ],
  },
  {
    id: 'AUD-005', nome: 'Perícia Contábil — Ação 0231/2024',
    departamento: 'Jurídico Contencioso — Dr. Carlos Mendes',
    data: hoje, horario_inicio: '14:00', horario_fim: '16:00',
    local: 'Sala de Reuniões C — 2º Andar', latitude: -23.5510, longitude: -46.6340,
    raio_geofence_metros: 100, status: 'agendada' as const,
    total_participantes: 3, presentes: 0, ausentes: 0, taxa_presenca: 0,
    pre_checkin_habilitado: true, offline_habilitado: false, questionario_habilitado: true,
    participantes: [
      mkPart('USR-006', false, null, null, null, null, null),
      mkPart('USR-011', false, null, null, null, null, null),
      mkPart('USR-008', false, null, null, null, null, null),
    ],
  },
  {
    id: 'AUD-006', nome: 'Audiência Cível — Processo 0099/2023',
    departamento: 'Jurídico Cível — Dr. Alberto Pinto',
    data: anteontem, horario_inicio: '15:00', horario_fim: '17:00',
    local: 'Fórum Regional — Sala 12', latitude: -23.5530, longitude: -46.6350,
    raio_geofence_metros: 150, status: 'cancelada' as const,
    total_participantes: 4, presentes: 0, ausentes: 0, taxa_presenca: 0,
    pre_checkin_habilitado: false, offline_habilitado: false, questionario_habilitado: false,
    participantes: [],
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// Check-ins — 15 no total (6 de AUD-001 + 4 de AUD-003 + 5 de AUD-004)
// Cada check-in aponta para uma evidência correspondente
// ═══════════════════════════════════════════════════════════════════════════════
const checkins = [
  // AUD-001 (6 check-ins)
  { id: 'CHK-001', evidencia_id: 'EV-001', audiencia_id: 'AUD-001', usuario_id: 'USR-006', usuario_nome: 'Ana Souza',      timestamp: hojeISO(8, 58), latitude: -23.5505, longitude: -46.6333, precisao_metros: 5,  dentro_geofence: true, distancia_do_local_metros: 8,   modo_offline: false, editado: false, hash_sha256: sha256fake('CHK-001') },
  { id: 'CHK-002', evidencia_id: 'EV-002', audiencia_id: 'AUD-001', usuario_id: 'USR-007', usuario_nome: 'Bruno Lima',     timestamp: hojeISO(9, 2),  latitude: -23.5506, longitude: -46.6334, precisao_metros: 8,  dentro_geofence: true, distancia_do_local_metros: 15,  modo_offline: false, editado: false, hash_sha256: sha256fake('CHK-002') },
  { id: 'CHK-003', evidencia_id: 'EV-003', audiencia_id: 'AUD-001', usuario_id: 'USR-008', usuario_nome: 'Diego Faria',    timestamp: hojeISO(9, 5),  latitude: -23.5504, longitude: -46.6332, precisao_metros: 6,  dentro_geofence: true, distancia_do_local_metros: 12,  modo_offline: false, editado: false, hash_sha256: sha256fake('CHK-003') },
  { id: 'CHK-004', evidencia_id: 'EV-004', audiencia_id: 'AUD-001', usuario_id: 'USR-009', usuario_nome: 'Gabriela Ramos', timestamp: hojeISO(9, 10), latitude: -23.5503, longitude: -46.6331, precisao_metros: 10, dentro_geofence: true, distancia_do_local_metros: 25,  modo_offline: false, editado: false, hash_sha256: sha256fake('CHK-004') },
  { id: 'CHK-005', evidencia_id: 'EV-005', audiencia_id: 'AUD-001', usuario_id: 'USR-010', usuario_nome: 'Henrique Alves', timestamp: hojeISO(9, 3),  latitude: -23.5508, longitude: -46.6336, precisao_metros: 7,  dentro_geofence: true, distancia_do_local_metros: 38,  modo_offline: false, editado: false, hash_sha256: sha256fake('CHK-005') },
  { id: 'CHK-006', evidencia_id: 'EV-006', audiencia_id: 'AUD-001', usuario_id: 'USR-011', usuario_nome: 'Isabel Costa',   timestamp: hojeISO(8, 50), latitude: -23.5502, longitude: -46.6330, precisao_metros: 3,  dentro_geofence: true, distancia_do_local_metros: 42,  modo_offline: true,  editado: false, hash_sha256: sha256fake('CHK-006') },
  // AUD-003 (4 check-ins)
  { id: 'CHK-007', evidencia_id: 'EV-007', audiencia_id: 'AUD-003', usuario_id: 'USR-006', usuario_nome: 'Ana Souza',      timestamp: hojeISO(9, 25), latitude: -23.5521, longitude: -46.6311, precisao_metros: 4,  dentro_geofence: true, distancia_do_local_metros: 5,   modo_offline: false, editado: false, hash_sha256: sha256fake('CHK-007') },
  { id: 'CHK-008', evidencia_id: 'EV-008', audiencia_id: 'AUD-003', usuario_id: 'USR-008', usuario_nome: 'Diego Faria',    timestamp: hojeISO(9, 28), latitude: -23.5520, longitude: -46.6312, precisao_metros: 6,  dentro_geofence: true, distancia_do_local_metros: 14,  modo_offline: false, editado: false, hash_sha256: sha256fake('CHK-008') },
  { id: 'CHK-009', evidencia_id: 'EV-009', audiencia_id: 'AUD-003', usuario_id: 'USR-009', usuario_nome: 'Gabriela Ramos', timestamp: hojeISO(9, 30), latitude: -23.5522, longitude: -46.6310, precisao_metros: 5,  dentro_geofence: true, distancia_do_local_metros: 18,  modo_offline: false, editado: false, hash_sha256: sha256fake('CHK-009') },
  { id: 'CHK-010', evidencia_id: 'EV-010', audiencia_id: 'AUD-003', usuario_id: 'USR-011', usuario_nome: 'Isabel Costa',   timestamp: hojeISO(9, 22), latitude: -23.5519, longitude: -46.6313, precisao_metros: 8,  dentro_geofence: true, distancia_do_local_metros: 30,  modo_offline: false, editado: false, hash_sha256: sha256fake('CHK-010') },
  // AUD-004 (5 check-ins — ontem, encerrada)
  { id: 'CHK-011', evidencia_id: 'EV-011', audiencia_id: 'AUD-004', usuario_id: 'USR-006', usuario_nome: 'Ana Souza',      timestamp: ontemISO(9, 55), latitude: -23.5461, longitude: -46.6414, precisao_metros: 12, dentro_geofence: true, distancia_do_local_metros: 10,  modo_offline: true,  editado: false, hash_sha256: sha256fake('CHK-011') },
  { id: 'CHK-012', evidencia_id: 'EV-012', audiencia_id: 'AUD-004', usuario_id: 'USR-007', usuario_nome: 'Bruno Lima',     timestamp: ontemISO(9, 58), latitude: -23.5462, longitude: -46.6415, precisao_metros: 9,  dentro_geofence: true, distancia_do_local_metros: 20,  modo_offline: true,  editado: false, hash_sha256: sha256fake('CHK-012') },
  { id: 'CHK-013', evidencia_id: 'EV-013', audiencia_id: 'AUD-004', usuario_id: 'USR-008', usuario_nome: 'Diego Faria',    timestamp: ontemISO(9, 50), latitude: -23.5460, longitude: -46.6413, precisao_metros: 7,  dentro_geofence: true, distancia_do_local_metros: 15,  modo_offline: false, editado: false, hash_sha256: sha256fake('CHK-013') },
  { id: 'CHK-014', evidencia_id: 'EV-014', audiencia_id: 'AUD-004', usuario_id: 'USR-009', usuario_nome: 'Gabriela Ramos', timestamp: ontemISO(10, 0), latitude: -23.5463, longitude: -46.6416, precisao_metros: 11, dentro_geofence: true, distancia_do_local_metros: 28,  modo_offline: false, editado: false, hash_sha256: sha256fake('CHK-014') },
  { id: 'CHK-015', evidencia_id: 'EV-015', audiencia_id: 'AUD-004', usuario_id: 'USR-010', usuario_nome: 'Henrique Alves', timestamp: ontemISO(9, 52), latitude: -23.5459, longitude: -46.6412, precisao_metros: 5,  dentro_geofence: true, distancia_do_local_metros: 22,  modo_offline: false, editado: false, hash_sha256: sha256fake('CHK-015') },
]

// ═══════════════════════════════════════════════════════════════════════════════
// Evidencias — 15 evidencias (1:1 com check-ins), cadeia SHA-256 encadeada
// ═══════════════════════════════════════════════════════════════════════════════
const evidencias = checkins.map((chk, idx) => ({
  id: chk.evidencia_id,
  checkin_id: chk.id,
  audiencia_id: chk.audiencia_id,
  usuario_id: chk.usuario_id,
  usuario_nome: chk.usuario_nome,
  timestamp_utc: chk.timestamp,
  latitude: chk.latitude,
  longitude: chk.longitude,
  precisao_metros: chk.precisao_metros,
  altitude_metros: 760 + Math.round(Math.random() * 20),
  fonte_gps: chk.modo_offline ? 'network' : 'gps',
  hash_sha256: sha256fake(`ev-${chk.id}`),
  hash_anterior: idx === 0 ? '0'.repeat(64) : sha256fake(`ev-${checkins[idx - 1].id}`),
  cadeia_valida: true,
  dispositivo: {
    tipo: 'mobile',
    fabricante: idx % 2 === 0 ? 'Samsung' : 'Apple',
    modelo: idx % 2 === 0 ? 'Galaxy S24' : 'iPhone 15',
    os_versao: idx % 2 === 0 ? 'Android 14' : 'iOS 17.4',
    app_versao: '2.1.0',
  },
}))

// ═══════════════════════════════════════════════════════════════════════════════
// Notificacoes — 12 notificações coerentes com audiências e participantes
// ═══════════════════════════════════════════════════════════════════════════════
const notificacoes = [
  { id: 'NOT-001', tipo: 'ausencia_critica', titulo: 'Ausência Crítica Detectada', corpo: 'Carla Nunes (Requerente) não realizou check-in na Conciliação — Contrato 2024/0012.', usuario_nome: 'Carla Nunes',      audiencia_nome: 'Conciliação — Contrato 2024/0012',  canal: 'push', status: 'entregue',  lida: false, created_at: hojeISO(9, 35), enviada_em: hojeISO(9, 35), entregue_em: hojeISO(9, 35), lida_em: null },
  { id: 'NOT-002', tipo: 'ausencia_critica', titulo: 'Ausência Crítica Detectada', corpo: 'Lucas Barbosa não realizou check-in na Conciliação — Contrato 2024/0012.',             usuario_nome: 'Lucas Barbosa',    audiencia_nome: 'Conciliação — Contrato 2024/0012',  canal: 'push', status: 'falha',     lida: false, created_at: hojeISO(9, 36), enviada_em: hojeISO(9, 36), entregue_em: null,           lida_em: null },
  { id: 'NOT-003', tipo: 'checkin_confirmado', titulo: 'Check-in Confirmado', corpo: 'Ana Souza realizou check-in às 08:58.',                                                     usuario_nome: 'Ana Souza',        audiencia_nome: 'Conciliação — Contrato 2024/0012',  canal: 'push', status: 'lida',      lida: true,  created_at: hojeISO(8, 59), enviada_em: hojeISO(8, 59), entregue_em: hojeISO(8, 59), lida_em: hojeISO(9, 5) },
  { id: 'NOT-004', tipo: 'checkin_confirmado', titulo: 'Check-in Confirmado', corpo: 'Isabel Costa realizou check-in offline às 08:50.',                                           usuario_nome: 'Isabel Costa',     audiencia_nome: 'Conciliação — Contrato 2024/0012',  canal: 'push', status: 'lida',      lida: true,  created_at: hojeISO(8, 51), enviada_em: hojeISO(8, 51), entregue_em: hojeISO(8, 51), lida_em: hojeISO(8, 55) },
  { id: 'NOT-005', tipo: 'lembrete', titulo: 'Audiência em 30 Minutos', corpo: 'A audiência Trabalhista — Processo 0045/2025 inicia às 11:00.',                                    usuario_nome: 'Bruno Lima',       audiencia_nome: 'Trabalhista — Processo 0045/2025',  canal: 'email', status: 'entregue', lida: false, created_at: hojeISO(10, 30), enviada_em: hojeISO(10, 30), entregue_em: hojeISO(10, 30), lida_em: null },
  { id: 'NOT-006', tipo: 'lembrete', titulo: 'Audiência em 30 Minutos', corpo: 'A audiência Trabalhista — Processo 0045/2025 inicia às 11:00.',                                    usuario_nome: 'Diego Faria',      audiencia_nome: 'Trabalhista — Processo 0045/2025',  canal: 'email', status: 'entregue', lida: false, created_at: hojeISO(10, 30), enviada_em: hojeISO(10, 30), entregue_em: hojeISO(10, 31), lida_em: null },
  { id: 'NOT-007', tipo: 'audiencia_criada', titulo: 'Nova Audiência Criada', corpo: 'Audiência Perícia Contábil — Ação 0231/2024 criada para hoje às 14:00.',                     usuario_nome: 'Carlos Mendes',    audiencia_nome: 'Perícia Contábil — Ação 0231/2024', canal: 'push', status: 'lida',      lida: true,  created_at: hojeISO(7, 30), enviada_em: hojeISO(7, 30), entregue_em: hojeISO(7, 30), lida_em: hojeISO(7, 45) },
  { id: 'NOT-008', tipo: 'audiencia_encerrada', titulo: 'Audiência Encerrada', corpo: 'Instrução — Processo 0112/2024 encerrada com 100% de presença.',                            usuario_nome: 'Fernanda Lopes',   audiencia_nome: 'Instrução — Processo 0112/2024',    canal: 'push', status: 'lida',      lida: true,  created_at: ontemISO(12, 5), enviada_em: ontemISO(12, 5), entregue_em: ontemISO(12, 5), lida_em: ontemISO(12, 20) },
  { id: 'NOT-009', tipo: 'ausencia_critica', titulo: 'Ausência Detectada', corpo: 'Bruno Lima não realizou check-in na Mediação Cível.',                                           usuario_nome: 'Bruno Lima',       audiencia_nome: 'Mediação Cível — Contrato 2023/0789', canal: 'push', status: 'entregue', lida: false, created_at: hojeISO(9, 45), enviada_em: hojeISO(9, 45), entregue_em: hojeISO(9, 46), lida_em: null },
  { id: 'NOT-010', tipo: 'ausencia_critica', titulo: 'Ausência Detectada', corpo: 'Henrique Alves não realizou check-in na Mediação Cível.',                                       usuario_nome: 'Henrique Alves',   audiencia_nome: 'Mediação Cível — Contrato 2023/0789', canal: 'sms', status: 'entregue',  lida: false, created_at: hojeISO(9, 46), enviada_em: hojeISO(9, 46), entregue_em: hojeISO(9, 47), lida_em: null },
  { id: 'NOT-011', tipo: 'audiencia_cancelada', titulo: 'Audiência Cancelada', corpo: 'Audiência Cível — Processo 0099/2023 foi cancelada.',                                       usuario_nome: 'Alberto Pinto',    audiencia_nome: 'Audiência Cível — Processo 0099/2023', canal: 'email', status: 'lida',  lida: true,  created_at: anteontemISO(14, 0), enviada_em: anteontemISO(14, 0), entregue_em: anteontemISO(14, 1), lida_em: anteontemISO(14, 30) },
  { id: 'NOT-012', tipo: 'csv_upload', titulo: 'Upload Concluído', corpo: '8 participantes importados via CSV para Conciliação — Contrato 2024/0012.',                             usuario_nome: 'Rodrigo Pedrosa',  audiencia_nome: 'Conciliação — Contrato 2024/0012',  canal: 'push', status: 'lida',      lida: true,  created_at: hojeISO(7, 0), enviada_em: hojeISO(7, 0), entregue_em: hojeISO(7, 0), lida_em: hojeISO(7, 10) },
]

// ═══════════════════════════════════════════════════════════════════════════════
// Auditoria — 18 logs coerentes com ações reais do sistema
// ═══════════════════════════════════════════════════════════════════════════════
const auditoria = [
  { id: 'LOG-001', tipo: 'USUARIO_LOGIN',            descricao: 'Login de Rodrigo Pedrosa via SSO corporativo',                 usuario_nome: 'Rodrigo Pedrosa',  audiencia_id: null,      recurso: 'auth:USR-001',         ip_origem: '10.0.1.42',    dispositivo: 'Chrome 122 / Windows 11',          timestamp: hojeISO(7, 0),       hash_sha256: sha256fake('LOG-001'), cadeia_valida: true, dados_anteriores: null, dados_novos: null },
  { id: 'LOG-002', tipo: 'AUDIENCIA_CRIADA',         descricao: 'Audiência AUD-001 criada com 8 participantes',                 usuario_nome: 'Carlos Mendes',    audiencia_id: 'AUD-001', recurso: 'audiencia:AUD-001',    ip_origem: '10.0.1.55',    dispositivo: 'Chrome 122 / Windows 11',          timestamp: hojeISO(7, 15),      hash_sha256: sha256fake('LOG-002'), cadeia_valida: true, dados_anteriores: null, dados_novos: { nome: 'Conciliação — Contrato 2024/0012', total: 8 } },
  { id: 'LOG-003', tipo: 'AUDIENCIA_CRIADA',         descricao: 'Audiência AUD-003 criada com 6 participantes',                 usuario_nome: 'Alberto Pinto',    audiencia_id: 'AUD-003', recurso: 'audiencia:AUD-003',    ip_origem: '10.0.2.10',    dispositivo: 'Firefox 123 / macOS 14',           timestamp: hojeISO(7, 20),      hash_sha256: sha256fake('LOG-003'), cadeia_valida: true, dados_anteriores: null, dados_novos: { nome: 'Mediação Cível — Contrato 2023/0789', total: 6 } },
  { id: 'LOG-004', tipo: 'AUDIENCIA_CRIADA',         descricao: 'Audiência AUD-005 criada com 3 participantes',                 usuario_nome: 'Carlos Mendes',    audiencia_id: 'AUD-005', recurso: 'audiencia:AUD-005',    ip_origem: '10.0.1.55',    dispositivo: 'Chrome 122 / Windows 11',          timestamp: hojeISO(7, 30),      hash_sha256: sha256fake('LOG-004'), cadeia_valida: true, dados_anteriores: null, dados_novos: { nome: 'Perícia Contábil — Ação 0231/2024', total: 3 } },
  { id: 'LOG-005', tipo: 'CHECKIN_REALIZADO',        descricao: 'Check-in registrado por Isabel Costa (offline)',               usuario_nome: 'Isabel Costa',     audiencia_id: 'AUD-001', recurso: 'checkin:CHK-006',      ip_origem: '192.168.1.80', dispositivo: 'FourCheckin App 2.1.0 / Android 14',timestamp: hojeISO(8, 50),     hash_sha256: sha256fake('LOG-005'), cadeia_valida: true, dados_anteriores: null, dados_novos: { modo_offline: true } },
  { id: 'LOG-006', tipo: 'CHECKIN_REALIZADO',        descricao: 'Check-in registrado por Ana Souza',                            usuario_nome: 'Ana Souza',        audiencia_id: 'AUD-001', recurso: 'checkin:CHK-001',      ip_origem: '192.168.1.55', dispositivo: 'FourCheckin App 2.1.0 / iOS 17.4', timestamp: hojeISO(8, 58),      hash_sha256: sha256fake('LOG-006'), cadeia_valida: true, dados_anteriores: null, dados_novos: null },
  { id: 'LOG-007', tipo: 'CHECKIN_REALIZADO',        descricao: 'Check-in registrado por Bruno Lima',                           usuario_nome: 'Bruno Lima',       audiencia_id: 'AUD-001', recurso: 'checkin:CHK-002',      ip_origem: '192.168.1.60', dispositivo: 'FourCheckin App 2.1.0 / Android 14',timestamp: hojeISO(9, 2),      hash_sha256: sha256fake('LOG-007'), cadeia_valida: true, dados_anteriores: null, dados_novos: null },
  { id: 'LOG-008', tipo: 'CHECKIN_REALIZADO',        descricao: 'Check-in registrado por Henrique Alves',                       usuario_nome: 'Henrique Alves',   audiencia_id: 'AUD-001', recurso: 'checkin:CHK-005',      ip_origem: '192.168.1.70', dispositivo: 'FourCheckin App 2.1.0 / Android 14',timestamp: hojeISO(9, 3),      hash_sha256: sha256fake('LOG-008'), cadeia_valida: true, dados_anteriores: null, dados_novos: null },
  { id: 'LOG-009', tipo: 'CHECKIN_REALIZADO',        descricao: 'Check-in registrado por Diego Faria',                          usuario_nome: 'Diego Faria',      audiencia_id: 'AUD-001', recurso: 'checkin:CHK-003',      ip_origem: '192.168.1.65', dispositivo: 'FourCheckin App 2.1.0 / iOS 17.4', timestamp: hojeISO(9, 5),       hash_sha256: sha256fake('LOG-009'), cadeia_valida: true, dados_anteriores: null, dados_novos: null },
  { id: 'LOG-010', tipo: 'CHECKIN_REALIZADO',        descricao: 'Check-in registrado por Gabriela Ramos',                       usuario_nome: 'Gabriela Ramos',   audiencia_id: 'AUD-001', recurso: 'checkin:CHK-004',      ip_origem: '192.168.1.75', dispositivo: 'FourCheckin App 2.1.0 / iOS 17.4', timestamp: hojeISO(9, 10),      hash_sha256: sha256fake('LOG-010'), cadeia_valida: true, dados_anteriores: null, dados_novos: null },
  { id: 'LOG-011', tipo: 'AUDIENCIA_STATUS_ALTERADO',descricao: 'AUD-001 alterada para em_andamento',                           usuario_nome: 'Sistema',          audiencia_id: 'AUD-001', recurso: 'audiencia:AUD-001',    ip_origem: '10.0.0.1',     dispositivo: 'Sistema Automático',               timestamp: hojeISO(9, 0),       hash_sha256: sha256fake('LOG-011'), cadeia_valida: true, dados_anteriores: { status: 'agendada' }, dados_novos: { status: 'em_andamento' } },
  { id: 'LOG-012', tipo: 'NOTIFICACAO_ENVIADA',      descricao: 'Alerta de ausência enviado para Carla Nunes',                  usuario_nome: 'Sistema',          audiencia_id: 'AUD-001', recurso: 'notificacao:NOT-001',  ip_origem: '10.0.0.1',     dispositivo: 'Sistema Automático',               timestamp: hojeISO(9, 35),      hash_sha256: sha256fake('LOG-012'), cadeia_valida: true, dados_anteriores: null, dados_novos: null },
  { id: 'LOG-013', tipo: 'CHECKIN_REALIZADO',        descricao: 'Check-in registrado por Ana Souza (AUD-003)',                  usuario_nome: 'Ana Souza',        audiencia_id: 'AUD-003', recurso: 'checkin:CHK-007',      ip_origem: '192.168.1.55', dispositivo: 'FourCheckin App 2.1.0 / iOS 17.4', timestamp: hojeISO(9, 25),      hash_sha256: sha256fake('LOG-013'), cadeia_valida: true, dados_anteriores: null, dados_novos: null },
  { id: 'LOG-014', tipo: 'AUDIENCIA_STATUS_ALTERADO',descricao: 'AUD-003 alterada para em_andamento',                           usuario_nome: 'Sistema',          audiencia_id: 'AUD-003', recurso: 'audiencia:AUD-003',    ip_origem: '10.0.0.1',     dispositivo: 'Sistema Automático',               timestamp: hojeISO(9, 30),      hash_sha256: sha256fake('LOG-014'), cadeia_valida: true, dados_anteriores: { status: 'agendada' }, dados_novos: { status: 'em_andamento' } },
  { id: 'LOG-015', tipo: 'NOTIFICACAO_ENVIADA',      descricao: 'Lembrete de audiência enviado para 4 participantes',           usuario_nome: 'Sistema',          audiencia_id: 'AUD-002', recurso: 'notificacao:NOT-005',  ip_origem: '10.0.0.1',     dispositivo: 'Sistema Automático',               timestamp: hojeISO(10, 30),     hash_sha256: sha256fake('LOG-015'), cadeia_valida: true, dados_anteriores: null, dados_novos: null },
  { id: 'LOG-016', tipo: 'AUDIENCIA_STATUS_ALTERADO',descricao: 'AUD-004 encerrada com 100% de presença',                       usuario_nome: 'Fernanda Lopes',   audiencia_id: 'AUD-004', recurso: 'audiencia:AUD-004',    ip_origem: '10.0.1.60',    dispositivo: 'Chrome 122 / Windows 11',          timestamp: ontemISO(12, 0),     hash_sha256: sha256fake('LOG-016'), cadeia_valida: true, dados_anteriores: { status: 'em_andamento' }, dados_novos: { status: 'encerrada' } },
  { id: 'LOG-017', tipo: 'AUDIENCIA_STATUS_ALTERADO',descricao: 'AUD-006 cancelada por Dr. Alberto Pinto',                      usuario_nome: 'Alberto Pinto',    audiencia_id: 'AUD-006', recurso: 'audiencia:AUD-006',    ip_origem: '10.0.2.10',    dispositivo: 'Firefox 123 / macOS 14',           timestamp: anteontemISO(14, 0), hash_sha256: sha256fake('LOG-017'), cadeia_valida: true, dados_anteriores: { status: 'agendada' }, dados_novos: { status: 'cancelada' } },
  { id: 'LOG-018', tipo: 'SISTEMA_INICIALIZADO',     descricao: 'Sistema FourCheckin v2.1.0 inicializado',                      usuario_nome: 'Sistema',          audiencia_id: null,      recurso: 'sistema:v2.1.0',       ip_origem: '10.0.0.1',     dispositivo: 'Servidor Produção',                timestamp: hojeISO(6, 0),       hash_sha256: sha256fake('LOG-018'), cadeia_valida: true, dados_anteriores: null, dados_novos: { versao: '2.1.0' } },
]

// ═══════════════════════════════════════════════════════════════════════════════
// Questionários
// ═══════════════════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════════════════
// Dashboard — calculado dinamicamente para coerência total
// ═══════════════════════════════════════════════════════════════════════════════
function buildDashboard() {
  const audienciasHoje = audiencias.filter(a => a.data === hoje && a.status !== 'cancelada')
  const emAndamento    = audienciasHoje.filter(a => a.status === 'em_andamento')
  const agendadas      = audienciasHoje.filter(a => a.status === 'agendada')
  const encerradas     = audienciasHoje.filter(a => a.status === 'encerrada')
  const totalPresentes = audienciasHoje.reduce((s, a) => s + a.presentes, 0)
  const totalAusentes  = audienciasHoje.reduce((s, a) => s + a.ausentes, 0)
  const totalPart      = audienciasHoje.reduce((s, a) => s + a.total_participantes, 0)
  const pendentes      = totalPart - totalPresentes - totalAusentes
  const taxa           = totalPart > 0 ? totalPresentes / totalPart : 0
  const checkinsHoje   = checkins.filter(c => c.timestamp.startsWith(hoje))
  const alertasAtivos  = notificacoes.filter(n => !n.lida && n.tipo === 'ausencia_critica')
  const evidenciasHoje = evidencias.filter(e => e.timestamp_utc.startsWith(hoje))

  return {
    kpis: {
      audiencias_hoje:           { valor: audienciasHoje.length, em_andamento: emAndamento.length, agendadas: agendadas.length, encerradas: encerradas.length },
      total_participantes_hoje:  { valor: totalPart, presentes: totalPresentes, ausentes: totalAusentes, pendentes },
      taxa_presenca_geral:       { valor: taxa, percentual: `${(taxa * 100).toFixed(0)}%`, meta: 0.85, atingiu_meta: taxa >= 0.85 },
      checkins_realizados_hoje:  { valor: checkinsHoje.length, mobile: checkinsHoje.filter(c => !c.modo_offline).length, manual: 0, offline_pendente: checkinsHoje.filter(c => c.modo_offline).length },
      alertas_ativos:            { valor: alertasAtivos.length, ausencias_criticas: alertasAtivos.length },
      evidencias_geradas:        { valor: evidenciasHoje.length, integras: evidenciasHoje.filter(e => e.cadeia_valida).length, taxa_integridade: 1.0 },
    },
    audiencias_ativas: emAndamento.map(a => ({
      id: a.id, nome: a.nome,
      horario: `${a.horario_inicio} – ${a.horario_fim}`,
      local: a.local, presentes: a.presentes, total: a.total_participantes,
      taxa: a.total_participantes > 0 ? a.presentes / a.total_participantes : 0,
    })),
    alertas_recentes: alertasAtivos.slice(0, 5).map(n => ({
      id: n.id,
      usuario: n.usuario_nome,
      tempo_decorrido_min: Math.floor((Date.now() - new Date(n.created_at).getTime()) / 60000),
      audiencia: n.audiencia_nome,
    })),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Plugin Mock API
// ═══════════════════════════════════════════════════════════════════════════════
function mockApiPlugin(): Plugin {
  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
        const url    = (req.url || '').split('?')[0].replace(/\/$/, '')
        const method = (req.method || 'GET').toUpperCase()

        if (!url.startsWith('/api/v1')) { next(); return }

        const json = (status: number, data: unknown) => {
          res.writeHead(status, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(data))
        }

        const readBody = (): Promise<Record<string, unknown>> =>
          new Promise(resolve => {
            let raw = ''
            req.on('data', (chunk: Buffer) => { raw += chunk.toString() })
            req.on('end', () => { try { resolve(JSON.parse(raw || '{}')) } catch { resolve({}) } })
          })

        console.log(`[mock] ${method} ${url}`)

        // ── Auth ────────────────────────────────────────────────────────────
        if (method === 'POST' && url === '/api/v1/auth/token') {
          json(200, { access_token: 'mock-token-foursys', token_type: 'Bearer', expires_in: 86400, user: { name: 'Rodrigo Pedrosa', email: 'rodrigo.pedrosa@banco.com.br' } })
          return
        }

        // ── Dashboard ───────────────────────────────────────────────────────
        if (method === 'GET' && url === '/api/v1/dashboard') { json(200, buildDashboard()); return }

        // ── Audiências ──────────────────────────────────────────────────────
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
            const nova = { id: `AUD-${String(audiencias.length + 1).padStart(3, '0')}`, ...body, status: 'agendada', presentes: 0, ausentes: 0, taxa_presenca: 0, participantes: [] }
            audiencias.push(nova as typeof audiencias[0])
            json(201, nova)
          })
          return
        }

        // ── Check-ins ───────────────────────────────────────────────────────
        if (method === 'GET' && url === '/api/v1/checkins') { json(200, checkins); return }

        if (method === 'POST' && url === '/api/v1/checkins') {
          readBody().then(body => {
            const id = `CHK-${String(checkins.length + 1).padStart(3, '0')}`
            const evId = `EV-${String(evidencias.length + 1).padStart(3, '0')}`
            const hash = sha256fake(id)
            const novo = {
              id, evidencia_id: evId, audiencia_id: body.audiencia_id as string,
              usuario_id: 'USR-001', usuario_nome: 'Rodrigo Pedrosa',
              timestamp: new Date().toISOString(),
              latitude: body.latitude as number, longitude: body.longitude as number,
              precisao_metros: body.precisao_metros as number,
              dentro_geofence: true, distancia_do_local_metros: 10,
              modo_offline: (body.modo_offline as boolean) || false, editado: false, hash_sha256: hash,
            }
            checkins.push(novo)
            json(201, { id, evidencia_id: evId, hash_sha256: hash, mensagem: 'Check-in registrado com sucesso!', timestamp: novo.timestamp })
          })
          return
        }

        const chkId = url.match(/^\/api\/v1\/checkins\/([^/]+)$/)
        if (chkId && method === 'PATCH') {
          readBody().then(body => {
            const idx = checkins.findIndex(c => c.id === chkId[1])
            if (idx === -1) { json(404, { erro: 'Não encontrado' }); return }
            Object.assign(checkins[idx], body, { editado: true })
            json(200, checkins[idx])
          })
          return
        }

        // ── Notificações ────────────────────────────────────────────────────
        if (method === 'GET' && url === '/api/v1/notificacoes') { json(200, { data: notificacoes }); return }

        // ── Evidências ──────────────────────────────────────────────────────
        if (method === 'GET' && url === '/api/v1/evidencias') { json(200, { data: evidencias }); return }
        const evId = url.match(/^\/api\/v1\/evidencias\/([^/]+)$/)
        if (evId && method === 'GET') { const ev = evidencias.find(e => e.id === evId[1]); ev ? json(200, ev) : json(404, { erro: 'Não encontrada' }); return }

        // ── Auditoria ───────────────────────────────────────────────────────
        if (method === 'GET' && url === '/api/v1/auditoria') { json(200, { data: auditoria }); return }

        // ── Usuários e Perfis ───────────────────────────────────────────────
        if (method === 'GET' && url === '/api/v1/usuarios') { json(200, { data: usuarios }); return }
        if (method === 'GET' && url === '/api/v1/perfis')   { json(200, { data: perfis });   return }

        // ── Questionários ───────────────────────────────────────────────────
        if (method === 'GET' && url === '/api/v1/questionarios/templates') { json(200, questionarioTemplates); return }
        if (method === 'GET' && url === '/api/v1/questionarios/respostas')  { json(200, []); return }
        if (method === 'POST' && url === '/api/v1/questionarios/respostas') { readBody().then(body => json(201, { id: `QR-${Date.now()}`, ...body, enviado_em: new Date().toISOString() })); return }

        // ── Upload ──────────────────────────────────────────────────────────
        if (method === 'POST' && url === '/api/v1/upload/participantes') { json(200, { sucesso: true, processados: 10, erros: 0, mensagem: '10 participantes importados.' }); return }

        // ── 404 ─────────────────────────────────────────────────────────────
        json(404, { erro: `Rota não encontrada: ${method} ${url}` })
      })
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Vite Config
// ═══════════════════════════════════════════════════════════════════════════════
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
