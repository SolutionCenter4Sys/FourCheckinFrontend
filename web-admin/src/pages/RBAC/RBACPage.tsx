import { useEffect, useState } from 'react'
import {
  Box, Typography, Grid, Paper, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Switch, CircularProgress, Avatar,
} from '@mui/material'
import { usuariosApi } from '../../services/api'
import { COLORS } from '../../theme'
import type { PerfilRBAC, Usuario } from '../../models/types'

export default function RBACPage() {
  const [perfis, setPerfis] = useState<PerfilRBAC[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [selecionado, setSelecionado] = useState<PerfilRBAC | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([usuariosApi.perfis(), usuariosApi.listar()]).then(([p, u]: any[]) => {
      setPerfis(p.data || [])
      setSelecionado(p.data?.[0] || null)
      setUsuarios(u.data || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <Box sx={{ textAlign: 'center', mt: 8 }}><CircularProgress sx={{ color: COLORS.orange }} /></Box>

  return (
    <Box>
      <Typography variant="h4" sx={{ color: COLORS.white, fontWeight: 800, mb: 3 }}>Gestão de Perfis RBAC</Typography>
      <Grid container spacing={2}>
        {/* Lista de perfis */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <Typography variant="h6" sx={{ color: COLORS.white, mb: 2 }}>Perfis</Typography>
            {perfis.map(p => (
              <Box
                key={p.id}
                onClick={() => setSelecionado(p)}
                sx={{
                  p: 2, mb: 1, borderRadius: 1.5, cursor: 'pointer',
                  bgcolor: selecionado?.id === p.id ? `${COLORS.orange}15` : COLORS.raised,
                  border: `1px solid ${selecionado?.id === p.id ? COLORS.orange : COLORS.border}`,
                  borderLeft: `4px solid ${p.cor}`,
                  '&:hover': { bgcolor: `${COLORS.orange}10` },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: COLORS.white, fontWeight: 600 }}>{p.nome}</Typography>
                  <Chip label={p.total_usuarios} size="small" sx={{ bgcolor: COLORS.raised, color: COLORS.gray3, fontSize: 10 }} />
                </Box>
                <Typography variant="caption" sx={{ color: COLORS.gray3 }}>{p.descricao}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Permissões do perfil selecionado */}
        {selecionado && (
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
              <Typography variant="h6" sx={{ color: COLORS.white, mb: 2 }}>
                Permissões — {selecionado.nome}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Módulo</TableCell>
                      {['Visualizar', 'Criar', 'Editar', 'Excluir', 'Exportar'].map(h => (
                        <TableCell key={h} align="center">{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(selecionado.permissoes).map(([modulo, perms]) => (
                      <TableRow key={modulo} hover sx={{ '&:hover': { bgcolor: COLORS.raised } }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: COLORS.white, textTransform: 'capitalize' }}>
                            {modulo.replace(/_/g, ' ')}
                          </Typography>
                        </TableCell>
                        {['visualizar', 'criar', 'editar', 'excluir', 'exportar'].map(acao => (
                          <TableCell key={acao} align="center">
                            {acao in (perms as any) ? (
                              <Switch
                                size="small"
                                checked={!!(perms as any)[acao]}
                                sx={{
                                  '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.orange },
                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: COLORS.orange },
                                }}
                              />
                            ) : (
                              <Typography variant="caption" sx={{ color: COLORS.border }}>—</Typography>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Usuários com este perfil */}
            <Paper sx={{ p: 2, mt: 2, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
              <Typography variant="h6" sx={{ color: COLORS.white, mb: 2 }}>Usuários com este perfil</Typography>
              {usuarios.filter(u => u.perfil_id === selecionado.id).map(u => (
                <Box
                  key={u.id}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, borderRadius: 1, '&:hover': { bgcolor: COLORS.raised } }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: `${selecionado.cor}30`, color: selecionado.cor, fontSize: 12, fontWeight: 700 }}>
                    {u.nome.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: COLORS.white, fontWeight: 500 }}>{u.nome}</Typography>
                    <Typography variant="caption" sx={{ color: COLORS.gray3 }}>{u.departamento}</Typography>
                  </Box>
                  <Chip
                    label={u.ativo ? 'Ativo' : 'Inativo'}
                    size="small"
                    sx={{
                      bgcolor: u.ativo ? `${COLORS.green}20` : `${COLORS.red}20`,
                      color: u.ativo ? COLORS.green : COLORS.red,
                      fontSize: 10,
                    }}
                  />
                </Box>
              ))}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
