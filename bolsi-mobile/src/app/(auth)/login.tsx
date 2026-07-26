import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, useTheme, HelperText, IconButton } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

const loginSchema = z.object({
  username: z.string(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const theme = useTheme();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await login(data.username, data.password);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.appName, { color: theme.colors.primary }]}>Bolsi</Text>
          <Text style={styles.subtitle}>Tu gestor financiero inteligente</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>Iniciar Sesión</Text>

            {errorMsg && (
              <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
                <Text style={{ color: theme.colors.error, fontWeight: '600' }}>{errorMsg}</Text>
              </View>
            )}

            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    mode="outlined"
                    label="Usuario"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                    error={!!errors.username}
                    left={<TextInput.Icon icon="account" />}
                    activeOutlineColor={theme.colors.primary}
                  />
                  {errors.username && (
                    <HelperText type="error" visible={true}>
                      {errors.username.message}
                    </HelperText>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    mode="outlined"
                    label="Contraseña"
                    secureTextEntry={!showPassword} // Controla la visibilidad
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                    error={!!errors.password}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? "eye-off" : "eye"}
                        onPress={togglePasswordVisibility}
                        forceTextInputFocus={false}
                      />
                    }
                    activeOutlineColor={theme.colors.primary}
                  />
                  {errors.password && (
                    <HelperText type="error" visible={true}>
                      {errors.password.message}
                    </HelperText>
                  )}
                </View>
              )}
            />

            <Button
              mode="contained"
              loading={loading}
              disabled={loading}
              onPress={handleSubmit(onSubmit)}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              Ingresar
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Button
            mode="text"
            onPress={() => router.push('/(auth)/recover')}
            labelStyle={{ color: theme.colors.primary }}
          >
            ¿Olvidaste tu contraseña?
          </Button>

          <Button
            mode="text"
            onPress={() => router.push('/(auth)/register')}
            labelStyle={{ color: theme.colors.primary, fontWeight: 'bold' }}
          >
            ¿No tienes cuenta? Regístrate
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
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
    marginBottom: 16,
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
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
});