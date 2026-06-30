import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Paper, CircularProgress, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import { MenuBook, Star, Schedule, ErrorOutlined, School } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CardMetric from '@/components/common/CardMetric';
import api from '@/lib/api';
import type { EducationalContent, UserContentProgress } from '@/types';

export default function ContentDashboardPage() {
  const { data: contentData, isLoading: contentLoading } = useQuery<EducationalContent[]>({
    queryKey: ['admin-educational-content'],
    queryFn: async () => {
      const res = await api.get('/educational-contents');
      return res.data;
    }
  });

  const { data: progressData, isLoading: progressLoading } = useQuery<UserContentProgress[]>({
    queryKey: ['admin-global-progress'],
    queryFn: async () => {
      const res = await api.get('/educational-contents/progress/global');
      return res.data;
    }
  });

  const isLoading = contentLoading || progressLoading;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const contents = contentData || [];
  const progressList = progressData || [];

  const totalArticles = contents.length;
  const completedReadings = progressList.filter(p => Number(p.progress_percentage) === 100).length;

  const readContentsIds = progressList.map(p => p.content?.id);
  const readContents = contents.filter(c => readContentsIds.includes(c.id));
  const totalEstimatedTime = readContents.reduce((sum, c) => sum + (c.estimated_read_time || 0), 0);
  const avgReadTime = readContents.length > 0 ? (totalEstimatedTime / readContents.length).toFixed(1) : '0';

  const completionsMap: { [key: number]: { title: string; count: number } } = {};
  progressList.filter(p => Number(p.progress_percentage) === 100).forEach(p => {
    const id = p.content?.id;
    const title = p.content?.title || 'Contenido Desconocido';
    if (id) {
      if (!completionsMap[id]) completionsMap[id] = { title, count: 0 };
      completionsMap[id].count += 1;
    }
  });

  let starContent = 'Ninguno';
  let maxCompletions = 0;
  Object.keys(completionsMap).forEach(idKey => {
    const item = completionsMap[Number(idKey)];
    if (item.count > maxCompletions) {
      maxCompletions = item.count;
      starContent = item.title;
    }
  });

  const viewsMap: { [key: string]: number } = {};
  progressList.forEach(p => {
    const title = p.content?.title || 'Otros';
    viewsMap[title] = (viewsMap[title] || 0) + 1;
  });

  const topContentData = Object.keys(viewsMap)
    .map(title => ({ name: title.length > 25 ? title.substring(0, 25) + '...' : title, Lectores: viewsMap[title] }))
    .sort((a, b) => b.Lectores - a.Lectores)
    .slice(0, 5);

  const started = progressList.length;
  const completed = completedReadings;
  const dropouts = started - completed;

  const funnelData = [
    { name: 'Iniciados', Cantidad: started },
    { name: 'Completados', Cantidad: completed },
    { name: 'En curso', Cantidad: dropouts }
  ];

  return (
    <Box sx={{ color: 'white' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>Dashboard de Contenidos</Typography>
        <Typography variant="body2" color="grey.400">
          Supervisión de interacciones, lecturas y efectividad del material educativo financiero.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CardMetric title="Material Educativo Total" value={totalArticles} icon={<MenuBook />} trend="Cursos y Artículos" trendDirection="up" color="#3b82f6" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CardMetric title="Lecturas Completadas" value={completedReadings} icon={<School />} trend="Progreso al 100%" trendDirection="up" color="#10b981" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CardMetric title="Tiempo Promedio Consumo" value={`${avgReadTime} min`} icon={<Schedule />} trend="Estimado por lectura" trendDirection="up" color="#8b5cf6" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CardMetric title="Contenido Estrella" value={maxCompletions > 0 ? `${maxCompletions} comp.` : '0'} icon={<Star />} trend={starContent.length > 20 ? starContent.substring(0, 20) + '...' : starContent} trendDirection="up" color="#f59e0b" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Top 5 Contenidos Más Interactivos</Typography>
            <Box sx={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {topContentData.length === 0 ? (
                <Stack spacing={1} sx={{ alignItems: 'center' }}>
                  <ErrorOutlined sx={{ fontSize: 40, color: 'grey.500' }} />
                  <Typography variant="body2" color="grey.500">Sin lecturas registradas</Typography>
                </Stack>
              ) : (
                <ResponsiveContainer>
                  <BarChart data={topContentData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white' }} />
                    <Bar dataKey="Lectores" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Conversión de Lecturas y Progreso</Typography>
            <Box sx={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {started === 0 ? (
                <Stack spacing={1} sx={{ alignItems: 'center' }}>
                  <ErrorOutlined sx={{ fontSize: 40, color: 'grey.500' }} />
                  <Typography variant="body2" color="grey.500">Sin progreso iniciado por usuarios</Typography>
                </Stack>
              ) : (
                <ResponsiveContainer>
                  <BarChart data={funnelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white' }} />
                    <Bar dataKey="Cantidad" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
