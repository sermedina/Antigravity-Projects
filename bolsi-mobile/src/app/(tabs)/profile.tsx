import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, FlatList, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, Card, Button, TextInput, IconButton, useTheme, ActivityIndicator, Portal, Dialog, Divider, List, Switch, HelperText, SegmentedButtons } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { userService } from '../../services/user.service';
import { reminderService } from '../../services/reminder.service';
import { useAuth } from '../../context/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SharedAccess, Reminder } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Cargar de forma segura expo-notifications para evitar fallos en Expo Go en SDK 53
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn('expo-notifications no está disponible en este entorno de Expo Go:', e);
}

// Zod schemas for forms
const editProfileSchema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().min(1, 'El apellido es requerido'),
  phone: z.string().min(6, 'Por favor ingrese un número de teléfono válido'),
  country: z.string().min(1, 'El país es requerido'),
  city: z.string().min(1, 'La ciudad es requerida'),
});

const changePasswordSchema = z.object({
  current_password: z.string().min(6, 'La contraseña actual debe tener al menos 6 caracteres'),
  new_password: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

const sharedAccessSchema = z.object({
  guest_email: z.string().email('Por favor ingrese un correo válido'),
  access_level: z.enum(['READ_ONLY', 'READ_WRITE']),
});

const reminderSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  reminder_date: z.string().min(1, 'La fecha y hora es requerida'),
});

export default function ProfileScreen() {
  const theme = useTheme();
  const { logout, refreshProfile, isDoaPractice, toggleDoaPractice } = useAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    router.replace('/(auth)/login');
  };

  // Modal control states
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [passModalVisible, setPassModalVisible] = useState(false);
  const [accessModalVisible, setAccessModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [showReminderDatePicker, setShowReminderDatePicker] = useState(false);
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);
  const [tempReminderDate, setTempReminderDate] = useState<Date | null>(null);

  // Message states
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Queries
  const { data: profile, refetch: refetchProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
  });

  const { data: sharedAccesses, refetch: refetchAccesses } = useQuery({
    queryKey: ['sharedAccesses'],
    queryFn: () => userService.getSharedAccesses(),
  });

  const { data: reminders, refetch: refetchReminders } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => reminderService.getReminders(),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchAccesses(), refetchReminders(), refreshProfile()]);
    setRefreshing(false);
  };

  // Mutators
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => userService.updateProfile(data),
    onSuccess: () => {
      refetchProfile();
      refreshProfile();
      setProfileModalVisible(false);
    },
  });

  const changePassMutation = useMutation({
    mutationFn: ({ current, newPass }: { current: string; newPass: string }) =>
      userService.changePassword(current, newPass),
    onSuccess: () => {
      setSuccessMsg('¡Contraseña cambiada con éxito!');
      setTimeout(() => {
        setPassModalVisible(false);
        setSuccessMsg(null);
      }, 2000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || err.message || 'Error al cambiar contraseña');
    },
  });

  const createAccessMutation = useMutation({
    mutationFn: ({ email, level }: { email: string; level: 'READ_ONLY' | 'READ_WRITE' }) =>
      userService.createSharedAccess(email, level),
    onSuccess: () => {
      refetchAccesses();
      setAccessModalVisible(false);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || err.message || 'Error al delegar acceso');
    },
  });

  const deleteAccessMutation = useMutation({
    mutationFn: (id: string) => userService.deleteSharedAccess(id),
    onSuccess: () => {
      refetchAccesses();
    },
  });

  const createReminderMutation = useMutation({
    mutationFn: (data: any) => reminderService.createReminder(data),
    onSuccess: async (newReminder) => {
      refetchReminders();
      setReminderModalVisible(false);
      // Programar la notificación local
      await scheduleLocalNotification(newReminder);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || err.message || 'Error al programar recordatorio');
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: (id: number) => reminderService.deleteReminder(id),
    onSuccess: () => {
      refetchReminders();
    },
  });

  // Schedule notification locally helper
  const scheduleLocalNotification = async (r: Reminder) => {
    if (!Notifications) {
      console.warn('Notificaciones no disponibles en este entorno (Expo Go).');
      return;
    }
    try {
      const triggerDate = new Date(r.reminder_date);
      if (triggerDate > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Bolsi recordatorio: ${r.title}`,
            body: r.description || 'Tienes una alerta financiera pendiente',
            sound: true,
          },
          trigger: { type: 'date', date: triggerDate } as any,
        });
      }
    } catch (e) {
      console.warn('No se pudo programar la notificación local:', e);
    }
  };

  // Forms configuration
  const { control: profileControl, handleSubmit: handleProfileSubmit, reset: resetProfileForm } = useForm<z.infer<typeof editProfileSchema>>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { first_name: '', last_name: '', phone: '', country: '', city: '' }
  });

  const { control: passControl, handleSubmit: handlePassSubmit, reset: resetPassForm } = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: '', new_password: '' }
  });

  const { control: accessControl, handleSubmit: handleAccessSubmit, reset: resetAccessForm } = useForm<z.infer<typeof sharedAccessSchema>>({
    resolver: zodResolver(sharedAccessSchema),
    defaultValues: { guest_email: '', access_level: 'READ_ONLY' }
  });

  const { control: reminderControl, handleSubmit: handleReminderSubmit, reset: resetReminderForm } = useForm<z.infer<typeof reminderSchema>>({
    resolver: zodResolver(reminderSchema),
    defaultValues: { title: '', description: '', reminder_date: new Date(Date.now() + 600000).toISOString().split('T')[0] + 'T12:00:00' }
  });

  // Submits
  const onProfileSubmit = (data: z.infer<typeof editProfileSchema>) => {
    updateProfileMutation.mutate(data);
  };

  const onPassSubmit = (data: z.infer<typeof changePasswordSchema>) => {
    setErrorMsg(null);
    changePassMutation.mutate({ current: data.current_password, newPass: data.new_password });
  };

  const onAccessSubmit = (data: z.infer<typeof sharedAccessSchema>) => {
    setErrorMsg(null);
    createAccessMutation.mutate({ email: data.guest_email, level: data.access_level });
  };

  const onReminderSubmit = (data: z.infer<typeof reminderSchema>) => {
    setErrorMsg(null);
    let formattedDate = data.reminder_date;
    try {
      formattedDate = new Date(data.reminder_date).toISOString();
    } catch (e) {
      console.warn('Error parsing date:', e);
    }
    createReminderMutation.mutate({
      ...data,
      reminder_date: formattedDate,
      is_recurring: false,
      is_active: true,
    });
  };

  // Modal openers
  const openEditProfile = () => {
    if (profile) {
      resetProfileForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        country: profile.country || '',
        city: profile.city || '',
      });
      setProfileModalVisible(true);
    }
  };

  const openChangePass = () => {
    resetPassForm({ current_password: '', new_password: '' });
    setErrorMsg(null);
    setSuccessMsg(null);
    setPassModalVisible(true);
  };

  const openAddAccess = () => {
    resetAccessForm({ guest_email: '', access_level: 'READ_ONLY' });
    setErrorMsg(null);
    setAccessModalVisible(true);
  };

  const openAddReminder = () => {
    resetReminderForm({
      title: '',
      description: '',
      reminder_date: new Date(Date.now() + 600000).toISOString().slice(0, 16),
    });
    setErrorMsg(null);
    setReminderModalVisible(true);
  };

  if (loadingProfile && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Tarjeta de Perfil */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <View style={styles.profileHeader}>
            <MaterialCommunityIcons name="account-circle" size={80} color={theme.colors.primary} />
            <Text style={styles.profileName}>
              {profile?.first_name} {profile?.last_name}
            </Text>
            <Text style={styles.profileEmail}>{profile?.email}</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.profileDetails}>
            <Text style={styles.detailText}>• Teléfono: {profile?.phone || 'No registrado'}</Text>
            <Text style={styles.detailText}>• País/Ciudad: {profile?.country}, {profile?.city}</Text>
            <Text style={styles.detailText}>• Tipo: {profile?.user_type === 'NATURAL' ? 'Persona Natural' : 'Persona Jurídica'}</Text>
          </View>
          <Button mode="contained" onPress={openEditProfile} style={styles.editBtn}>
            Editar Perfil
          </Button>
        </Card.Content>
      </Card>

      {/* Lista de configuraciones */}
      <List.Section style={styles.settingsSection}>
        <List.Subheader>Seguridad y Privacidad</List.Subheader>
        <List.Item
          title="Cambiar Contraseña"
          left={(props) => <List.Icon {...props} icon="lock-reset" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={openChangePass}
          style={styles.settingsItem}
        />
        <List.Item
          title="Accesos Compartidos (Delegación)"
          description="Comparte cuentas con otros usuarios"
          left={(props) => <List.Icon {...props} icon="account-multiple-plus-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={openAddAccess}
          style={styles.settingsItem}
        />

        <List.Subheader>Alertas y Recordatorios</List.Subheader>
        <List.Item
          title="Nuevo Recordatorio"
          description="Recibe notificaciones locales para pagos o metas"
          left={(props) => <List.Icon {...props} icon="bell-ring-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={openAddReminder}
          style={styles.settingsItem}
        />

        <List.Subheader>Preferencias</List.Subheader>
        <List.Item
          title="¿Practica usted el Diezmo, Ofrenda y Ahorro (DOA)?"
          titleNumberOfLines={3}
          left={(props) => <List.Icon {...props} icon="hands-pray" />}
          right={() => (
            <Switch
              value={isDoaPractice}
              onValueChange={toggleDoaPractice}
            />
          )}
          style={styles.settingsItem}
        />
      </List.Section>

      {/* Recordatorios Activos */}
      {reminders && reminders.length > 0 && (
        <Card style={styles.remindersCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Recordatorios Activos</Text>
            {reminders.map((rem) => (
              <View key={rem.id} style={styles.reminderRow}>
                <View style={styles.flex1}>
                  <Text style={styles.reminderTitle}>{rem.title}</Text>
                  <Text style={styles.reminderDate}>
                    {new Date(rem.reminder_date).toLocaleString()}
                  </Text>
                </View>
                <IconButton
                  icon="delete-outline"
                  iconColor={theme.colors.error}
                  size={20}
                  onPress={() => deleteReminderMutation.mutate(rem.id)}
                />
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Delegación Historial */}
      {sharedAccesses && (sharedAccesses.granted.length > 0 || sharedAccesses.received.length > 0) && (
        <Card style={styles.sharedAccessCard}>
          <Card.Content style={styles.sharedContent}>
            <Text style={styles.sectionTitle}>Accesos Compartidos</Text>
            {sharedAccesses.granted.map((acc: SharedAccess) => (
              <View key={acc.id} style={styles.accessRow}>
                <View style={styles.flex1}>
                  <Text style={styles.accessEmail}>Otorgado a: {acc.guest.email}</Text>
                  <Text style={styles.accessSub}>Rol: {acc.access_level === 'READ_ONLY' ? 'Solo Lectura' : 'Lectura/Escritura'}</Text>
                </View>
                <IconButton
                  icon="close-circle-outline"
                  iconColor={theme.colors.error}
                  size={20}
                  onPress={() => deleteAccessMutation.mutate(acc.id)}
                />
              </View>
            ))}
            {sharedAccesses.received.map((acc: SharedAccess) => (
              <View key={acc.id} style={styles.accessRow}>
                <View style={styles.flex1}>
                  <Text style={styles.accessEmail}>Recibido de: {acc.owner.email}</Text>
                  <Text style={styles.accessSub}>Rol: {acc.access_level === 'READ_ONLY' ? 'Solo Lectura' : 'Lectura/Escritura'}</Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      <Button mode="outlined" onPress={handleLogout} style={styles.logoutBtn} textColor={theme.colors.error}>
        Cerrar Sesión
      </Button>

      {/* MODAL: EDIT PROFILE */}
      <Portal>
        <Dialog visible={profileModalVisible} onDismiss={() => setProfileModalVisible(false)}>
          <Dialog.Title>Editar Perfil</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <Controller
              control={profileControl}
              name="first_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput mode="outlined" label="Nombre" onBlur={onBlur} onChangeText={onChange} value={value} />
              )}
            />
            <Controller
              control={profileControl}
              name="last_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput mode="outlined" label="Apellido" onBlur={onBlur} onChangeText={onChange} value={value} />
              )}
            />
            <Controller
              control={profileControl}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput mode="outlined" label="Teléfono" onBlur={onBlur} onChangeText={onChange} value={value} />
              )}
            />
            <Controller
              control={profileControl}
              name="country"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput mode="outlined" label="País" onBlur={onBlur} onChangeText={onChange} value={value} />
              )}
            />
            <Controller
              control={profileControl}
              name="city"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput mode="outlined" label="Ciudad" onBlur={onBlur} onChangeText={onChange} value={value} />
              )}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setProfileModalVisible(false)}>Cancelar</Button>
            <Button onPress={handleProfileSubmit(onProfileSubmit)}>Guardar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* MODAL: CHANGE PASSWORD */}
      <Portal>
        <Dialog visible={passModalVisible} onDismiss={() => setPassModalVisible(false)}>
          <Dialog.Title>Cambiar Contraseña</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            {errorMsg && <Text style={{ color: theme.colors.error }}>{errorMsg}</Text>}
            {successMsg && <Text style={{ color: '#10B981' }}>{successMsg}</Text>}
            <Controller
              control={passControl}
              name="current_password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput secureTextEntry mode="outlined" label="Contraseña Actual" onBlur={onBlur} onChangeText={onChange} value={value} />
              )}
            />
            <Controller
              control={passControl}
              name="new_password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput secureTextEntry mode="outlined" label="Nueva Contraseña" onBlur={onBlur} onChangeText={onChange} value={value} />
              )}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPassModalVisible(false)}>Cancelar</Button>
            <Button onPress={handlePassSubmit(onPassSubmit)}>Actualizar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* MODAL: CREATE SHARED ACCESS */}
      <Portal>
        <Dialog visible={accessModalVisible} onDismiss={() => setAccessModalVisible(false)}>
          <Dialog.Title>Otorgar Acceso Compartido</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            {errorMsg && <Text style={{ color: theme.colors.error }}>{errorMsg}</Text>}
            <Controller
              control={accessControl}
              name="guest_email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput mode="outlined" label="Correo del Invitado" onBlur={onBlur} onChangeText={onChange} value={value} />
              )}
            />
            <Controller
              control={accessControl}
              name="access_level"
              render={({ field: { onChange, value } }) => (
                <View style={styles.selectContainer}>
                  <Text style={styles.label}>Nivel de Acceso</Text>
                  <SegmentedButtons
                    value={value}
                    onValueChange={onChange}
                    buttons={[
                      { value: 'READ_ONLY', label: 'Solo Lectura' },
                      { value: 'READ_WRITE', label: 'Lectura/Escritura' },
                    ]}
                  />
                </View>
              )}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAccessModalVisible(false)}>Cancelar</Button>
            <Button onPress={handleAccessSubmit(onAccessSubmit)}>Otorgar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* MODAL: CREATE REMINDER */}
      <Portal>
        <Dialog visible={reminderModalVisible} onDismiss={() => setReminderModalVisible(false)}>
          <Dialog.Title>Nuevo Recordatorio</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            {errorMsg && <Text style={{ color: theme.colors.error, marginBottom: 8 }}>{errorMsg}</Text>}
            <Controller
              control={reminderControl}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput mode="outlined" label="Título" onBlur={onBlur} onChangeText={onChange} value={value} />
              )}
            />
            <Controller
              control={reminderControl}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput mode="outlined" label="Descripción (Opcional)" onBlur={onBlur} onChangeText={onChange} value={value} />
              )}
            />
            <Controller
              control={reminderControl}
              name="reminder_date"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      setTempReminderDate(null);
                      setShowReminderDatePicker(true);
                    }}
                  >
                    <View pointerEvents="none">
                      <TextInput
                        mode="outlined"
                        label="Fecha y Hora (YYYY-MM-DDTHH:MM)"
                        onBlur={onBlur}
                        value={value}
                        right={<TextInput.Icon icon="calendar-clock" />}
                      />
                    </View>
                  </TouchableOpacity>
                  {showReminderDatePicker && Platform.OS !== 'web' && (
                    <DateTimePicker
                      value={value ? new Date(value) : new Date()}
                      mode={Platform.OS === 'ios' ? 'datetime' : 'date'}
                      display="default"
                      onChange={(event, selectedDate) => {
                        if (Platform.OS === 'android') {
                          setShowReminderDatePicker(false);
                        }
                        if (selectedDate) {
                          if (Platform.OS === 'ios') {
                            const year = selectedDate.getFullYear();
                            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                            const day = String(selectedDate.getDate()).padStart(2, '0');
                            const hours = String(selectedDate.getHours()).padStart(2, '0');
                            const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
                            onChange(`${year}-${month}-${day}T${hours}:${minutes}`);
                          } else {
                            setTempReminderDate(selectedDate);
                            setShowReminderTimePicker(true);
                          }
                        }
                      }}
                    />
                  )}
                  {showReminderTimePicker && Platform.OS !== 'web' && (
                    <DateTimePicker
                      value={tempReminderDate || new Date()}
                      mode="time"
                      display="default"
                      onChange={(event, selectedTime) => {
                        if (Platform.OS === 'android') {
                          setShowReminderTimePicker(false);
                        }
                        if (selectedTime && tempReminderDate) {
                          const combined = new Date(tempReminderDate);
                          combined.setHours(selectedTime.getHours());
                          combined.setMinutes(selectedTime.getMinutes());

                          const year = combined.getFullYear();
                          const month = String(combined.getMonth() + 1).padStart(2, '0');
                          const day = String(combined.getDate()).padStart(2, '0');
                          const hours = String(combined.getHours()).padStart(2, '0');
                          const minutes = String(combined.getMinutes()).padStart(2, '0');

                          onChange(`${year}-${month}-${day}T${hours}:${minutes}`);
                        }
                      }}
                    />
                  )}
                </View>
              )}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setReminderModalVisible(false)}>Cancelar</Button>
            <Button onPress={handleReminderSubmit(onReminderSubmit)}>Programar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    borderRadius: 16,
    elevation: 3,
  },
  profileContent: {
    alignItems: 'center',
    gap: 12,
  },
  profileHeader: {
    alignItems: 'center',
    gap: 4,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 14,
    opacity: 0.6,
  },
  divider: {
    width: '100%',
    marginVertical: 8,
  },
  profileDetails: {
    alignSelf: 'flex-start',
    gap: 6,
    width: '100%',
  },
  detailText: {
    fontSize: 14,
    opacity: 0.8,
  },
  editBtn: {
    marginTop: 12,
    width: '100%',
    borderRadius: 8,
  },
  settingsSection: {
    backgroundColor: '#615f5fff',
    borderRadius: 12,
    elevation: 1,
    overflow: 'hidden',
  },
  settingsItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  remindersCard: {
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  reminderDate: {
    fontSize: 11,
    opacity: 0.5,
  },
  sharedAccessCard: {
    borderRadius: 12,
    elevation: 2,
  },
  sharedContent: {
    gap: 8,
  },
  accessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  accessEmail: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  accessSub: {
    fontSize: 11,
    opacity: 0.5,
  },
  logoutBtn: {
    marginTop: 16,
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 8,
  },
  dialogContent: {
    gap: 12,
  },
  selectContainer: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  flex1: {
    flex: 1,
  },
});
