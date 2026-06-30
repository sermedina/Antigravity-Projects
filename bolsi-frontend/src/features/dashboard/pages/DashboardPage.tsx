import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Paper, CircularProgress, Button, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import { People, AccountBalanceWallet, VerifiedUser, Flag, Category, Notifications, ErrorOutlined } from '@mui/icons-material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import CardMetric from '@/components/common/CardMetric';
import api from '@/lib/api';
import type { User, Transaction, PaginatedResponse } from '@/types';
import { format, subMonths } from 'date-fns';

export default function DashboardPage() {
  const { data: usersData, isLoading: usersLoading } = useQuery<PaginatedResponse<User>>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/users?limit=1000');
      return res.data;
    }
  });

  const { data: txsData, isLoading: txsLoading } = useQuery<Transaction[]>({
    queryKey: ['admin-transactions'],
    queryFn: async () => {
      const res = await api.get('/transactions/admin');
      return res.data;
    }
  });

  const isLoading = usersLoading || txsLoading;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const users = usersData?.data || [];
  const transactions = txsData || [];

  const totalUsers = users.length;
  const naturalUsers = users.filter(u => u.user_type === 'NATURAL').length;
  const juridicoUsers = users.filter(u => u.user_type === 'JURIDICO').length;
  const verifiedUsersCount = users.filter(u => u.is_email_verified && u.is_phone_verified).length;
  const verificationRate = totalUsers > 0 ? ((verifiedUsersCount / totalUsers) * 100).toFixed(1) : '0';

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthTxs = transactions.filter(t => {
    const d = new Date(t.transaction_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthlyVolume = currentMonthTxs.reduce((sum, t) => sum + Number(t.amount), 0);

  const categorySummary: { [key: string]: number } = {};
  transactions
    .filter(t => t.type === 'EXPENSE')
    .forEach(t => {
      const catName = t.category?.name || 'Otros';
      categorySummary[catName] = (categorySummary[catName] || 0) + Number(t.amount);
    });

  const pieData = Object.keys(categorySummary).map(name => ({
    name,
    value: parseFloat(categorySummary[name].toFixed(2))
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#e11d48', '#3b82f6', '#10b981'];

  const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i));
  const growthData = months.map(m => {
    const label = format(m, 'MMM yy');
    const count = users.filter(u => {
      const d = new Date(u.created_at);
      return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
    }).length;
    return { name: label, Usuarios: count };
  });

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0);
  const barData = [
    { name: 'Balance Global', Ingresos: parseFloat(totalIncome.toFixed(2)), Egresos: parseFloat(totalExpense.toFixed(2)) }
  ];

  return (
    <Box sx={{ color: 'white' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>Dashboard Global</Typography>
        <Typography variant="body2" color="grey.400">
          Vista general del comportamiento financiero y crecimiento de la plataforma.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CardMetric title="Usuarios Registrados" value={totalUsers} icon={<People />} trend={`${naturalUsers} Nat / ${juridicoUsers} Jur`} trendDirection="up" color="#6366f1" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CardMetric title="Volumen del Mes" value={`$${monthlyVolume.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<AccountBalanceWallet />} trend="Transacciones totales" trendDirection="up" color="#10b981" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CardMetric title="Tasa de Verificación" value={`${verificationRate}%`} icon={<VerifiedUser />} trend="Email & Teléfono" trendDirection="up" color="#8b5cf6" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CardMetric title="Transacciones Totales" value={transactions.length} icon={<Flag />} trend="Historial acumulado" trendDirection="up" color="#ec4899" />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Evolución de Nuevos Usuarios (Últimos 6 meses)</Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white' }} />
                  <Area type="monotone" dataKey="Usuarios" stroke="#6366f1" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Distribución de Egresos</Typography>
            <Box sx={{ width: '100%', height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              {pieData.length === 0 ? (
                <Stack spacing={1} sx={{ alignItems: 'center' }}>
                  <ErrorOutlined sx={{ fontSize: 40, color: 'grey.500' }} />
                  <Typography variant="body2" color="grey.500">Sin egresos registrados</Typography>
                </Stack>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name }) => name}>
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Balance General</Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white' }} />
                  <Legend />
                  <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Egresos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Centro de Acciones Rápidas</Typography>
            <Stack spacing={2}>
              <Button variant="contained" startIcon={<Category />} href="/categories" sx={{ py: 1.5, fontWeight: 700, bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}>
                Gestionar Categorías Globales
              </Button>
              <Button variant="outlined" startIcon={<Notifications />} href="/reminders" sx={{ py: 1.5, fontWeight: 700, color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.03)' } }}>
                Configurar Alertas y Recordatorios
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
