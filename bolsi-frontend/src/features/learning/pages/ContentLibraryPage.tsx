import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, Button, Paper, Stack, IconButton, Tab, Tabs } from '@mui/material';
import { Add, Edit, Delete, MenuBook, Movie, Assignment, Book } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import api from '@/lib/api';
import type { EducationalContent } from '@/types';
import { format } from 'date-fns';

export default function ContentLibraryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL');

  // Fetch educational content
  const { data: contents = [], isLoading } = useQuery<EducationalContent[]>({
    queryKey: ['learning-contents-list'],
    queryFn: async () => {
      const res = await api.get('/educational-contents');
      return res.data;
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/educational-contents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-contents-list'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || err.message || 'Error al eliminar el contenido');
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este contenido educativo?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredContents = contents.filter(c => {
    if (activeTab === 'ALL') return true;
    return c.status === activeTab;
  });

  const columns = [
    { id: 'id', label: 'ID', align: 'center' as const },
    {
      id: 'icon',
      label: 'Tipo',
      render: (row: EducationalContent) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.03)' }}>
          {row.type === 'ARTICLE' && <Book sx={{ color: '#6366f1', fontSize: 18 }} />}
          {row.type === 'VIDEO' && <Movie sx={{ color: '#ec4899', fontSize: 18 }} />}
          {row.type === 'COURSE' && <Assignment sx={{ color: '#10b981', fontSize: 18 }} />}
        </Box>
      )
    },
    { id: 'title', label: 'Título' },
    {
      id: 'estimated_read_time',
      label: 'Tiempo Est.',
      render: (row: EducationalContent) => (
        <Typography variant="body2">{row.estimated_read_time ? `${row.estimated_read_time} min` : 'N/A'}</Typography>
      )
    },
    {
      id: 'status',
      label: 'Estado',
      render: (row: EducationalContent) => <StatusBadge status={row.status} />
    },
    {
      id: 'created_at',
      label: 'Fecha Creación',
      render: (row: EducationalContent) => format(new Date(row.created_at), 'dd/MM/yyyy')
    },
    {
      id: 'actions',
      label: 'Acciones',
      align: 'center' as const,
      render: (row: EducationalContent) => (
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
          <IconButton
            size="small"
            onClick={() => navigate(`/content/edit/${row.id}`)}
            sx={{ color: '#6366f1' }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(row.id)}
            sx={{ color: '#ef4444' }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      )
    }
  ];

  return (
    <Box sx={{ color: 'white' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
            Biblioteca CMS
          </Typography>
          <Typography variant="body2" color="grey.400">
            Administra los cursos, artículos y videos de educación financiera distribuidos a la comunidad.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/content/new')}
          sx={{
            py: 1.2,
            px: 2.5,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            },
          }}
        >
          Nuevo Contenido
        </Button>
      </Box>

      {/* Tabs Filter */}
      <Paper sx={{ bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', mb: 3, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            '& .MuiTab-root': { color: 'grey.500', fontWeight: 600 },
            '& .Mui-selected': { color: 'white !important' },
            '& .MuiTabs-indicator': { bgcolor: '#6366f1' }
          }}
        >
          <Tab label="Todos" value="ALL" />
          <Tab label="Borradores" value="DRAFT" />
          <Tab label="Publicados" value="PUBLISHED" />
        </Tabs>
      </Paper>

      {/* Contents Table */}
      <DataTable
        columns={columns}
        data={filteredContents}
        loading={isLoading}
      />
    </Box>
  );
}
