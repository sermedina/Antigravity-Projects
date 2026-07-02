import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { user, token, isLoading } = useAuth();

  // Mostrar un indicador de carga mientras se recupera la sesión
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#5D3FD3" />
      </View>
    );
  }

  // Si hay un token, verificar si el correo está validado
  if (token) {
    if (user?.is_email_verified) {
      return <Redirect href="/(tabs)/home" />;
    } else {
      // Redirigir a la pantalla de verificación OTP
      return <Redirect href="/(auth)/verify" />;
    }
  }

  // Si no hay sesión iniciada, enviar al Login
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
});
