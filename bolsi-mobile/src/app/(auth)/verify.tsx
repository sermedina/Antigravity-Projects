import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, useTheme, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import OtpInput from '../../components/OtpInput';

const verifySchema = z.object({
  email: z.string().email('Por favor ingrese un correo válido'),
  token: z.string().length(6, 'El código debe tener exactamente 6 dígitos').regex(/^\d+$/, 'El código debe ser puramente numérico'),
});

type VerifyFormData = z.infer<typeof verifySchema>;

export default function VerifyScreen() {
  const theme = useTheme();
  const { verifyEmail } = useAuth();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      email: (params.email as string) || '',
      token: '',
    }
  });

  const onSubmit = async (data: VerifyFormData) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await verifyEmail(data.email, data.token);
      setSuccessMsg('¡Cuenta verificada con éxito! Redirigiendo al inicio de sesión...');
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || err.message || 'El código OTP es inválido o ha expirado');
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
            <Text style={styles.title}>Verificar Cuenta</Text>
            <Text style={styles.description}>
              Hemos enviado un correo con un código OTP de verificación de 6 dígitos. Por favor, ingrésalo aquí para activar tu cuenta.
            </Text>

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

            <Controller
              control={control}
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
                    error={!!errors.email}
                    left={<TextInput.Icon icon="email" />}
                    activeOutlineColor={theme.colors.primary}
                  />
                  {errors.email && (
                    <HelperText type="error" visible={true}>
                      {errors.email.message}
                    </HelperText>
                  )}
                </View>
              )}
            />

            <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
              Código de Verificación
            </Text>
            <Controller
              control={control}
              name="token"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <OtpInput
                    value={value}
                    onChange={onChange}
                    error={!!errors.token}
                  />
                  {errors.token && (
                    <HelperText type="error" visible={true} style={styles.errorText}>
                      {errors.token.message}
                    </HelperText>
                  )}
                </View>
              )}
            />

            <Button
              mode="contained"
              loading={loading}
              disabled={loading || !!successMsg}
              onPress={handleSubmit(onSubmit)}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              Verificar Cuenta
            </Button>
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
  inputContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
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
