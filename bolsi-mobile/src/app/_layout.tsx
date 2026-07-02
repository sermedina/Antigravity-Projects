import React from 'react';
import { useColorScheme, View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { MD3LightTheme, MD3DarkTheme, PaperProvider } from 'react-native-paper';
import { queryClient } from '../services/queryClient';
import { AuthProvider } from '../context/AuthContext';
import { OfflineProvider, useOffline } from '../context/OfflineContext';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Configuración de Paleta de Colores Premium para Bolsi
// Colores basados en HSL curados: Púrpura Financiero y Slate Gris
const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#5D3FD3',       // Royal Purple
    primaryContainer: '#E8DDFF',
    secondary: '#475569',     // Slate Grey
    secondaryContainer: '#F1F5F9',
    background: '#F8FAFC',    // Off-white
    surface: '#FFFFFF',
    error: '#EF4444',         // Coral Red
    errorContainer: '#FEE2E2',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#0F172A',
    onSurface: '#0F172A',
  },
};

const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#A78BFA',       // Light Indigo
    primaryContainer: '#4C1D95',
    secondary: '#94A3B8',     // Light Slate
    secondaryContainer: '#1E293B',
    background: '#0F172A',    // Slate Dark
    surface: '#1E293B',
    error: '#F87171',         // Light Coral Red
    errorContainer: '#7F1D1D',
    onPrimary: '#000000',
    onSecondary: '#000000',
    onBackground: '#F8FAFC',
    onSurface: '#F8FAFC',
  },
};

// Componente para mostrar un Banner de Alerta cuando no hay conexión a internet
const OfflineBanner = () => {
  const { isOffline } = useOffline();
  if (!isOffline) return null;

  return (
    <View style={styles.offlineBanner}>
      <Text style={styles.offlineText}>Sin conexión - Modo lectura offline activo</Text>
    </View>
  );
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? customDarkTheme : customLightTheme;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <OfflineProvider>
          <AuthProvider>
            <PaperProvider theme={theme}>
              <OfflineBanner />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: theme.colors.background },
                }}
              >
                {/* Definir las rutas base de navegación */}
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
                <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
              </Stack>
            </PaperProvider>
          </AuthProvider>
        </OfflineProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  offlineBanner: {
    backgroundColor: '#EF4444',
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    zIndex: 9999,
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
