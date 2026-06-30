import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, IconButton, Tooltip, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Visibility, Block, CheckCircleOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import api from '@/lib/api';
import type { User, PaginatedResponse } from '@/types';
import { format } from 'date-fns';

export default function UserDirectoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Filter States
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('');
  const [isActive, setIsActive] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  // Fetch Users
  const { data, isLoading } = useQuery<PaginatedResponse<User>>({
    queryKey: ['users-list', page, limit, username, email, userType, isActive],
    queryFn: async () => {
      let url = `/users?page=${page + 1}&limit=${limit}`;
      if (username) url += `&username=${username}`;
      if (email) url += `&email=${email}`;
      if (userType) url += `&user_type=${userType}`;
      if (isActive !== '') url += `&is_active=${isActive}`;
      
      const res = await api.get(url);
      return res.data;
    }
  });

  // Toggle user active status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: boolean }) => {
      await api.patch(`/users/${id}/status`, { is_active: status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
    }
  });

  const handleToggleActive = (user: User) => {
    toggleStatusMutation.mutate({ id: user.id, status: !user.is_active });
  };

  const columns = [
    { id: 'id', label: 'ID', align: 'center' as const },
    { id: 'username', label: 'Usuario' },
    {
      id: 'email',
      label: 'Email',
      render: (row: User) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">{row.email}</Typography>
          <StatusBadge status={row.is_email_verified} type="verification" />
        </Box>
      )
    },
    {
      id: 'phone',
      label: 'Teléfono',
      render: (row: User) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">{row.phone || 'N/A'}</Typography>
          {row.phone && <StatusBadge status={row.is_phone_verified} type="verification" />}
        </Box>
      )
    },
    {
      id: 'user_type',
      label: 'Tipo',
      render: (row: User) => <StatusBadge status={row.user_type} type="userType" />
    },
    {
      id: 'location',
      label: 'Ubicación',
      render: (row: User) => (
        <Typography variant="body2">
          {row.country || 'N/A'}{row.city ? `, ${row.city}` : ''}
        </Typography>
      )
    },
    {
      id: 'is_active',
      label: 'Estado',
      render: (row: User) => <StatusBadge status={row.is_active} />
    },
    {
      id: 'created_at',
      label: 'Registro',
      render: (row: User) => (
        <Typography variant="body2">
          {format(new Date(row.created_at), 'dd/MM/yyyy')}
        </Typography>
      )
    },
    {
      id: 'actions',
      label: 'Acciones',
      align: 'center' as const,
      render: (row: User) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          <Tooltip title="Ver Detalle">
            <IconButton
              size="small"
              onClick={() => navigate(`/users/${row.id}`)}
              sx={{ color: '#6366f1' }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={row.is_active ? 'Inhabilitar Cuenta' : 'Habilitar Cuenta'}>
            <IconButton
              size="small"
              onClick={() => handleToggleActive(row)}
              sx={{ color: row.is_active ? '#ef4444' : '#10b981' }}
            >
              {row.is_active ? <Block fontSize="small" /> : <CheckCircleOutlined fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ color: 'white' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
          Directorio de Usuarios
        </Typography>
        <Typography variant="body2" color="grey.400">
          Administra los perfiles de usuario, el estado de las cuentas y verifica los detalles de identidad.
        </Typography>
      </Box>

      {/* Filters Card */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white' }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              label="Buscar por usuario..."
              value={username}
              onChange={(e) => { setUsername(e.target.value); setPage(0); }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                },
                '& .MuiInputLabel-root': { color: 'grey.500' },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              label="Buscar por email..."
              value={email}
              onChange={(e) => { setEmail(e.target.value); setPage(0); }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                },
                '& .MuiInputLabel-root': { color: 'grey.500' },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'grey.500' }}>Tipo</InputLabel>
              <Select
                value={userType}
                label="Tipo"
                onChange={(e) => { setUserType(e.target.value); setPage(0); }}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                  '& .MuiSvgIcon-root': { color: 'grey.500' },
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="NATURAL">Natural</MenuItem>
                <MenuItem value="JURIDICO">Jurídico</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'grey.500' }}>Estado</InputLabel>
              <Select
                value={isActive}
                label="Estado"
                onChange={(e) => { setIsActive(e.target.value); setPage(0); }}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                  '& .MuiSvgIcon-root': { color: 'grey.500' },
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Activo</MenuItem>
                <MenuItem value="false">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setUsername('');
                setEmail('');
                setUserType('');
                setIsActive('');
                setPage(0);
              }}
              sx={{
                py: 1.5,
                fontWeight: 700,
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.03)' }
              }}
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Users DataTable */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        totalRows={data?.total || 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </Box>
  );
}
