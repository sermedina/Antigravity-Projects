import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, useTheme, HelperText, SegmentedButtons } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

// Esquema de validación con Zod
const registerSchema = z.object({
  email: z.string().email('Por favor ingrese un correo válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  first_name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().min(1, 'El apellido es requerido'),
  phone: z.string().min(6, 'Por favor ingrese un número de teléfono válido'),
  country: z.string().min(1, 'El país es requerido'),
  city: z.string().min(1, 'La ciudad es requerida'),
  user_type: z.enum(['NATURAL', 'JURIDICO']),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const theme = useTheme();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      country: '',
      city: '',
      user_type: 'NATURAL',
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // El backend requiere 'username'. Pasamos el email como username
      const payload = {
        ...data,
        username: data.email
      };
      await register(payload);
      
      // Al registrarse exitosamente, redirigir a la pantalla de verificación
      // pasando el correo como parámetro
      router.replace({
        pathname: '/(auth)/verify',
        params: { email: data.email }
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || err.message || 'Error al registrarse');
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
            <Text style={styles.title}>Crear Cuenta</Text>

            {errorMsg && (
              <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
                <Text style={{ color: theme.colors.error, fontWeight: '600' }}>{errorMsg}</Text>
              </View>
            )}

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Controller
                  control={control}
                  name="first_name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <TextInput
                        mode="outlined"
                        label="Nombre"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={!!errors.first_name}
                        activeOutlineColor={theme.colors.primary}
                      />
                      {errors.first_name && (
                        <HelperText type="error" visible={true}>
                          {errors.first_name.message}
                        </HelperText>
                      )}
                    </View>
                  )}
                />
              </View>
              <View style={styles.flex1}>
                <Controller
                  control={control}
                  name="last_name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <TextInput
                        mode="outlined"
                        label="Apellido"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={!!errors.last_name}
                        activeOutlineColor={theme.colors.primary}
                      />
                      {errors.last_name && (
                        <HelperText type="error" visible={true}>
                          {errors.last_name.message}
                        </HelperText>
                      )}
                    </View>
                  )}
                />
              </View>
            </View>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
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

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    mode="outlined"
                    label="Contraseña"
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                    error={!!errors.password}
                    left={<TextInput.Icon icon="lock" />}
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

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    mode="outlined"
                    label="Teléfono"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="phone-pad"
                    error={!!errors.phone}
                    left={<TextInput.Icon icon="phone" />}
                    activeOutlineColor={theme.colors.primary}
                  />
                  {errors.phone && (
                    <HelperText type="error" visible={true}>
                      {errors.phone.message}
                    </HelperText>
                  )}
                </View>
              )}
            />

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Controller
                  control={control}
                  name="country"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <TextInput
                        mode="outlined"
                        label="País"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={!!errors.country}
                        activeOutlineColor={theme.colors.primary}
                      />
                      {errors.country && (
                        <HelperText type="error" visible={true}>
                          {errors.country.message}
                        </HelperText>
                      )}
                    </View>
                  )}
                />
              </View>
              <View style={styles.flex1}>
                <Controller
                  control={control}
                  name="city"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <TextInput
                        mode="outlined"
                        label="Ciudad"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={!!errors.city}
                        activeOutlineColor={theme.colors.primary}
                      />
                      {errors.city && (
                        <HelperText type="error" visible={true}>
                          {errors.city.message}
                        </HelperText>
                      )}
                    </View>
                  )}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tipo de persona</Text>
              <Controller
                control={control}
                name="user_type"
                render={({ field: { onChange, value } }) => (
                  <SegmentedButtons
                    value={value}
                    onValueChange={onChange}
                    buttons={[
                      { value: 'NATURAL', label: 'Natural' },
                      { value: 'JURIDICO', label: 'Jurídico' },
                    ]}
                  />
                )}
              />
            </View>

            <Button
              mode="contained"
              loading={loading}
              disabled={loading}
              onPress={handleSubmit(onSubmit)}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              Registrarse
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Button
            mode="text"
            onPress={() => router.replace('/(auth)/login')}
            labelStyle={{ color: theme.colors.primary, fontWeight: 'bold' }}
          >
            ¿Ya tienes una cuenta? Inicia Sesión
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
    padding: 20,
    paddingVertical: 40,
  },
  card: {
    elevation: 4,
    borderRadius: 16,
  },
  cardContent: {
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flex1: {
    flex: 1,
  },
  inputContainer: {
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    opacity: 0.8,
  },
  button: {
    marginTop: 16,
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
    marginTop: 20,
  },
});
