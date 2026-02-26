import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, Chip, LinearProgress,
} from '@mui/material'
import { CloudUpload, Download, CheckCircle, Warning, Error as ErrorIcon } from '@mui/icons-material'
import { uploadApi } from '../../services/api'
import { COLORS } from '../../theme'

export default function UploadPage() {
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [resultado, setResultado] = useState<any>(null)
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setArquivo(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
  })

  const handleImportar = async () => {
    if (!arquivo) return
    setUploading(true)
    try {
      const r: any = await uploadApi.participantes({ nome_arquivo: arquivo.name, tamanho: arquivo.size })
      setResultado(r.data)
    } catch (e) { console.error(e) }
    finally { setUploading(false) }
  }

  const previewRows = [
    { nome: 'João Augusto Silva', email: 'joao.silva@banco.com.br', departamento: 'Jurídico', perfil: 'participante', status: 'ok' },
    { nome: 'Maria Rodrigues', email: 'maria.r@banco.com.br', departamento: 'Compliance', perfil: 'gestor', status: 'ok' },
    { nome: 'Carlos Fernandes', email: 'joao.silva@banco.com.br', departamento: 'Financeiro', perfil: 'participante', status: 'error' },
  ]

  return (
    <Box>
      <Typography variant="h4" sx={{ color: COLORS.white, fontWeight: 800, mb: 1 }}>Upload em Massa</Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>Importar participantes via CSV ou XLSX · Máximo 5.000 registros · 10MB</Typography>

      {/* Dropzone */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 6, mb: 3, textAlign: 'center', cursor: 'pointer',
          bgcolor: isDragActive ? `${COLORS.orange}15` : COLORS.surface,
          border: `2px dashed ${isDragActive ? COLORS.orange : COLORS.border}`,
          borderRadius: 2, transition: 'all 0.2s',
          '&:hover': { borderColor: COLORS.orange, bgcolor: `${COLORS.orange}08` },
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: isDragActive ? COLORS.orange : COLORS.gray4, mb: 2 }} />
        {arquivo ? (
          <Typography variant="body1" sx={{ color: COLORS.white }}>
            📄 {arquivo.name} ({(arquivo.size / 1024).toFixed(1)} KB)
          </Typography>
        ) : (
          <>
            <Typography variant="body1" sx={{ color: COLORS.white, mb: 0.5 }}>
              Arraste o arquivo CSV ou XLSX aqui
            </Typography>
            <Typography variant="body2">ou clique para selecionar</Typography>
          </>
        )}
        <Button variant="outlined" sx={{ mt: 2 }}>Selecionar Arquivo</Button>
      </Paper>

      {/* Botão de download do template */}
      <Button startIcon={<Download />} sx={{ color: COLORS.orange, mb: 3 }}>⬇️ Baixar Template CSV</Button>

      {/* Preview */}
      {arquivo && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ color: COLORS.white }}>Prévia dos Dados</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip icon={<CheckCircle sx={{ fontSize: 12 }} />} label="47 válidos" size="small" sx={{ bgcolor: `${COLORS.green}20`, color: COLORS.green }} />
              <Chip icon={<Warning sx={{ fontSize: 12 }} />} label="2 avisos" size="small" sx={{ bgcolor: `${COLORS.amber}20`, color: COLORS.amber }} />
              <Chip icon={<ErrorIcon sx={{ fontSize: 12 }} />} label="1 erro" size="small" sx={{ bgcolor: `${COLORS.red}20`, color: COLORS.red }} />
            </Box>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Nome', 'E-mail', 'Departamento', 'Perfil', 'Status'].map(h => <TableCell key={h}>{h}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {previewRows.map((r, i) => (
                <TableRow key={i} sx={{ bgcolor: r.status === 'error' ? `${COLORS.red}15` : 'transparent' }}>
                  <TableCell><Typography variant="body2" sx={{ color: COLORS.white }}>{r.nome}</Typography></TableCell>
                  <TableCell><Typography variant="caption" sx={{ color: COLORS.gray3 }}>{r.email}</Typography></TableCell>
                  <TableCell><Typography variant="caption">{r.departamento}</Typography></TableCell>
                  <TableCell><Typography variant="caption">{r.perfil}</Typography></TableCell>
                  <TableCell>
                    {r.status === 'ok'
                      ? <Chip label="✅ Válido" size="small" sx={{ bgcolor: `${COLORS.green}20`, color: COLORS.green, fontSize: 10 }} />
                      : <Chip label="❌ Email duplicado" size="small" sx={{ bgcolor: `${COLORS.red}20`, color: COLORS.red, fontSize: 10 }} />
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleImportar} disabled={uploading}>
            {uploading ? <LinearProgress sx={{ width: '100%' }} /> : 'Importar 47 Registros'}
          </Button>
        </Paper>
      )}

      {/* Resultado */}
      {resultado && (
        <Paper sx={{ p: 2, bgcolor: `${COLORS.green}15`, border: `1px solid ${COLORS.green}44`, borderRadius: 2 }}>
          <Typography sx={{ color: COLORS.green, fontWeight: 700 }}>✅ Importação concluída!</Typography>
          <Typography variant="body2" sx={{ color: COLORS.gray3 }}>
            {resultado.importados} importados · {resultado.erros} ignorados · {resultado.avisos} avisos
          </Typography>
        </Paper>
      )}
    </Box>
  )
}
