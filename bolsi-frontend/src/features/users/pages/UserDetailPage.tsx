import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, Stack, Divider, Card, CardContent } from '@mui/material';
import Grid from '@mui/material/Grid';
import { ArrowBack, Email, Phone, CalendarToday, AccountBalance, Security, History } from '@mui/icons-material';
import StatusBadge from '@/components/common/StatusBadge';
import DataTable from '@/components/common/DataTable';
import api from '@/lib/api';
import type { User } from '@/types';
import { format } from 'date-fns';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, error } = useQuery<User & { accounts?: any[] }>({
    queryKey: ['user-detail', id],
    queryFn: async () => {
      const res = await api.get(`/users/${id}`);
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <Typography color="grey.400">Cargando detalles del usuario...</Typography>
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">Error al cargar el usuario</Typography>
        <Button onClick={() => navigate('/users')} startIcon={<ArrowBack />} sx={{ mt: 2, color: 'white' }}>
          Volver al directorio
        </Button>
      </Box>
    );
  }

  const tokenColumns = [
    { id: 'id', label: 'ID', align: 'center' as const },
    { id: 'token', label: 'Token' },
    { id: 'type', label: 'Tipo' },
    { id: 'medium', label: 'Medio' },
    { id: 'expires_at', label: 'Expira', render: (row: any) => format(new Date(row.expires_at), 'dd/MM/yyyy HH:mm') },
    { id: 'is_used', label: 'Usado', render: (row: any) => <StatusBadge status={row.is_used ? 'TRUE' : 'FALSE'} /> },
    { id: 'created_at', label: 'Generado', render: (row: any) => format(new Date(row.created_at), 'dd/MM/yyyy HH:mm') }
  ];

  return (
    <Box sx={{ color: 'white' }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button onClick={() => navigate('/users')} startIcon={<ArrowBack />} sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}>
          Volver
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Detalle del Usuario: @{user.username}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white' }}>
            <Stack spacing={2.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ bgcolor: 'primary.dark', width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.light' }}>
                  <Security />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{user.first_name} {user.last_name}</Typography>
                  <Typography variant="body2" color="grey.400">@{user.username}</Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="grey.400">Tipo Usuario</Typography>
                  <StatusBadge status={user.user_type} type="userType" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="grey.400">Estado de Cuenta</Typography>
                  <StatusBadge status={user.is_active} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="grey.400">Rol asignado</Typography>
                  <StatusBadge status={user.roles?.[0]?.name || 'APP_USER'} />
                </Box>
              </Stack>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ color: 'grey.500', fontSize: 20 }} />
                  <Typography variant="body2" color="grey.200">{user.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ color: 'grey.500', fontSize: 20 }} />
                  <Typography variant="body2" color="grey.200">{user.phone || 'Sin número de teléfono'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday sx={{ color: 'grey.500', fontSize: 20 }} />
                  <Typography variant="body2" color="grey.200">
                    Registrado: {format(new Date(user.created_at), 'dd/MM/yyyy HH:mm')}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <AccountBalance sx={{ color: 'primary.light' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Cuentas y Balances</Typography>
            </Box>

            {!user.accounts || user.accounts.length === 0 ? (
              <Typography color="grey.500">Este usuario no tiene cuentas financieras registradas.</Typography>
            ) : (
              <Grid container spacing={2}>
                {user.accounts.map((account) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={account.id}>
                    <Card sx={{ bgcolor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white' }}>
                      <CardContent>
                        <Typography variant="caption" color="grey.500" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
                          {account.type}
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 0.5, mb: 1.5, fontWeight: 700 }}>
                          {account.name}
                        </Typography>
                        <Typography variant="h5" color="#10b981" sx={{ fontWeight: 800 }}>
                          ${Number(account.balance).toLocaleString('es-ES', { minimumFractionDigits: 2 })} {account.currency}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <History sx={{ color: 'primary.light' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Tokens de Verificación y Recuperación</Typography>
            </Box>
            <DataTable columns={tokenColumns} data={user.verification_tokens || []} loading={false} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
