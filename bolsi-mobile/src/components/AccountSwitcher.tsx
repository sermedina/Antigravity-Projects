import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Portal, Dialog, RadioButton, Button, useTheme, Avatar } from 'react-native-paper';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/user.service';
import { SharedAccess } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const AccountSwitcher = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { user, activeUserId, activeUserEmail, setActiveContext } = useAuth();
  const [dialogVisible, setDialogVisible] = useState(false);

  const { data: sharedAccesses } = useQuery({
    queryKey: ['sharedAccesses'],
    queryFn: () => userService.getSharedAccesses(),
    enabled: !!user,
  });

  if (!user || !sharedAccesses || sharedAccesses.received.length === 0) {
    return null; // Don't show anything if there are no shared accounts
  }

  const handleSelectAccount = (targetUserId: number | null, level: 'OWNER' | 'READ_ONLY' | 'READ_WRITE', email: string | null) => {
    setActiveContext(targetUserId, level, email);
    setDialogVisible(false);

    // Invalidate queries so that TanStack Query fetches the new data
    queryClient.invalidateQueries();
  };

  const isSharedActive = activeUserId !== null;

  return (
    <View style={styles.container}>
      <Card style={[styles.card, isSharedActive && { borderColor: theme.colors.primary, borderWidth: 1 }]} onPress={() => setDialogVisible(true)}>
        <Card.Content style={styles.cardContent}>
          <Avatar.Icon
            size={36}
            icon={isSharedActive ? "account-coworker" : "account"}
            style={[styles.avatar, { backgroundColor: isSharedActive ? theme.colors.primaryContainer : theme.colors.surfaceVariant }]}
            color={isSharedActive ? theme.colors.primary : theme.colors.onSurfaceVariant}
          />
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {isSharedActive ? "Visualizando cuenta de:" : "Visualizando mi cuenta"}
            </Text>
            <Text style={styles.subtitle}>
              {isSharedActive ? activeUserEmail : user.email}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-down" size={24} color={theme.colors.onSurface} />
        </Card.Content>
      </Card>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Cambiar de Cuenta Activa</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              value={activeUserId?.toString() || 'me'}
              onValueChange={(val) => {
                if (val === 'me') {
                  handleSelectAccount(null, 'OWNER', null);
                } else {
                  const targetAcc = sharedAccesses.received.find(acc => acc.owner.id?.toString() === val);
                  if (targetAcc) {
                    handleSelectAccount(
                      targetAcc.owner.id ?? 0,
                      targetAcc.access_level as 'READ_ONLY' | 'READ_WRITE',
                      targetAcc.owner.email ?? ""
                    );
                  }
                }
              }}
            >
              <View style={styles.radioRow}>
                <RadioButton value="me" />
                <TouchableOpacity onPress={() => handleSelectAccount(null, 'OWNER', null)}>
                  <Text style={styles.radioLabel}>Mi Cuenta (Propietario)</Text>
                </TouchableOpacity>
              </View>

              {sharedAccesses.received.map((acc: SharedAccess) => (
                <View key={acc.id} style={styles.radioRow}>
                  <RadioButton value={acc.owner.id?.toString() || `shared-${acc.id}`} />
                  <TouchableOpacity
                    onPress={() =>
                      handleSelectAccount(
                        acc.owner.id ?? 0,
                        acc.access_level as 'READ_ONLY' | 'READ_WRITE',
                        acc.owner.email ?? ""
                      )
                    }
                  >
                    <View>
                      <Text style={styles.radioLabel}>{acc.owner.email}</Text>
                      <Text style={styles.radioSub}>
                        Permiso: {acc.access_level === 'READ_ONLY' ? 'Solo Lectura' : 'Lectura/Escritura'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancelar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    elevation: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  avatar: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    opacity: 0.7,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  radioSub: {
    fontSize: 12,
    marginLeft: 8,
    opacity: 0.6,
  },
});
