import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Paper, Stack, Avatar, Chip } from '@mui/material';
import Grid from '@mui/material/Grid';
import { School, TrendingUp, AccessTime } from '@mui/icons-material';
import DataTable from '@/components/common/DataTable';
import api from '@/lib/api';
import type { UserContentProgress } from '@/types';
import { format } from 'date-fns';

export default function UserProgressPage() {
  const { data: progressData = [], isLoading } = useQuery<UserContentProgress[]>({
    queryKey: ['admin-user-progress'],
    queryFn: async () => {
      const res = await api.get('/educational-contents/progress/global');
      return res.data;
    }
  });

  const totalRecords = progressData.length;
  const completedItems = progressData.filter(p => Number(p.progress_percentage) === 100);
  const completionRate = totalRecords > 0 ? ((completedItems.length / totalRecords) * 100).toFixed(1) : '0';
  const uniqueUsers = new Set(progressData.map(p => (p.user as any)?.id)).size;

  const columns = [
    {
      id: 'user', label: 'Usuario',
      render: (row: UserContentProgress) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#6366f1', width: 32, height: 32, fontSize: '0.8rem' }}>
            {((row.user as any)?.username || 'U').charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>@{(row.user as any)?.username || 'Anónimo'}</Typography>
        </Box>
      )
    },
    {
      id: 'content', label: 'Contenido',
      render: (row: UserContentProgress) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.content?.title || 'Contenido Eliminado'}</Typography>
          {row.content?.type && <Chip label={row.content.type} size="small" sx={{ mt: 0.5, bgcolor: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', fontSize: '0.65rem' }} />}
        </Box>
      )
    },
    {
      id: 'progress_percentage', label: 'Progreso',
      render: (row: UserContentProgress) => {
        const pct = Number(row.progress_percentage);
        const color = pct === 100 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#6366f1';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ flex: 1, bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 8 }}>
              <Box sx={{ width: `${pct}%`, bgcolor: color, height: 8, borderRadius: 4, transition: 'width 0.4s ease' }} />
            </Box>
            <Typography variant="body2" color={color} sx={{ minWidth: 42, textAlign: 'right', fontWeight: 700 }}>{pct}%</Typography>
          </Box>
        );
      }
    },
    {
      id: 'completed_at', label: 'Completado',
      render: (row: UserContentProgress) => row.completed_at
        ? <Typography variant="body2" color="#10b981">{format(new Date(row.completed_at), 'dd/MM/yyyy HH:mm')}</Typography>
        : <Typography variant="body2" color="grey.500">En progreso...</Typography>
    }
  ];

  return (
    <Box sx={{ color: 'white' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>Progreso del Usuario</Typography>
        <Typography variant="body2" color="grey.400">
          Monitoreo global del consumo del contenido educativo financiero en la plataforma.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white' }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box sx={{ bgcolor: 'rgba(99, 102, 241, 0.15)', p: 1.5, borderRadius: 2, color: '#6366f1' }}><School /></Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{totalRecords}</Typography>
                <Typography variant="body2" color="grey.400">Registros de progreso</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white' }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', p: 1.5, borderRadius: 2, color: '#10b981' }}><TrendingUp /></Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{completionRate}%</Typography>
                <Typography variant="body2" color="grey.400">Tasa de finalización</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white' }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box sx={{ bgcolor: 'rgba(139, 92, 246, 0.15)', p: 1.5, borderRadius: 2, color: '#8b5cf6' }}><AccessTime /></Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{uniqueUsers}</Typography>
                <Typography variant="body2" color="grey.400">Usuarios activos en contenidos</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <DataTable columns={columns} data={progressData} loading={isLoading} />
    </Box>
  );
}
