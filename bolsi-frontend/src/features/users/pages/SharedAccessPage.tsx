import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Paper, Stack } from '@mui/material';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import api from '@/lib/api';
import type { SharedAccess } from '@/types';
import { format } from 'date-fns';

export default function SharedAccessPage() {
  const { data: accesses = [], isLoading } = useQuery<SharedAccess[]>({
    queryKey: ['shared-access-list'],
    queryFn: async () => {
      const res = await api.get('/shared-access-audits');
      return res.data;
    }
  });

  const columns = [
    { id: 'id', label: 'ID Vinculación', align: 'center' as const, render: (row: SharedAccess) => row.id },
    {
      id: 'owner',
      label: 'Propietario de Cuenta',
      render: (row: SharedAccess) => (
        <Stack spacing={0.2}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {row.owner?.first_name ? `${row.owner.first_name} ${row.owner.last_name || ''}` : 'N/A'}
          </Typography>
          <Typography variant="caption" color="grey.500">@{row.owner?.username}</Typography>
        </Stack>
      )
    },
    {
      id: 'guest',
      label: 'Usuario Invitado',
      render: (row: SharedAccess) => (
        <Stack spacing={0.2}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {row.guest?.first_name ? `${row.guest.first_name} ${row.guest.last_name || ''}` : 'N/A'}
          </Typography>
          <Typography variant="caption" color="grey.500">@{row.guest?.username}</Typography>
        </Stack>
      )
    },
    {
      id: 'access_level',
      label: 'Nivel de Acceso',
      render: (row: SharedAccess) => {
        const isWrite = row.access_level === 'READ_WRITE';
        return <StatusBadge status={isWrite ? 'ACTIVE' : 'LOCKED'} type="status" />;
      }
    },
    {
      id: 'created_at',
      label: 'Fecha Delegación',
      render: (row: SharedAccess) => format(new Date(row.created_at), 'dd/MM/yyyy HH:mm')
    }
  ];

  return (
    <Box sx={{ color: 'white' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
          Auditoría de Accesos Compartidos
        </Typography>
        <Typography variant="body2" color="grey.400">
          Supervisión de delegaciones financieras y cuentas compartidas entre usuarios de la plataforma.
        </Typography>
      </Box>

      {/* Shared Access Table */}
      <DataTable
        columns={columns}
        data={accesses}
        loading={isLoading}
      />
    </Box>
  );
}
