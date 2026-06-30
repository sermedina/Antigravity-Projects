import { Box, Typography, Paper, Grid, Stack, Divider, Avatar } from '@mui/material';
import { Security, Email, AdminPanelSettings, Person } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import StatusBadge from '@/components/common/StatusBadge';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Box sx={{ color: 'white' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
          Mi Perfil
        </Typography>
        <Typography variant="body2" color="grey.400">
          Visualiza los detalles de tu cuenta de administrador y rol asignado.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 4, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white' }}>
            <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: 32,
                  fontWeight: 800,
                  boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
                }}
              >
                {user.first_name?.[0]?.toUpperCase() ?? 'A'}
              </Avatar>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {user.first_name || user.username}
                </Typography>
                <Typography variant="body2" color="grey.400">@{user.username}</Typography>
              </Box>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', width: '100%' }} />

              <Stack spacing={2} sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Email sx={{ color: 'grey.500' }} />
                    <Typography variant="body2" color="grey.400">Email</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.email}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <AdminPanelSettings sx={{ color: 'grey.500' }} />
                    <Typography variant="body2" color="grey.400">Roles</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    {user.roles.map(r => (
                      <StatusBadge key={r} status={r} />
                    ))}
                  </Stack>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Security sx={{ color: 'grey.500' }} />
                    <Typography variant="body2" color="grey.400">Estado Acceso</Typography>
                  </Stack>
                  <StatusBadge status="ACTIVE" />
                </Box>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
