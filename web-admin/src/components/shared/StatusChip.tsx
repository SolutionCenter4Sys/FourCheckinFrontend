import { Chip } from '@mui/material'
import { COLORS } from '../../theme'
import type { AudienciaStatus } from '../../models/types'

const statusConfig: Record<string, { label: string; color: string }> = {
  em_andamento: { label: '● Em andamento', color: COLORS.green },
  agendada:     { label: '◯ Agendada',     color: COLORS.blue  },
  encerrada:    { label: '✓ Encerrada',    color: COLORS.gray3 },
  cancelada:    { label: '✕ Cancelada',    color: COLORS.red   },
}

const DEFAULT_STATUS = { label: '— Desconhecido', color: COLORS.gray4 }

export default function StatusChip({ status }: { status: AudienciaStatus | string }) {
  const cfg = statusConfig[status] ?? DEFAULT_STATUS
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        bgcolor: `${cfg.color}22`,
        color: cfg.color,
        borderColor: `${cfg.color}55`,
        border: '1px solid',
        fontWeight: 600,
        fontSize: 11,
      }}
    />
  )
}
