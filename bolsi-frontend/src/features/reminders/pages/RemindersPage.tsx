import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Paper, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, IconButton, Stack, Switch, FormControlLabel, Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Add, Edit, Delete, Notifications } from '@mui/icons-material';
import StatusBadge from '@/components/common/StatusBadge';
import DataTable from '@/components/common/DataTable';
import api from '@/lib/api';
import type { Reminder, User } from '@/types';
import { format } from 'date-fns';

export default function RemindersPage() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: reminders = [], isLoading } = useQuery<Reminder[]>({
    queryKey: ['admin-reminders-list'],
    queryFn: async () => {
      const res = await api.get('/reminders');
      return res.data;
    }
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users-for-reminders'],
    queryFn: async () => {
      const res = await api.get('/users?limit=500');
      return res.data?.data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => { await api.post('/reminders', payload); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-reminders-list'] }); handleClose(); },
    onError: (err: any) => { setError(err.response?.data?.error || err.message); }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => { await api.put(`/reminders/${id}`, payload); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-reminders-list'] }); handleClose(); },
    onError: (err: any) => { setError(err.response?.data?.error || err.message); }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await api.delete(`/reminders/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-reminders-list'] }); },
    onError: (err: any) => { alert(err.response?.data?.error || err.message); }
  });

  const handleOpenCreate = () => {
    setEditingReminder(null); setTitle(''); setDescription(''); setReminderDate(''); setIsRecurring(false); setRecurrenceRule(''); setUserId(''); setError(null); setOpen(true);
  };

  const handleOpenEdit = (r: Reminder) => {
    setEditingReminder(r); setTitle(r.title); setDescription(r.description || ''); setReminderDate(r.reminder_date?.slice(0, 16) || ''); setIsRecurring(r.is_recurring); setRecurrenceRule(r.recurrence_rule || ''); setUserId(String((r.user as any)?.id || '')); setError(null); setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditingReminder(null); };
  const handleDelete = (id: number) => { if (window.confirm('¿Eliminar este recordatorio?')) deleteMutation.mutate(id); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = {
      title, description: description || undefined,
      reminder_date: new Date(reminderDate).toISOString(),
      is_recurring: isRecurring,
      recurrence_rule: isRecurring ? recurrenceRule || undefined : undefined,
      user_id: userId ? parseInt(userId, 10) : undefined
    };
    if (editingReminder) updateMutation.mutate({ id: editingReminder.id, payload });
    else createMutation.mutate(payload);
  };

  const columns = [
    { id: 'id', label: 'ID', align: 'center' as const },
    { id: 'user', label: 'Usuario', render: (row: Reminder) => (row.user as any)?.username || 'Sistema' },
    { id: 'title', label: 'Título', render: (row: Reminder) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.title}</Typography> },
    { id: 'description', label: 'Descripción', render: (row: Reminder) => <Typography variant="body2" noWrap sx={{ maxWidth: 200, color: 'grey.400' }}>{row.description || '—'}</Typography> },
    { id: 'reminder_date', label: 'Fecha Recordatorio', render: (row: Reminder) => format(new Date(row.reminder_date), 'dd/MM/yyyy HH:mm') },
    { id: 'is_recurring', label: 'Recurrente', render: (row: Reminder) => <StatusBadge status={row.is_recurring} /> },
    { id: 'recurrence_rule', label: 'Regla Recurrencia', render: (row: Reminder) => <Typography variant="body2" noWrap sx={{ maxWidth: 150, color: 'grey.400', fontFamily: 'monospace', fontSize: '0.75rem' }}>{row.recurrence_rule || '—'}</Typography> },
    { id: 'is_active', label: 'Activo', render: (row: Reminder) => <StatusBadge status={row.is_active} /> },
    {
      id: 'actions', label: 'Acciones', align: 'center' as const,
      render: (row: Reminder) => (
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
          <IconButton size="small" onClick={() => handleOpenEdit(row)} sx={{ color: '#6366f1' }}><Edit fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => handleDelete(row.id)} sx={{ color: '#ef4444' }}><Delete fontSize="small" /></IconButton>
        </Stack>
      )
    }
  ];

  const fieldSx = {
    '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
    '& .MuiInputLabel-root': { color: 'grey.500' },
  };

  const selectSx = {
    color: 'white',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
    '& .MuiSvgIcon-root': { color: 'grey.500' },
  };

  return (
    <Box sx={{ color: 'white' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>Recordatorios y Alertas</Typography>
          <Typography variant="body2" color="grey.400">Gestiona avisos programados de la plataforma para usuarios o el sistema.</Typography>
        </Box>
        <Button
          variant="contained" startIcon={<Add />} onClick={handleOpenCreate}
          sx={{ py: 1.2, px: 2.5, fontWeight: 700, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)', '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' } }}
        >
          Nuevo Recordatorio
        </Button>
      </Box>

      <DataTable columns={columns} data={reminders} loading={isLoading} />

      <Dialog open={open} onClose={handleClose} slotProps={{ paper: { sx: { bgcolor: '#1e293b', color: 'white', borderRadius: 3, border: '1px solid rgba(255, 255, 255, 0.08)', width: '100%', maxWidth: 500 } } }}>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800, display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Notifications sx={{ color: 'primary.light' }} />
            {editingReminder ? 'Editar Recordatorio' : 'Crear Recordatorio'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              {error && <Alert severity="error" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</Alert>}
              <TextField required fullWidth label="Título del Recordatorio" value={title} onChange={(e) => setTitle(e.target.value)} sx={fieldSx} />
              <TextField fullWidth multiline rows={3} label="Descripción (Opcional)" value={description} onChange={(e) => setDescription(e.target.value)} sx={fieldSx} />
              <TextField required fullWidth label="Fecha y Hora" type="datetime-local" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={fieldSx} />
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'grey.500' }}>Asignar a Usuario (Opcional)</InputLabel>
                <Select value={userId} label="Asignar a Usuario (Opcional)" onChange={(e) => setUserId(e.target.value)} sx={selectSx}>
                  <MenuItem value="">Sistema / Global</MenuItem>
                  {users.map((u) => <MenuItem key={u.id} value={String(u.id)}>@{u.username}</MenuItem>)}
                </Select>
              </FormControl>
              <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 6 }}>
                  <FormControlLabel
                    label={<Typography variant="body2" color="grey.400">¿Es Recurrente?</Typography>}
                    control={<Switch checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} color="primary" />}
                  />
                </Grid>
                {isRecurring && (
                  <Grid size={{ xs: 6 }}>
                    <TextField fullWidth label="Regla de Recurrencia (cron)" placeholder="0 9 * * 1" value={recurrenceRule} onChange={(e) => setRecurrenceRule(e.target.value)} sx={fieldSx} />
                  </Grid>
                )}
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose} sx={{ color: 'grey.400' }}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending} sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' } }}>
              {editingReminder ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
