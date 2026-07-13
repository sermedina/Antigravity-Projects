import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Card, useTheme, HelperText, SegmentedButtons, Menu, Portal } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

const COUNTRIES = [
  'Venezuela',
  'Panamá',
  'Estados Unidos',
  'Colombia',
  'España',
  'Chile',
  'Argentina',
  'Perú',
  'México'
] as const;

const DIAL_CODES: Record<string, string> = {
  'Venezuela': '+58',
  'Panamá': '+507',
  'Estados Unidos': '+1',
  'Colombia': '+57',
  'España': '+34',
  'Chile': '+56',
  'Argentina': '+54',
  'Perú': '+51',
  'México': '+52'
};

const FLAG_EMOJIS: Record<string, string> = {
  'Venezuela': '🇻🇪',
  'Panamá': '🇵🇦',
  'Estados Unidos': '🇺🇸',
  'Colombia': '🇨🇴',
  'España': '🇪🇸',
  'Chile': '🇨🇱',
  'Argentina': '🇦🇷',
  'Perú': '🇵🇪',
  'México': '🇲🇽'
};

const CITIES: Record<string, string[]> = {
  'Venezuela': ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Ciudad Guayana', 'San Cristóbal', 'Barcelona', 'Maturín', 'Puerto Cruz', 'Mérida', 'Ciudad Bolívar', 'Cumaná', 'Barinas', 'Cabimas', 'Punto Fijo', 'Guarenas', 'Los Teques', 'Coro', 'El Tigre'],
  'Panamá': ['Ciudad de Panamá', 'Colón', 'David', 'Chitré', 'Penonomé', 'Santiago de Veraguas', 'Changuinola', 'Las Tablas', 'La Chorrera', 'Arraiján', 'Aguadulce', 'Bugaba', 'Chepo', 'Portobelo', 'Bocas del Toro', 'Boquete', 'El Valle de Antón', 'Yaviza', 'Tocumen', 'Pacora'],
  'Estados Unidos': ['Nueva York', 'Los Ángeles', 'Chicago', 'Houston', 'Phoenix', 'Filadelfia', 'San Antonio', 'San Diego', 'Dallas', 'San José', 'Austin', 'Jacksonville', 'San Francisco', 'Indianápolis', 'Columbus', 'Fort Worth', 'Charlotte', 'Seattle', 'Denver', 'El Paso'],
  'Colombia': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué', 'Pasto', 'Cúcuta', 'Manizales', 'Neiva', 'Armenia', 'Valledupar', 'Villavicencio', 'Montería', 'Popayán', 'Sincelejo', 'Tunja'],
  'España': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma de Mallorca', 'Las Palmas de Gran Canaria', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Hospitalet de Llobregat', 'Vitoria', 'A Coruña', 'Granada', 'Elche'],
  'Chile': ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco', 'Iquique', 'Rancagua', 'Talca', 'Arica', 'Puerto Montt', 'Chillán', 'Los Ángeles (Chile)', 'Osorno', 'Copiapó', 'Valdivia', 'Quillota', 'Punta Arenas', 'Curicó', 'Calama'],
  'Argentina': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'San Miguel de Tucumán', 'La Plata', 'Mar del Plata', 'Salta', 'Santa Fe', 'San Juan', 'Resistencia', 'Neuquén', 'Santiago del Estero', 'Corrientes', 'Bahía Blanca', 'San Salvador de Jujuy', 'Paraná', 'Posadas', 'Bariloche', 'Ushuaia'],
  'Perú': ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos', 'Cusco', 'Chimbote', 'Huancayo', 'Tacna', 'Pucallpa', 'Ica', 'Juliaca', 'Sullana', 'Huánuco', 'Ayacucho', 'Cajamarca', 'Tarapoto', 'Tumbes', 'Talara'],
  'México': ['Ciudad de México', 'Tijuana', 'Ecatepec', 'León', 'Puebla', 'Guadalajara', 'Juárez', 'Zapopan', 'Monterrey', 'Nezahualcóyotl', 'Chihuahua', 'Mérida (México)', 'Naucalpan', 'Toluca', 'Cancún', 'Querétaro', 'Hermosillo', 'Saltillo', 'San Luis Potosí', 'Culiacán']
};

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

  const [countryMenuVisible, setCountryMenuVisible] = useState(false);
  const [cityMenuVisible, setCityMenuVisible] = useState(false);

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<RegisterFormData>({
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

  const selectedCountry = watch('country');

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // El backend requiere 'username'. Pasamos el email como username
      const prefix = DIAL_CODES[data.country] || '';
      const payload = {
        ...data,
        phone: `${prefix}${data.phone}`,
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

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Controller
                  control={control}
                  name="country"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <Menu
                        visible={countryMenuVisible}
                        onDismiss={() => setCountryMenuVisible(false)}
                        anchor={
                          <TouchableOpacity onPress={() => setCountryMenuVisible(true)}>
                            <View pointerEvents="none">
                              <TextInput
                                mode="outlined"
                                label="País"
                                value={value}
                                error={!!errors.country}
                                right={<TextInput.Icon icon="chevron-down" />}
                                activeOutlineColor={theme.colors.primary}
                              />
                            </View>
                          </TouchableOpacity>
                        }
                      >
                        {COUNTRIES.map((c) => (
                          <Menu.Item
                            key={c}
                            onPress={() => {
                              onChange(c);
                              setValue('city', '');
                              setValue('phone', '');
                              setCountryMenuVisible(false);
                            }}
                            title={c}
                          />
                        ))}
                      </Menu>
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
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <Menu
                        visible={cityMenuVisible}
                        onDismiss={() => setCityMenuVisible(false)}
                        anchor={
                          <TouchableOpacity
                            onPress={() => {
                              if (selectedCountry) {
                                setCityMenuVisible(true);
                              }
                            }}
                          >
                            <View pointerEvents="none">
                              <TextInput
                                mode="outlined"
                                label="Ciudad"
                                value={value}
                                error={!!errors.city}
                                right={<TextInput.Icon icon="chevron-down" />}
                                activeOutlineColor={theme.colors.primary}
                                placeholder={selectedCountry ? 'Seleccione' : 'Seleccione país'}
                              />
                            </View>
                          </TouchableOpacity>
                        }
                      >
                        <ScrollView style={{ maxHeight: 200 }}>
                          {(CITIES[selectedCountry as keyof typeof CITIES] || []).map((ct) => (
                            <Menu.Item
                              key={ct}
                              onPress={() => {
                                onChange(ct);
                                setCityMenuVisible(false);
                              }}
                              title={ct}
                            />
                          ))}
                        </ScrollView>
                      </Menu>
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

            <View style={styles.phoneRow}>
              <View style={[
                styles.prefixBox,
                {
                  borderColor: theme.dark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                  backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                }
              ]}>
                <Text style={[styles.prefixText, { color: theme.colors.onBackground }]}>
                  {selectedCountry ? `${FLAG_EMOJIS[selectedCountry as keyof typeof FLAG_EMOJIS] || ''} ${DIAL_CODES[selectedCountry as keyof typeof DIAL_CODES] || ''}` : '🌐'}
                </Text>
              </View>
              <View style={styles.phoneInputContainer}>
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
                        activeOutlineColor={theme.colors.primary}
                      />
                    </View>
                  )}
                />
              </View>
            </View>
            {errors.phone && (
              <HelperText type="error" visible={true} style={{ marginTop: -8 }}>
                {errors.phone.message}
              </HelperText>
            )}

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
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  prefixBox: {
    height: 56,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6, // to align with TextInput outline offset
  },
  prefixText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  phoneInputContainer: {
    flex: 1,
  },
});
