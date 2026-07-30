import { Chip } from '@mui/material';

interface StatusBadgeProps {
  status: string | boolean;
  type?: 'status' | 'verification' | 'userType' | 'transactionType' | 'categoryType';
}

export default function StatusBadge({ status, type = 'status' }: StatusBadgeProps) {
  let label = String(status);
  let bgcolor = 'rgba(255, 255, 255, 0.05)';
  let color = '#94a3b8';
  let border = '1px solid rgba(255, 255, 255, 0.1)';

  if (type === 'verification') {
    const verified = !!status;
    label = verified ? 'Verificado' : 'Pendiente';
    bgcolor = verified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)';
    color = verified ? '#4ade80' : '#facc15';
    border = `1px solid ${verified ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)'}`;
  } else if (type === 'userType') {
    label = String(status);
    bgcolor = status === 'NATURAL' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(168, 85, 247, 0.1)';
    color = status === 'NATURAL' ? '#60a5fa' : '#c084fc';
    border = `1px solid ${status === 'NATURAL' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)'}`;
  } else if (type === 'transactionType') {
    const s = String(status).toUpperCase();
    label = s === 'INCOME' ? 'Ingreso' : s === 'EXPENSE' ? 'Egreso' : s === 'DOA' ? 'DOA' : s === 'SAVING' ? 'Ahorro' : 'Transferencia';
    bgcolor = s === 'INCOME' ? 'rgba(34, 197, 94, 0.1)' : s === 'EXPENSE' ? 'rgba(239, 68, 68, 0.1)' : s === 'DOA' ? 'rgba(168, 85, 247, 0.1)' : s === 'SAVING' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(59, 130, 246, 0.1)';
    color = s === 'INCOME' ? '#4ade80' : s === 'EXPENSE' ? '#fca5a5' : s === 'DOA' ? '#c084fc' : s === 'SAVING' ? '#fbbf24' : '#60a5fa';
    border = `1px solid ${s === 'INCOME' ? 'rgba(34, 197, 94, 0.2)' : s === 'EXPENSE' ? 'rgba(239, 68, 68, 0.2)' : s === 'DOA' ? 'rgba(168, 85, 247, 0.2)' : s === 'SAVING' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`;
  } else if (type === 'categoryType') {
    const s = String(status).toUpperCase();
    label = s === 'INCOME' ? 'Ingreso' : s === 'EXPENSE' ? 'Egreso' : s === 'SAVING' ? 'Ahorro' : 'Distribución DOA';
    bgcolor = s === 'INCOME' ? 'rgba(34, 197, 94, 0.1)' : s === 'EXPENSE' ? 'rgba(239, 68, 68, 0.1)' : s === 'SAVING' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(168, 85, 247, 0.1)';
    color = s === 'INCOME' ? '#4ade80' : s === 'EXPENSE' ? '#fca5a5' : s === 'SAVING' ? '#fbbf24' : '#c084fc';
    border = `1px solid ${s === 'INCOME' ? 'rgba(34, 197, 94, 0.2)' : s === 'EXPENSE' ? 'rgba(239, 68, 68, 0.2)' : s === 'SAVING' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(168, 85, 247, 0.2)'}`;
  } else {
    // Normal states: e.g. ACTIVE, LOCKED, COMPLETED, IN_PROGRESS, etc.
    const s = String(status).toUpperCase();
    if (s === 'ACTIVE' || s === 'COMPLETED' || s === 'TRUE' || s === 'PUBLISHED') {
      label = s === 'TRUE' ? 'Activo' : s === 'PUBLISHED' ? 'Publicado' : s === 'COMPLETED' ? 'Completado' : 'Activo';
      bgcolor = 'rgba(34, 197, 94, 0.1)';
      color = '#4ade80';
      border = '1px solid rgba(34, 197, 94, 0.2)';
    } else if (s === 'PENDING' || s === 'IN_PROGRESS' || s === 'DRAFT') {
      label = s === 'DRAFT' ? 'Borrador' : s === 'IN_PROGRESS' ? 'En Progreso' : 'Pendiente';
      bgcolor = 'rgba(234, 179, 8, 0.1)';
      color = '#facc15';
      border = '1px solid rgba(234, 179, 8, 0.2)';
    } else if (s === 'LOCKED' || s === 'FALSE' || s === 'CANCELLED' || s === 'INACTIVE') {
      label = s === 'FALSE' ? 'Inactivo' : s === 'INACTIVE' ? 'Inactivo' : s === 'CANCELLED' ? 'Cancelado' : 'Bloqueado';
      bgcolor = 'rgba(239, 68, 68, 0.1)';
      color = '#fca5a5';
      border = '1px solid rgba(239, 68, 68, 0.2)';
    }
  }

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor,
        color,
        border,
        fontWeight: 600,
        fontSize: '0.75rem',
        borderRadius: 1.5,
      }}
    />
  );
}
