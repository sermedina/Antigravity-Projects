import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Visibility } from '@mui/icons-material';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import api from '@/lib/api';
import type { Transaction } from '@/types';
import { format } from 'date-fns';

export default function TransactionsAuditPage() {
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [selectedDoa, setSelectedDoa] = useState<any[] | null>(null);

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['admin-transactions-list'],
    queryFn: async () => {
      const res = await api.get('/transactions/admin');
      return res.data;
    }
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['categories-list'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    }
  });

  const filteredTxs = transactions.filter(t => {
    if (type && t.type !== type) return false;
    if (category && String(t.category?.id) !== category) return false;
    if (minAmount && Number(t.amount) < Number(minAmount)) return false;
    if (maxAmount && Number(t.amount) > Number(maxAmount)) return false;
    return true;
  });

  const selectSx = {
    color: 'white',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
    '& .MuiSvgIcon-root': { color: 'grey.500' },
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
    '& .MuiInputLabel-root': { color: 'grey.500' },
  };

  const columns = [
    { id: 'id', label: 'ID Transacción', render: (row: Transaction) => `#TX-${row.id}` },
    { id: 'user', label: 'Usuario', render: (row: Transaction) => `USR-${row.user?.id || 'ANON'}` },
    {
      id: 'account', label: 'Cuenta Origen',
      render: (row: Transaction) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.account?.name || 'N/A'} ({row.account?.type})</Typography>
    },
    { id: 'category', label: 'Categoría', render: (row: Transaction) => row.category?.name || 'N/A' },
    {
      id: 'amount', label: 'Monto',
      render: (row: Transaction) => {
        const isIncome = row.type === 'INCOME';
        return <Typography variant="body2" color={isIncome ? '#4ade80' : '#fca5a5'} sx={{ fontWeight: 800 }}>{isIncome ? '+' : '-'}${Number(row.amount).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</Typography>;
      }
    },
    {
      id: 'type', label: 'Tipo',
      render: (row: Transaction) => <StatusBadge status={row.type} type="transactionType" />
    },
    { id: 'transaction_date', label: 'Fecha', render: (row: Transaction) => format(new Date(row.transaction_date), 'dd/MM/yyyy') },
    {
      id: 'actions', label: 'Evidencia / DOA', align: 'center' as const,
      render: (row: Transaction) => (
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
          <Button size="small" variant="outlined" disabled={!row.payment_receipt_image} onClick={() => setSelectedReceipt(row.payment_receipt_image || null)} startIcon={<Visibility />} sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.75rem', py: 0.5 }}>Recibo</Button>
          <Button size="small" variant="outlined" disabled={!row.doa_allocations || row.doa_allocations.length === 0} onClick={() => setSelectedDoa(row.doa_allocations || [])} sx={{ borderColor: 'rgba(255,255,255,0.1)', color: '#c084fc', fontSize: '0.75rem', py: 0.5 }}>DOA</Button>
        </Stack>
      )
    }
  ];

  return (
    <Box sx={{ color: 'white' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>Auditoría Transaccional (Anónima)</Typography>
        <Typography variant="body2" color="grey.400">Supervisión de transacciones con campos de usuario enmascarados para garantizar privacidad.</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white' }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'grey.500' }}>Tipo</InputLabel>
              <Select value={type} label="Tipo" onChange={(e) => setType(e.target.value)} sx={selectSx}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="INCOME">Ingreso</MenuItem>
                <MenuItem value="EXPENSE">Egreso</MenuItem>
                <MenuItem value="DOA">DOA</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'grey.500' }}>Categoría</InputLabel>
              <Select value={category} label="Categoría" onChange={(e) => setCategory(e.target.value)} sx={selectSx}>
                <MenuItem value="">Todas</MenuItem>
                {categories.map((c: any) => <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField fullWidth label="Monto Mínimo" type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} sx={fieldSx} />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField fullWidth label="Monto Máximo" type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} sx={fieldSx} />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Button fullWidth variant="outlined" onClick={() => { setType(''); setCategory(''); setMinAmount(''); setMaxAmount(''); }} sx={{ py: 1.5, fontWeight: 700, color: 'white', borderColor: 'rgba(255, 255, 255, 0.1)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.03)' } }}>
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <DataTable columns={columns} data={filteredTxs} loading={isLoading} />

      <Dialog open={!!selectedReceipt} onClose={() => setSelectedReceipt(null)} slotProps={{ paper: { sx: { bgcolor: '#1e293b', color: 'white', borderRadius: 3, border: '1px solid rgba(255, 255, 255, 0.08)', maxWidth: 500 } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Recibo de Pago</DialogTitle>
        <DialogContent>
          {selectedReceipt && <Box component="img" src={selectedReceipt} alt="Receipt" sx={{ width: '100%', height: 'auto', borderRadius: 2, mt: 1 }} />}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedReceipt(null)} sx={{ color: 'grey.400' }}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!selectedDoa} onClose={() => setSelectedDoa(null)} slotProps={{ paper: { sx: { bgcolor: '#1e293b', color: 'white', borderRadius: 3, border: '1px solid rgba(255, 255, 255, 0.08)', width: '100%', maxWidth: 400 } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Distribución DOA</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {selectedDoa?.map((doa, i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#0f172a', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{doa.doa_type === 'TITHE' ? 'Diezmo' : doa.doa_type === 'OFFERING' ? 'Ofrenda' : 'Ahorros'}</Typography>
                <Typography variant="body2" color="#c084fc" sx={{ fontWeight: 800 }}>${Number(doa.amount).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</Typography>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedDoa(null)} sx={{ color: 'grey.400' }}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
