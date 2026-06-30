import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, TextField, FormControl,
  InputLabel, Select, MenuItem, Button, Stack, Alert, ButtonGroup
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { ArrowBack, Save, FormatBold, FormatItalic, FormatListBulleted, Code } from '@mui/icons-material';
import api from '@/lib/api';
import type { ContentPayload, EducationalContent } from '@/types';

export default function ContentFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'ARTICLE' | 'VIDEO' | 'COURSE'>('ARTICLE');
  const [body, setBody] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [estimatedReadTime, setEstimatedReadTime] = useState('5');
  const [error, setError] = useState<string | null>(null);

  const { data: content, isLoading } = useQuery<EducationalContent>({
    queryKey: ['learning-content-edit', id],
    queryFn: async () => {
      const res = await api.get(`/educational-contents/${id}`);
      return res.data;
    },
    enabled: isEdit
  });

  useEffect(() => {
    if (content) {
      setTitle(content.title);
      setType(content.type);
      setBody(content.body || '');
      setMediaUrl(content.media_url || '');
      setStatus(content.status);
      setEstimatedReadTime(String(content.estimated_read_time || ''));
    }
  }, [content]);

  const createMutation = useMutation({
    mutationFn: async (payload: ContentPayload) => { await api.post('/educational-contents', payload); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['learning-contents-list'] }); navigate('/content'); },
    onError: (err: any) => { setError(err.response?.data?.error || err.message || 'Error al guardar'); }
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: ContentPayload) => { await api.put(`/educational-contents/${id}`, payload); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['learning-contents-list'] }); navigate('/content'); },
    onError: (err: any) => { setError(err.response?.data?.error || err.message || 'Error al actualizar'); }
  });

  const handleInsertHtml = (tag: string) => {
    let startTag = `<${tag}>`;
    let endTag = `</${tag}>`;
    if (tag === 'bullet') { startTag = '<ul>\n  <li>'; endTag = '</li>\n</ul>'; }
    const textarea = document.getElementById('body-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const selected = text.substring(start, end);
      setBody(text.substring(0, start) + startTag + selected + endTag + text.substring(end));
      setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + startTag.length, start + startTag.length + selected.length); }, 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (title.length < 10) { setError('El título debe tener al menos 10 caracteres'); return; }
    if (type === 'ARTICLE' && body.length < 50) { setError('El cuerpo del artículo debe tener al menos 50 caracteres'); return; }

    const payload: ContentPayload = {
      title, type,
      body: type === 'ARTICLE' ? body : undefined,
      media_url: mediaUrl || undefined,
      status,
      estimated_read_time: estimatedReadTime ? parseInt(estimatedReadTime, 10) : undefined
    };

    if (isEdit) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  if (isEdit && isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><Typography color="grey.400">Cargando contenido educativo...</Typography></Box>;
  }

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
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button onClick={() => navigate('/content')} startIcon={<ArrowBack />} sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}>Volver</Button>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>{isEdit ? 'Editar Contenido Educativo' : 'Crear Nuevo Contenido'}</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white' }}>
              <Stack spacing={3}>
                <TextField required fullWidth label="Título del Material" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Guía para construir tu fondo de emergencias paso a paso" sx={fieldSx} />
                {type === 'ARTICLE' && (
                  <Box>
                    <Typography variant="body2" color="grey.400" sx={{ mb: 1, fontWeight: 600 }}>Cuerpo del Artículo (HTML)</Typography>
                    <Paper sx={{ bgcolor: '#0f172a', p: 1, mb: 1, display: 'flex', gap: 1, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <ButtonGroup size="small" sx={{ '& button': { color: 'grey.400', borderColor: 'rgba(255,255,255,0.1)' } }}>
                        <Button onClick={() => handleInsertHtml('strong')} title="Negrita"><FormatBold fontSize="small" /></Button>
                        <Button onClick={() => handleInsertHtml('em')} title="Cursiva"><FormatItalic fontSize="small" /></Button>
                        <Button onClick={() => handleInsertHtml('bullet')} title="Lista"><FormatListBulleted fontSize="small" /></Button>
                        <Button onClick={() => handleInsertHtml('pre')} title="Código"><Code fontSize="small" /></Button>
                      </ButtonGroup>
                    </Paper>
                    <TextField id="body-textarea" required fullWidth multiline rows={14} placeholder="Escribe el artículo financiero en formato HTML aquí..." value={body} onChange={(e) => setBody(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { color: 'white', fontFamily: 'monospace', fontSize: '0.9rem', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }} />
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white' }}>
              <Stack spacing={3}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Configuración</Typography>
                <FormControl fullWidth required>
                  <InputLabel sx={{ color: 'grey.500' }}>Tipo de Contenido</InputLabel>
                  <Select value={type} label="Tipo de Contenido" onChange={(e) => setType(e.target.value as any)} sx={selectSx}>
                    <MenuItem value="ARTICLE">Artículo</MenuItem>
                    <MenuItem value="VIDEO">Video</MenuItem>
                    <MenuItem value="COURSE">Curso</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth required>
                  <InputLabel sx={{ color: 'grey.500' }}>Estado de Publicación</InputLabel>
                  <Select value={status} label="Estado de Publicación" onChange={(e) => setStatus(e.target.value as any)} sx={selectSx}>
                    <MenuItem value="DRAFT">Borrador</MenuItem>
                    <MenuItem value="PUBLISHED">Publicado</MenuItem>
                  </Select>
                </FormControl>
                <TextField fullWidth label="Tiempo Estimado (Minutos)" type="number" value={estimatedReadTime} onChange={(e) => setEstimatedReadTime(e.target.value)} sx={fieldSx} />
                <TextField fullWidth label="Media URL" placeholder="https://youtube.com/embed/..." value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} sx={fieldSx} />
                <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending} startIcon={<Save />} sx={{ py: 1.5, fontWeight: 700, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)', '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' } }}>
                  {isEdit ? 'Actualizar Contenido' : 'Crear Contenido'}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
