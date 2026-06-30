import { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff, AccountBalanceWallet } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user } = response.data;
      
      // Verify if the user has admin/manager roles
      const allowedRoles = ['SYSTEM_ADMIN', 'CONTENT_MANAGER'];
      const hasAccess = user.roles.some((r: string) => allowedRoles.includes(r));
      
      if (!hasAccess) {
        throw new Error('Access denied: Unauthorized role');
      }

      login(token, user);
      
      // Redirect based on role
      if (user.roles.includes('SYSTEM_ADMIN')) {
        navigate(from, { replace: true });
      } else {
        navigate('/content-dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <AccountBalanceWallet sx={{ color: 'white', fontSize: 28 }} />
      </Box>
      <Typography variant="h5" align="center" color="white" gutterBottom sx={{ fontWeight: 800 }}>
        Bolsi Admin
      </Typography>
      <Typography variant="body2" color="grey.400" align="center" sx={{ mb: 3 }}>
        Ingresa tus credenciales para acceder al panel.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ width: '100%', mb: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          label="Usuario"
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
            },
            '& .MuiInputLabel-root': { color: 'grey.500' },
          }}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'grey.500' }}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
            },
            '& .MuiInputLabel-root': { color: 'grey.500' },
          }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            mt: 3,
            mb: 2,
            py: 1.5,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
        </Button>
      </Box>
    </Box>
  );
}
