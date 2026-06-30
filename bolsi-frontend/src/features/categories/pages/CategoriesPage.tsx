import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Button, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, IconButton, Alert, Stack
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Add, Edit, Delete, Category as CategoryIcon } from '@mui/icons-material';
import StatusBadge from '@/components/common/StatusBadge';
import DataTable from '@/components/common/DataTable';
import api from '@/lib/api';
import type { Category, CategoryPayload } from '@/types';

export default function CategoriesPage() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE' | 'DOA'>('EXPENSE');
  const [iconUrl, setIconUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories-list'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CategoryPayload) => { await api.post('/categories', payload); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories-list'] }); handleClose(); },
    onError: (err: any) => { setError(err.response?.data?.error || err.message || 'Error al guardar'); }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: CategoryPayload }) => { await api.put(`/categories/${id}`, payload); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories-list'] }); handleClose(); },
    onError: (err: any) => { setError(err.response?.data?.error || err.message || 'Error al actualizar'); }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await api.delete(`/categories/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories-list'] }); },
    onError: (err: any) => { alert(err.response?.data?.error || err.message || 'Error al eliminar'); }
  });

  const handleOpenCreate = () => { setEditingCategory(null); setName(''); setType('EXPENSE'); setIconUrl(''); setError(null); setOpen(true); };
  const handleOpenEdit = (category: Category) => { setEditingCategory(category); setName(category.name); setType(category.type); setIconUrl(category.icon_url || ''); setError(null); setOpen(true); };
  const handleClose = () => { setOpen(false); setEditingCategory(null); };
  const handleDelete = (id: number) => { if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) deleteMutation.mutate(id); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload: CategoryPayload = { name, type, icon_url: iconUrl || undefined };
    if (editingCategory) updateMutation.mutate({ id: editingCategory.id, payload });
    else createMutation.mutate(payload);
  };

  const columns = [
    { id: 'id', label: 'ID', align: 'center' as const },
    {
      id: 'icon', label: 'Icono',
      render: (row: Category) => (
        <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {row.icon_url ? <Box component="img" src={row.icon_url} sx={{ width: 20, height: 20 }} /> : <CategoryIcon sx={{ fontSize: 18, color: 'grey.500' }} />}
        </Box>
      )
    },
    { id: 'name', label: 'Nombre' },
    {
      id: 'type', label: 'Tipo Categoría',
      render: (row: Category) => <StatusBadge status={row.type} type="categoryType" />
    },
    {
      id: 'actions', label: 'Acciones', align: 'center' as const,
      render: (row: Category) => (
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
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Categorías Globales</Typography>
          <Typography variant="body2" color="grey.400">
            Administra los tipos de transacciones (Ingresos, Egresos, Distribuciones DOA) disponibles en la app.
          </Typography>
        </Box>
        <Button
          variant="contained" startIcon={<Add />} onClick={handleOpenCreate}
          sx={{ py: 1.2, px: 2.5, fontWeight: 700, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)', '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' } }}
        >
          Nueva Categoría
        </Button>
      </Box>

      <DataTable columns={columns} data={categories} loading={isLoading} />

      <Dialog open={open} onClose={handleClose} slotProps={{ paper: { sx: { bgcolor: '#1e293b', color: 'white', borderRadius: 3, border: '1px solid rgba(255, 255, 255, 0.08)', width: '100%', maxWidth: 450 } } }}>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>{editingCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              {error && <Alert severity="error" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</Alert>}
              <TextField required fullWidth label="Nombre de Categoría" value={name} onChange={(e) => setName(e.target.value)} sx={fieldSx} />
              <FormControl fullWidth required>
                <InputLabel sx={{ color: 'grey.500' }}>Tipo</InputLabel>
                <Select value={type} label="Tipo" onChange={(e) => setType(e.target.value as any)} sx={selectSx}>
                  <MenuItem value="INCOME">Ingreso (INCOME)</MenuItem>
                  <MenuItem value="EXPENSE">Egreso (EXPENSE)</MenuItem>
                  <MenuItem value="DOA">Distribución Operativa (DOA)</MenuItem>
                </Select>
              </FormControl>
              <TextField fullWidth label="Icono URL (Opcional)" placeholder="https://ejemplo.com/icono.svg" value={iconUrl} onChange={(e) => setIconUrl(e.target.value)} sx={fieldSx} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose} sx={{ color: 'grey.400' }}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending} sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' } }}>
              {editingCategory ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
