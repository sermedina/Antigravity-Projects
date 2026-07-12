import { useState } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, FormControl,
  InputLabel, Select, MenuItem, Button, Stack, Switch, FormControlLabel,
  Divider, Alert
} from '@mui/material';
import { Save, Settings, Security, Alarm, BusinessCenter } from '@mui/icons-material';

export default function SettingsPage() {
  // Security
  const [otpExpiration, setOtpExpiration] = useState('15');
  const [otpAttempts, setOtpAttempts] = useState('3');
  const [mfaEnforced, setMfaEnforced] = useState(true);

  // Reminders
  const [cronRule, setCronRule] = useState('0 * * * *');
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);

  // Business
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box sx={{ color: 'white' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
          Configuración Global
        </Typography>
        <Typography variant="body2" color="grey.400">
          Ajusta los parámetros operativos, de seguridad y de negocio del motor financiero.
        </Typography>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#a7f3d0', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          Configuración global guardada correctamente
        </Alert>
      )}

      <Box component="form" onSubmit={handleSave}>
        <Grid container spacing={3}>
          {/* Security Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Security sx={{ color: 'primary.light' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Seguridad y Tokens</Typography>
              </Box>

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Vencimiento Token OTP (Minutos)"
                  type="number"
                  value={otpExpiration}
                  onChange={(e) => setOtpExpiration(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    },
                    '& .MuiInputLabel-root': { color: 'grey.500' },
                  }}
                />

                <TextField
                  fullWidth
                  label="Intentos Máximos OTP"
                  type="number"
                  value={otpAttempts}
                  onChange={(e) => setOtpAttempts(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    },
                    '& .MuiInputLabel-root': { color: 'grey.500' },
                  }}
                />

                <FormControlLabel
                  control={<Switch checked={mfaEnforced} onChange={(e) => setMfaEnforced(e.target.checked)} color="primary" />}
                  label="Forzar MFA para Administradores"
                  sx={{ color: 'grey.300' }}
                />
              </Stack>
            </Paper>

            {/* Reminder Config */}
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Alarm sx={{ color: 'primary.light' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Parámetros del Recordatorio</Typography>
              </Box>

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Expresión Cron de Despacho"
                  value={cronRule}
                  onChange={(e) => setCronRule(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      fontFamily: 'monospace',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    },
                    '& .MuiInputLabel-root': { color: 'grey.500' },
                  }}
                />

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                <Typography variant="body2" color="grey.400" sx={{ fontWeight: 600 }}>Canales de Envío Habilitados</Typography>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={<Switch checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} color="primary" />}
                    label="Habilitar Email"
                    sx={{ color: 'grey.300' }}
                  />
                  <FormControlLabel
                    control={<Switch checked={smsEnabled} onChange={(e) => setSmsEnabled(e.target.checked)} color="primary" />}
                    label="Habilitar SMS"
                    sx={{ color: 'grey.300' }}
                  />
                  <FormControlLabel
                    control={<Switch checked={pushEnabled} onChange={(e) => setPushEnabled(e.target.checked)} color="primary" />}
                    label="Habilitar Push Alertas"
                    sx={{ color: 'grey.300' }}
                  />
                </Stack>
              </Stack>
            </Paper>
          </Grid>

          {/* Business Config Column (Right Column) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <BusinessCenter sx={{ color: 'primary.light' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Configuración Operativa de Negocio</Typography>
              </Box>

              <Stack spacing={3} sx={{ flexGrow: 1 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'grey.500' }}>Moneda Base del Sistema</InputLabel>
                  <Select
                    value={baseCurrency}
                    label="Moneda Base del Sistema"
                    onChange={(e) => setBaseCurrency(e.target.value)}
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                      '& .MuiSvgIcon-root': { color: 'grey.500' },
                    }}
                  >
                    <MenuItem value="USD">Dólar Estadounidense (USD)</MenuItem>
                    <MenuItem value="EUR">Euro (EUR)</MenuItem>
                    <MenuItem value="VES">Bolívar Venezolano (VES)</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={<Switch checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} color="error" />}
                  label="Activar Modo Mantenimiento"
                  sx={{ color: 'grey.300' }}
                />



                <Box sx={{ mt: 'auto', pt: 3 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    startIcon={<Save />}
                    sx={{
                      py: 1.5,
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      },
                    }}
                  >
                    Guardar Configuración
                  </Button>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
