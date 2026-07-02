import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, useTheme, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

// Esquemas de validación con Zod
const requestSchema = z.object({
  email: z.string().email('Por favor ingrese un correo válido'),
});

const resetSchema = z.object({
  token: z.string().min(1, 'El código es requerido'),
  new_password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type RequestFormData = z.infer<typeof requestSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

export default function RecoverScreen() {
  const theme = useTheme();
  const { requestRecovery, resetPassword } = useAuth();
  const [step, setStep] = useState<1 | 2>(1); // Paso 1: Solicitar, Paso 2: Restablecer
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Formulario Paso 1
  const requestForm = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: '' }
  });

  // Formulario Paso 2
  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { token: '', new_password: '' }
  });

  const onRequestSubmit = async (data: RequestFormData) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const response = await requestRecovery(data.email);
      // El backend devuelve el token en la respuesta. Para testing o facilidad de visualización,
      // lo mostramos en el mensaje para que el usuario pueda copiarlo directamente.
      setSuccessMsg(`Código generado. Tu código es: ${response.token}`);
      setTimeout(() => {
        setStep(2);
        setSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || err.message || 'Error al solicitar el código');
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetFormData) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await resetPassword(data.token, data.new_password);
      setSuccessMsg('¡Contraseña restablecida con éxito! Redirigiendo al login...');
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || err.message || 'El código es inválido o ha expirado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>Recuperar Contraseña</Text>

            {errorMsg && (
              <View style={[styles.messageContainer, { backgroundColor: theme.colors.errorContainer }]}>
                <Text style={{ color: theme.colors.error, fontWeight: '600' }}>{errorMsg}</Text>
              </View>
            )}

            {successMsg && (
              <View style={[styles.messageContainer, { backgroundColor: '#D1FAE5' }]}>
                <Text style={{ color: '#065F46', fontWeight: '600' }}>{successMsg}</Text>
              </View>
            )}

            {step === 1 ? (
              <View style={styles.formContainer}>
                <Text style={styles.description}>
                  Ingresa tu correo registrado y te enviaremos un código de recuperación.
                </Text>

                <Controller
                  control={requestForm.control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputContainer}>
                      <TextInput
                        mode="outlined"
                        label="Correo electrónico"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={!!requestForm.formState.errors.email}
                        left={<TextInput.Icon icon="email" />}
                        activeOutlineColor={theme.colors.primary}
                      />
                      {requestForm.formState.errors.email && (
                        <HelperText type="error" visible={true}>
                          {requestForm.formState.errors.email.message}
                        </HelperText>
                      )}
                    </View>
                  )}
                />

                <Button
                  mode="contained"
                  loading={loading}
                  disabled={loading}
                  onPress={requestForm.handleSubmit(onRequestSubmit)}
                  style={styles.button}
                  labelStyle={styles.buttonLabel}
                >
                  Solicitar Código
                </Button>
              </View>
            ) : (
              <View style={styles.formContainer}>
                <Text style={styles.description}>
                  Ingresa el código que recibiste y define tu nueva contraseña.
                </Text>

                <Controller
                  control={resetForm.control}
                  name="token"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputContainer}>
                      <TextInput
                        mode="outlined"
                        label="Código de Recuperación"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        autoCapitalize="none"
                        error={!!resetForm.formState.errors.token}
                        left={<TextInput.Icon icon="key" />}
                        activeOutlineColor={theme.colors.primary}
                      />
                      {resetForm.formState.errors.token && (
                        <HelperText type="error" visible={true}>
                          {resetForm.formState.errors.token.message}
                        </HelperText>
                      )}
                    </View>
                  )}
                />

                <Controller
                  control={resetForm.control}
                  name="new_password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputContainer}>
                      <TextInput
                        mode="outlined"
                        label="Nueva Contraseña"
                        secureTextEntry
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        autoCapitalize="none"
                        error={!!resetForm.formState.errors.new_password}
                        left={<TextInput.Icon icon="lock" />}
                        activeOutlineColor={theme.colors.primary}
                      />
                      {resetForm.formState.errors.new_password && (
                        <HelperText type="error" visible={true}>
                          {resetForm.formState.errors.new_password.message}
                        </HelperText>
                      )}
                    </View>
                  )}
                />

                <View style={styles.row}>
                  <Button
                    mode="outlined"
                    disabled={loading}
                    onPress={() => setStep(1)}
                    style={[styles.flex1, styles.actionButton]}
                  >
                    Volver
                  </Button>
                  <Button
                    mode="contained"
                    loading={loading}
                    disabled={loading || !!successMsg}
                    onPress={resetForm.handleSubmit(onResetSubmit)}
                    style={[styles.flex2, styles.actionButton]}
                  >
                    Guardar Clave
                  </Button>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Button
            mode="text"
            onPress={() => router.replace('/(auth)/login')}
            labelStyle={{ color: theme.colors.primary, fontWeight: 'bold' }}
          >
            Volver al Inicio de Sesión
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    elevation: 4,
    borderRadius: 16,
  },
  cardContent: {
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
    lineHeight: 20,
  },
  formContainer: {
    gap: 12,
  },
  inputContainer: {
    marginBottom: 4,
  },
  button: {
    marginTop: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  actionButton: {
    borderRadius: 8,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
});
