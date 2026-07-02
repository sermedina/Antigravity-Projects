import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Title, Paragraph, Button, useTheme, ActivityIndicator, Portal, Dialog, ProgressBar, Divider } from 'react-native-paper';
import { useQuery, useMutation } from '@tanstack/react-query';
import { contentService } from '../../services/content.service';
import { EducationalContent } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function EducationScreen() {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedContent, setSelectedContent] = useState<EducationalContent | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  // Queries
  const { data: contents, refetch: refetchContents, isLoading: loadingContents } = useQuery({
    queryKey: ['contents'],
    queryFn: () => contentService.getContents(),
  });

  const { data: progressList, refetch: refetchProgress, isLoading: loadingProgress } = useQuery({
    queryKey: ['contentProgress'],
    queryFn: () => contentService.getProgress(),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchContents(), refetchProgress()]);
    setRefreshing(false);
  };

  // Mutator to update progress
  const updateProgressMutation = useMutation({
    mutationFn: ({ contentId, progress }: { contentId: number; progress: number }) =>
      contentService.updateProgress(contentId, progress),
    onSuccess: () => {
      refetchProgress();
    },
  });

  const progressMap = useMemo(() => {
    const map: { [id: number]: number } = {};
    if (progressList) {
      progressList.forEach((p) => {
        map[p.content_id] = p.progress_percentage;
      });
    }
    return map;
  }, [progressList]);

  const handleOpenContent = (c: EducationalContent) => {
    setSelectedContent(c);
    setDetailVisible(true);

    // Si no ha iniciado el progreso, marcarlo como en progreso (10%)
    const currentProgress = progressMap[c.id] || 0;
    if (currentProgress < 10) {
      updateProgressMutation.mutate({ contentId: c.id, progress: 10 });
    }
  };

  const handleCompleteContent = (c: EducationalContent) => {
    updateProgressMutation.mutate({ contentId: c.id, progress: 100 });
    setDetailVisible(false);
  };

  const isLoading = loadingContents || loadingProgress;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isLoading ? (
          <ActivityIndicator style={styles.loader} size="large" />
        ) : contents && contents.length > 0 ? (
          contents.map((item) => {
            const progress = progressMap[item.id] || 0;
            return (
              <Card key={item.id} style={styles.card} onPress={() => handleOpenContent(item)}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.row}>
                    <MaterialCommunityIcons
                      name={
                        item.type === 'ARTICLE'
                          ? 'newspaper-variant-outline'
                          : item.type === 'VIDEO'
                          ? 'video-outline'
                          : 'school-outline'
                      }
                      size={32}
                      color={theme.colors.primary}
                    />
                    <View style={styles.flex1}>
                      <Text style={styles.titleText}>{item.title}</Text>
                      <Text style={styles.metaText}>
                        {item.type === 'ARTICLE' ? 'Artículo' : item.type === 'VIDEO' ? 'Video' : 'Curso'} •{' '}
                        {item.estimated_read_time || 5} min de lectura
                      </Text>
                    </View>
                  </View>
                  <ProgressBar progress={progress / 100} color={progress === 100 ? '#10B981' : theme.colors.primary} style={styles.progress} />
                  <Text style={styles.progressText}>
                    {progress === 100 ? 'Completado' : progress > 0 ? `En progreso (${progress}%)` : 'No iniciado'}
                  </Text>
                </Card.Content>
              </Card>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="book-open-page-variant" size={64} color={theme.colors.secondary} />
            <Text style={styles.emptyText}>No hay contenido educativo disponible en este momento.</Text>
          </View>
        )}
      </ScrollView>

      {/* DETAIL DIALOG */}
      <Portal>
        <Dialog visible={detailVisible} onDismiss={() => setDetailVisible(false)}>
          <Dialog.Title>{selectedContent?.title}</Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView contentContainerStyle={styles.dialogScrollContent}>
              <Text style={styles.bodyType}>
                {selectedContent?.type === 'ARTICLE' ? 'Artículo Educativo' : selectedContent?.type === 'VIDEO' ? 'Video Instructivo' : 'Curso Financiero'}
              </Text>
              <Divider style={styles.divider} />
              <Paragraph style={styles.bodyText}>
                {selectedContent?.body || 'Cargando contenido...'}
              </Paragraph>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDetailVisible(false)}>Cerrar</Button>
            {selectedContent && (progressMap[selectedContent.id] || 0) < 100 && (
              <Button mode="contained" onPress={() => handleCompleteContent(selectedContent)}>
                Marcar como Leído
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  loader: {
    marginTop: 40,
  },
  card: {
    elevation: 2,
    borderRadius: 12,
  },
  cardContent: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  metaText: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 2,
  },
  progress: {
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  progressText: {
    fontSize: 11,
    opacity: 0.6,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
    paddingHorizontal: 32,
  },
  scrollArea: {
    maxHeight: 400,
    paddingHorizontal: 0,
  },
  dialogScrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  bodyType: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  divider: {
    marginVertical: 4,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
