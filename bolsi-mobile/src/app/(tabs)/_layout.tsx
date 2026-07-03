import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 2,
          shadowOpacity: 0.1,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: theme.colors.onSurface,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.background,
          height: Platform.OS === 'ios' ? 100 : 120,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Resumen',
          headerTitle: 'Mi Bolsi',
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="finances"
        options={{
          title: 'Mis Finanzas',
          headerTitle: 'Cuentas y Movimientos',
          tabBarLabel: 'Finanzas',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "wallet" : "wallet-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="planning"
        options={{
          title: 'Planificación',
          headerTitle: 'Deudas, Metas e Inversiones',
          tabBarLabel: 'Planificación',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "chart-timeline-variant" : "chart-timeline-variant-shimmer"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="education"
        options={{
          title: 'Educación',
          headerTitle: 'Biblioteca Financiera',
          tabBarLabel: 'Educación',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "book-open-page-variant" : "book-open-page-variant-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Mi Perfil',
          headerTitle: 'Perfil y Configuración',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "account" : "account-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
