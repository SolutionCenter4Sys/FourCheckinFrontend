import { useState } from 'react'
import { Box, Typography, Chip, Paper, Accordion, AccordionSummary, AccordionDetails, Button } from '@mui/material'
import { ExpandMore, PlayArrow } from '@mui/icons-material'
import { COLORS } from '../../theme'

const endpoints = [
  {
    group: '🔐 Autenticação', items: [
      {
        method: 'POST', path: '/auth/token',
        desc: 'OAuth2 PKCE — Obter token de acesso',
        body: '{ client_id, code, code_verifier, redirect_uri }',
        response: '{ access_token, token_type, expires_in, usuario }',
      },
    ],
  },
  {
    group: '🏛️ Audiências', items: [
      { method: 'GET',   path: '/audiencias',     desc: 'Listar audiências com filtros e paginação', body: null, response: '{ meta, data: Audiencia[] }' },
      { method: 'POST',  path: '/audiencias',     desc: 'Criar nova audiência', body: '{ nome, data, horario_inicio, local, raio_geofence_metros, ... }', response: '{ data: Audiencia }' },
      { method: 'GET',   path: '/audiencias/:id', desc: 'Detalhe de audiência específica', body: null, response: '{ data: Audiencia }' },
      { method: 'PATCH', path: '/audiencias/:id', desc: 'Atualizar audiência', body: 'Campos parciais da audiência', response: '{ data: Audiencia }' },
    ],
  },
  {
    group: '✅ Check-ins', items: [
      { method: 'POST',  path: '/checkins',     desc: 'Registrar check-in GPS', body: '{ audiencia_id, latitude, longitude, precisao, timestamp }', response: '{ data: { id, evidencia_id, hash_sha256 } }' },
      { method: 'GET',   path: '/checkins',     desc: 'Listar check-ins', body: null, response: '{ meta, data: CheckIn[] }' },
      { method: 'PATCH', path: '/checkins/:id', desc: 'Editar check-in com justificativa (Gestor+)', body: '{ justificativa, ... }', response: '{ data: CheckIn }' },
    ],
  },
  {
    group: '📊 Dashboard & Relatórios', items: [
      { method: 'GET', path: '/dashboard',  desc: 'KPIs em tempo real + alertas ativos', body: null, response: '{ kpis, audiencias_ativas, alertas_recentes }' },
      { method: 'GET', path: '/auditoria',  desc: 'Log imutável de eventos (SHA-256)', body: null, response: '{ meta, data: LogAuditoria[] }' },
      { method: 'GET', path: '/evidencias', desc: 'Evidências de check-in com metadados GPS', body: null, response: '{ meta, data: Evidencia[] }' },
    ],
  },
]

const methodColor: Record<string, string> = {
  GET:    COLORS.green,
  POST:   COLORS.green,
  PATCH:  COLORS.amber,
  DELETE: COLORS.red,
}

export default function ApiDocsPage() {
  const [expanded, setExpanded] = useState<string | false>('panel0-0')

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ color: COLORS.white, fontWeight: 800 }}>API REST Docs</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip label="v1.0.0" size="small" sx={{ bgcolor: `${COLORS.orange}22`, color: COLORS.orange }} />
          <Chip label="OpenAPI 3.0" size="small" sx={{ bgcolor: `${COLORS.green}22`, color: COLORS.green }} />
          <Chip label="OAuth2 PKCE" size="small" sx={{ bgcolor: `${COLORS.green}22`, color: COLORS.green }} />
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
        <Typography variant="body2" sx={{ color: COLORS.gray3, mb: 0.5 }}>Base URL</Typography>
        <Typography sx={{ fontFamily: 'monospace', color: COLORS.white, fontSize: 13 }}>
          http://localhost:3000/api/v1
        </Typography>
        <Typography variant="caption" sx={{ color: COLORS.gray4 }}>
          Rate Limit: 1.000 req/min · Bearer JWT obrigatório em todos os endpoints (exceto /auth/token)
        </Typography>
      </Paper>

      {endpoints.map((group, gi) => (
        <Box key={group.group} sx={{ mb: 1 }}>
          <Typography variant="overline" sx={{ color: COLORS.gray4, ml: 0.5 }}>{group.group}</Typography>
          {group.items.map((ep, ei) => {
            const panelId = `panel${gi}-${ei}`
            return (
              <Accordion
                key={ep.path + ep.method}
                expanded={expanded === panelId}
                onChange={(_, isOpen) => setExpanded(isOpen ? panelId : false)}
                sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, mb: 0.5, '&:before': { display: 'none' } }}
              >
                <AccordionSummary expandIcon={<ExpandMore sx={{ color: COLORS.gray3 }} />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Chip
                      label={ep.method}
                      size="small"
                      sx={{
                        bgcolor: `${methodColor[ep.method] || COLORS.gray3}30`,
                        color: methodColor[ep.method] || COLORS.gray3,
                        fontFamily: 'monospace', fontWeight: 700, minWidth: 55,
                      }}
                    />
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: COLORS.white }}>{ep.path}</Typography>
                    <Typography variant="caption" sx={{ color: COLORS.gray3, ml: 'auto', mr: 2 }}>{ep.desc}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ bgcolor: COLORS.raised, borderTop: `1px solid ${COLORS.border}` }}>
                  {ep.body && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: COLORS.gray4, display: 'block', mb: 0.5 }}>Request Body</Typography>
                      <Box sx={{ p: 1.5, bgcolor: COLORS.bg, borderRadius: 1, fontFamily: 'monospace', fontSize: 12, color: COLORS.gray3 }}>
                        {ep.body}
                      </Box>
                    </Box>
                  )}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: COLORS.gray4, display: 'block', mb: 0.5 }}>Response 200/201</Typography>
                    <Box sx={{ p: 1.5, bgcolor: COLORS.bg, borderRadius: 1, fontFamily: 'monospace', fontSize: 12, color: COLORS.green }}>
                      {ep.response}
                    </Box>
                  </Box>
                  <Button size="small" variant="outlined" startIcon={<PlayArrow />} sx={{ color: COLORS.orange, borderColor: COLORS.orange }}>
                    Try it out
                  </Button>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Box>
      ))}
    </Box>
  )
}
