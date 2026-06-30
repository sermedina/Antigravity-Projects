import { AppBar, Toolbar, Typography, IconButton, Box, Chip, Tooltip } from '@mui/material';
import { Notifications, Refresh } from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface TopbarProps {
  title: string;
}

export default function Topbar({ title }: TopbarProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: '#0f172a',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        zIndex: 10,
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: '64px !important' }}>
        <Typography variant="h6" color="white" sx={{ flexGrow: 1, fontWeight: 700 }}>
          {title}
        </Typography>

        {user?.roles?.map((role) => (
          <Chip
            key={role}
            label={role.replace('_', ' ')}
            size="small"
            sx={{
              bgcolor: role === 'SYSTEM_ADMIN' ? 'rgba(139,92,246,0.2)' : 'rgba(34,197,94,0.2)',
              color: role === 'SYSTEM_ADMIN' ? '#a78bfa' : '#86efac',
              fontWeight: 600,
              fontSize: 11,
              border: `1px solid ${role === 'SYSTEM_ADMIN' ? 'rgba(139,92,246,0.4)' : 'rgba(34,197,94,0.4)'}`,
            }}
          />
        ))}

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Refrescar datos">
            <IconButton
              onClick={() => queryClient.invalidateQueries()}
              sx={{ color: 'grey.400' }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Notificaciones">
            <IconButton sx={{ color: 'grey.400' }}>
              <Notifications />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
