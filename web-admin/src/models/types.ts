export type AudienciaStatus = 'agendada' | 'em_andamento' | 'encerrada' | 'cancelada'

export interface Audiencia {
  id: string
  nome: string
  departamento: string
  data: string
  horario_inicio: string
  horario_fim: string
  local: string
  latitude: number
  longitude: number
  raio_geofence_metros: number
  status: AudienciaStatus
  total_participantes: number
  presentes: number
  ausentes: number
  taxa_presenca: number
  pre_checkin_habilitado: boolean
  offline_habilitado: boolean
  questionario_habilitado: boolean
}

export interface Participante {
  id: string
  nome: string
  email: string
  matricula: string
  departamento: string
  cargo: string
  perfil_rbac: string
  avatar_iniciais: string
  checkin: {
    realizado: boolean
    timestamp: string | null
    latitude: number | null
    longitude: number | null
    precisao_metros: number | null
    dentro_geofence: boolean | null
    evidencia_id: string | null
    hash_sha256: string | null
  }
}

export interface CheckIn {
  id: string
  evidencia_id: string
  audiencia_id: string
  usuario_id: string
  usuario_nome: string
  timestamp: string
  latitude: number
  longitude: number
  precisao_metros: number
  dentro_geofence: boolean
  distancia_do_local_metros: number
  modo_offline: boolean
  editado: boolean
  hash_sha256: string
}

export interface Evidencia {
  id: string
  checkin_id: string
  audiencia_id: string
  usuario_id: string
  usuario_nome: string
  timestamp_utc: string
  latitude: number
  longitude: number
  precisao_metros: number
  altitude_metros: number
  fonte_gps: string
  hash_sha256: string
  hash_anterior: string
  cadeia_valida: boolean
  dispositivo: {
    tipo: string
    modelo: string
    os_versao: string
    app_versao: string
  }
}

export interface LogAuditoria {
  id: string
  tipo: string
  descricao: string
  usuario_nome: string
  audiencia_id: string | null
  recurso: string
  ip_origem: string
  dispositivo: string
  timestamp: string
  hash_sha256: string
  cadeia_valida: boolean
  dados_anteriores: Record<string, unknown> | null
  dados_novos: Record<string, unknown> | null
}

export interface Notificacao {
  id: string
  tipo: string
  titulo: string
  corpo: string
  usuario_nome: string
  audiencia_nome: string
  canal: string
  status: string
  lida: boolean
  created_at: string
  enviada_em: string
  entregue_em: string | null
  lida_em: string | null
}

export interface PerfilRBAC {
  id: string
  nome: string
  descricao: string
  cor: string
  permissoes: Record<string, Record<string, boolean>>
  total_usuarios: number
}

export interface Usuario {
  id: string
  nome: string
  email: string
  matricula: string
  departamento: string
  perfil_id: string
  perfil_nome: string
  ativo: boolean
  ultimo_acesso: string
}

export interface DashboardKPIs {
  audiencias_hoje: { valor: number; em_andamento: number; agendadas: number; encerradas: number }
  total_participantes_hoje: { valor: number; presentes: number; ausentes: number; pendentes: number }
  taxa_presenca_geral: { valor: number; percentual: string; meta: number; atingiu_meta: boolean }
  checkins_realizados_hoje: { valor: number; mobile: number; manual: number; offline_pendente: number }
  alertas_ativos: { valor: number; ausencias_criticas: number }
  evidencias_geradas: { valor: number; integras: number; taxa_integridade: number }
}
