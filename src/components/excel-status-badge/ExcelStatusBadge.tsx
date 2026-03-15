import { Box } from '@mui/material';

interface ExcelStatusBadgeProps {
  status: 'PAID' | 'PENDING' | 'UNDERPAID' | 'OVERPAID' | 'REJECTED' | 'active' | 'completed' | 'cancelled';
  label?: string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  PAID:      { bg: 'rgba(var(--palette-success-mainChannel) / 0.16)', color: 'var(--palette-success-dark)',  border: 'rgba(var(--palette-success-mainChannel) / 0.4)' },
  completed: { bg: 'rgba(var(--palette-success-mainChannel) / 0.16)', color: 'var(--palette-success-dark)',  border: 'rgba(var(--palette-success-mainChannel) / 0.4)' },
  REJECTED:  { bg: 'rgba(var(--palette-error-mainChannel)   / 0.16)', color: 'var(--palette-error-main)',    border: 'rgba(var(--palette-error-mainChannel)   / 0.4)' },
  cancelled: { bg: 'rgba(var(--palette-error-mainChannel)   / 0.16)', color: 'var(--palette-error-main)',    border: 'rgba(var(--palette-error-mainChannel)   / 0.4)' },
  PENDING:   { bg: 'rgba(var(--palette-warning-mainChannel) / 0.16)', color: 'var(--palette-warning-dark)',  border: 'rgba(var(--palette-warning-mainChannel) / 0.4)' },
  UNDERPAID: { bg: 'rgba(var(--palette-warning-mainChannel) / 0.16)', color: 'var(--palette-warning-dark)',  border: 'rgba(var(--palette-warning-mainChannel) / 0.4)' },
  OVERPAID:  { bg: 'rgba(var(--palette-info-mainChannel)    / 0.16)', color: 'var(--palette-info-dark)',     border: 'rgba(var(--palette-info-mainChannel)    / 0.4)' },
  active:    { bg: 'rgba(var(--palette-info-mainChannel)    / 0.16)', color: 'var(--palette-info-dark)',     border: 'rgba(var(--palette-info-mainChannel)    / 0.4)' },
};

const DEFAULT_STYLE = {
  bg: 'rgba(var(--palette-grey-500Channel) / 0.16)',
  color: 'var(--palette-text-secondary)',
  border: 'rgba(var(--palette-grey-500Channel) / 0.4)',
};

export function ExcelStatusBadge({ status, label }: ExcelStatusBadgeProps) {
  const s = STATUS_STYLES[status] ?? DEFAULT_STYLE;
  const displayLabel = label || status;

  return (
    <Box
      sx={{
        display: 'inline-block',
        padding: '3px 8px',
        fontSize: '11px',
        fontWeight: 600,
        fontFamily: 'Calibri, Arial, sans-serif',
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 0,
        textAlign: 'center',
        textTransform: 'uppercase',
      }}
    >
      {displayLabel}
    </Box>
  );
}
