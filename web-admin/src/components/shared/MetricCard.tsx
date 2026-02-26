import { Box, Typography, Skeleton } from '@mui/material'
import { COLORS } from '../../theme'

interface MetricCardProps {
  label: string
  value: string | number
  subtitle?: string
  color?: string
  loading?: boolean
}

export default function MetricCard({ label, value, subtitle, color = COLORS.orange, loading }: MetricCardProps) {
  return (
    <Box
      sx={{
        bgcolor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderTop: `3px solid ${color}`,
        borderRadius: 2,
        p: 2.5,
      }}
    >
      <Typography variant="overline" sx={{ color: COLORS.gray4, mb: 0.5, display: 'block' }}>
        {label}
      </Typography>
      {loading ? (
        <Skeleton variant="text" width={80} height={40} sx={{ bgcolor: COLORS.raised }} />
      ) : (
        <Typography sx={{ fontSize: '2rem', fontWeight: 900, color, lineHeight: 1 }}>
          {value}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="body2" sx={{ color: COLORS.gray3, mt: 0.5, fontSize: 12 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  )
}
