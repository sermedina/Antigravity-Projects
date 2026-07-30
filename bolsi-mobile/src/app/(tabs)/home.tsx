import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, Title, Paragraph, useTheme, ActivityIndicator, IconButton, Menu, Button } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { accountService } from '../../services/account.service';
import { transactionService } from '../../services/transaction.service';
import { debtService } from '../../services/debt.service';
import { investmentService } from '../../services/investment.service';
import { goalService } from '../../services/goal.service';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useAuth } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AccountSwitcher } from '../../components/AccountSwitcher';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const theme = useTheme();
  const { user, activeUserId } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Estados para monedas y tasas de cambio
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'USDT'>('USD');
  const [currencyMenuVisible, setCurrencyMenuVisible] = useState(false);
  const [rates, setRates] = useState({ usd_bcv: 745.6371, eur_bcv: 848.8258, usdt_paralelo: 820.00 });

  const fetchRates = async () => {
    try {
      // 1. Obtener Dólar oficial y paralelo
      const usdRes = await fetch('https://ve.dolarapi.com/v1/dolares');
      if (usdRes.ok) {
        const usdData = await usdRes.json();
        const oficial = usdData.find((d: any) => d.fuente === 'oficial')?.promedio;
        const paralelo = usdData.find((d: any) => d.fuente === 'paralelo')?.promedio;
        setRates((prev) => ({
          ...prev,
          ...(oficial ? { usd_bcv: Number(oficial) } : {}),
          ...(paralelo ? { usdt_paralelo: Number(paralelo) } : {}),
        }));
      }

      // 2. Obtener Euro oficial
      const eurRes = await fetch('https://ve.dolarapi.com/v1/euros');
      if (eurRes.ok) {
        const eurData = await eurRes.json();
        const oficial = eurData.find((e: any) => e.fuente === 'oficial')?.promedio;
        setRates((prev) => ({
          ...prev,
          ...(oficial ? { eur_bcv: Number(oficial) } : {}),
        }));
      }
    } catch (err) {
      console.error('Error al consultar tasas de cambio:', err);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  // Consultar todos los datos requeridos mediante React Query
  const { data: accounts, refetch: refetchAccounts, isLoading: loadingAccounts } = useQuery({
    queryKey: ['accounts', activeUserId],
    queryFn: () => accountService.getAccounts(),
  });

  const { data: transactions, refetch: refetchTransactions, isLoading: loadingTx } = useQuery({
    queryKey: ['transactions', activeUserId],
    queryFn: () => transactionService.getTransactions(),
  });

  const { data: debts, refetch: refetchDebts, isLoading: loadingDebts } = useQuery({
    queryKey: ['debts', activeUserId],
    queryFn: () => debtService.getDebts(),
  });

  const { data: investments, refetch: refetchInvestments, isLoading: loadingInvestments } = useQuery({
    queryKey: ['investments', activeUserId],
    queryFn: () => investmentService.getInvestments(),
  });

  const { data: goals, refetch: refetchGoals, isLoading: loadingGoals } = useQuery({
    queryKey: ['goals', activeUserId],
    queryFn: () => goalService.getGoals(),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchAccounts(),
      refetchTransactions(),
      refetchDebts(),
      refetchInvestments(),
      refetchGoals(),
      fetchRates(),
    ]);
    setRefreshing(false);
  };

  const isLoading = loadingAccounts || loadingTx || loadingDebts || loadingInvestments || loadingGoals;

  // Función de conversión general
  const convertValue = (val: number, fromCurrency: string, toCurrency: string) => {
    const usdRate = rates.usd_bcv;
    const eurRate = rates.eur_bcv;
    const usdtRate = rates.usdt_paralelo;

    // 1. Convertir a VES primero
    let valInVes = val;
    if (fromCurrency === 'USD') {
      valInVes = val * usdRate;
    } else if (fromCurrency === 'EUR') {
      valInVes = val * eurRate;
    } else if (fromCurrency === 'USDT') {
      valInVes = val * usdtRate;
    } else if (fromCurrency === 'VES') {
      valInVes = val;
    }

    // 2. Convertir de VES a la moneda de destino
    if (toCurrency === 'USD') {
      return valInVes / usdRate;
    } else if (toCurrency === 'EUR') {
      return valInVes / eurRate;
    } else if (toCurrency === 'USDT') {
      return valInVes / usdtRate;
    } else {
      return valInVes;
    }
  };

  // 1. Cálculos de Métricas Financieras
  const metrics = useMemo(() => {
    const convert = (val: number, from: string) => {
      return convertValue(val, from, selectedCurrency);
    };

    // Balance total (suma de todas las cuentas)
    const balanceTotal = accounts?.reduce((sum, acc) => {
      return sum + convert(Number(acc.balance), acc.currency);
    }, 0) || 0;

    // Ingresos y egresos totales acumulados
    let totalIngresos = 0;
    let totalEgresos = 0;
    if (transactions) {
      transactions.forEach((tx) => {
        const amtInDisplay = convert(Number(tx.amount), tx.account?.currency || 'USD');
        if (tx.type === 'INCOME') totalIngresos += amtInDisplay;
        else if (tx.type === 'EXPENSE') totalEgresos += amtInDisplay;
      });
    }

    // Deudas, Inversiones y Metas (originalmente en USD) convertidos a la moneda seleccionada
    const totalDeudas = debts?.reduce((sum, d) => sum + convert(Number(d.remaining_amount), 'USD'), 0) || 0;
    const totalInversiones = investments?.reduce((sum, inv) => sum + convert(Number(inv.current_value), 'USD'), 0) || 0;
    const totalMetas = goals?.reduce((sum, g) => sum + convert(Number(g.current_amount), 'USD'), 0) || 0;

    return {
      balanceTotal,
      totalIngresos,
      totalEgresos,
      totalDeudas,
      totalInversiones,
      totalMetas,
    };
  }, [accounts, transactions, debts, investments, goals, selectedCurrency, rates]);

  // 2. Gráfico: Distribución de Egresos por Categorías
  const pieChartData = useMemo(() => {
    if (!transactions) return [];

    const categoryMap: { [name: string]: number } = {};
    transactions
      .filter((tx) => tx.type === 'EXPENSE')
      .forEach((tx) => {
        const catName = tx.category?.name || 'Otros';
        const convertedAmt = convertValue(Number(tx.amount), tx.account?.currency || 'USD', selectedCurrency);
        categoryMap[catName] = (categoryMap[catName] || 0) + convertedAmt;
      });

    const colors = ['#5D3FD3', '#EF4444', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#64748B'];
    return Object.keys(categoryMap).map((key, index) => ({
      name: key,
      population: categoryMap[key],
      color: colors[index % colors.length],
      legendFontColor: theme.colors.onBackground,
      legendFontSize: 12,
    }));
  }, [transactions, theme, selectedCurrency, rates]);

  // 3. Gráfico: Tendencia de Ingresos y Egresos (Últimas transacciones o meses)
  const lineChartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{ data: [0, 0, 0, 0, 0, 0] }],
      };
    }

    // Tomar las últimas 6 transacciones para simplificar, ordenadas cronológicamente
    const list = [...transactions].reverse().slice(-6);
    const labels = list.map((tx) => {
      const d = new Date(tx.transaction_date);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });
    const dataset = list.map((tx) => {
      const convertedAmt = convertValue(Number(tx.amount), tx.account?.currency || 'USD', selectedCurrency);
      return convertedAmt * (tx.type === 'EXPENSE' ? -1 : 1);
    });

    return {
      labels,
      datasets: [
        {
          data: dataset,
          color: (opacity = 1) => `rgba(93, 63, 211, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  }, [transactions, selectedCurrency, rates]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando tu resumen financiero...</Text>
      </View>
    );
  }

  const formatCurrency = (val: number, currencyCode: 'USD' | 'EUR' | 'USDT' | 'VES' = selectedCurrency) => {
    if (currencyCode === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(val);
    } else if (currencyCode === 'EUR') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
      }).format(val);
    } else if (currencyCode === 'VES') {
      return new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: 'VES',
      }).format(val);
    } else {
      // USDT
      const formattedNum = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(val);
      return `₮${formattedNum}`;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AccountSwitcher />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        {/* Saludo Inicial */}
        <View style={styles.welcomeRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeText}>Hola, {user?.first_name || 'Usuario'}</Text>
            <Text style={styles.dateText}>Bienvenido de vuelta a Bolsi</Text>
          </View>
          <View style={styles.headerActions}>
            <Menu
              visible={currencyMenuVisible}
              onDismiss={() => setCurrencyMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  compact
                  onPress={() => setCurrencyMenuVisible(true)}
                  icon="chevron-down"
                  contentStyle={{ flexDirection: 'row-reverse' }}
                  style={styles.currencyButton}
                  labelStyle={{ fontSize: 12, fontWeight: 'bold' }}
                >
                  {selectedCurrency}
                </Button>
              }
            >
              <Menu.Item onPress={() => { setSelectedCurrency('USD'); setCurrencyMenuVisible(false); }} title="USD ($)" />
              <Menu.Item onPress={() => { setSelectedCurrency('EUR'); setCurrencyMenuVisible(false); }} title="EUR (€)" />
              <Menu.Item onPress={() => { setSelectedCurrency('USDT'); setCurrencyMenuVisible(false); }} title="USDT (₮)" />
            </Menu>
            <IconButton
              icon="bell-outline"
              size={24}
              onPress={() => {}}
              style={{ margin: 0 }}
            />
          </View>
        </View>

        {/* Tasas de Cambio Bar */}
        <View style={styles.ratesBar}>
          <Text style={styles.ratesText}>
            BCV USD: {rates.usd_bcv.toFixed(2)} Bs • BCV EUR: {rates.eur_bcv.toFixed(2)} Bs • USDT: {rates.usdt_paralelo.toFixed(2)} Bs
          </Text>
        </View>

      {/* Balance General Card (Premium Gradient Look) */}
      <Card style={[styles.balanceCard, { backgroundColor: theme.colors.primary }]}>
        <Card.Content>
          <Text style={styles.balanceLabel}>Balance General</Text>
          <Text style={styles.balanceValue}>{formatCurrency(metrics.balanceTotal)}</Text>
          <Text style={styles.balanceVesValue}>
            {formatCurrency(convertValue(metrics.balanceTotal, selectedCurrency, 'VES'), 'VES')}
          </Text>
          <View style={styles.balanceMetricsRow}>
            <View style={styles.balanceSubMetric}>
              <MaterialCommunityIcons name="arrow-up-circle" size={20} color="#34D399" />
              <View>
                <Text style={styles.subMetricLabel}>Ingresos</Text>
                <Text style={styles.subMetricValue}>{formatCurrency(metrics.totalIngresos)}</Text>
              </View>
            </View>
            <View style={styles.balanceSubMetric}>
              <MaterialCommunityIcons name="arrow-down-circle" size={20} color="#F87171" />
              <View>
                <Text style={styles.subMetricLabel}>Egresos</Text>
                <Text style={styles.subMetricValue}>{formatCurrency(metrics.totalEgresos)}</Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Grid de Sub-Módulos Financieros */}
      <View style={styles.gridRow}>
        <Card style={styles.gridCard}>
          <Card.Content style={styles.gridCardContent}>
            <MaterialCommunityIcons name="handshake" size={28} color="#E11D48" />
            <View>
              <Text style={styles.gridLabel}>Deudas</Text>
              <Text style={[styles.gridValue, { color: '#E11D48' }]}>
                {formatCurrency(metrics.totalDeudas)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.gridCard}>
          <Card.Content style={styles.gridCardContent}>
            <MaterialCommunityIcons name="chart-line" size={28} color="#059669" />
            <View>
              <Text style={styles.gridLabel}>Inversiones</Text>
              <Text style={[styles.gridValue, { color: '#059669' }]}>
                {formatCurrency(metrics.totalInversiones)}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.goalsCard}>
        <Card.Content style={styles.goalsCardContent}>
          <MaterialCommunityIcons name="flag" size={28} color="#D97706" />
          <View style={styles.flex1}>
            <Text style={styles.gridLabel}>Metas Ahorradas</Text>
            <Text style={[styles.gridValue, { color: '#D97706' }]}>
              {formatCurrency(metrics.totalMetas)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Gráficos del Negocio */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title style={styles.chartTitle}>Flujo de Fondos (Movimientos)</Title>
          <LineChart
            data={lineChartData}
            width={screenWidth - 64}
            height={200}
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(93, 63, 211, ${opacity})`,
              labelColor: (opacity = 1) => theme.colors.onSurface,
              style: { borderRadius: 16 },
              propsForDots: { r: '4', strokeWidth: '2', stroke: '#5D3FD3' },
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {pieChartData.length > 0 && (
        <Card style={styles.chartCard}>
          <Card.Content>
            <Title style={styles.chartTitle}>Distribución de Gastos</Title>
            <PieChart
              data={pieChartData}
              width={screenWidth - 64}
              height={180}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </Card.Content>
        </Card>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.8,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    opacity: 0.6,
  },
  balanceCard: {
    borderRadius: 16,
    elevation: 4,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  balanceMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 12,
    marginTop: 8,
  },
  balanceSubMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subMetricLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
  },
  subMetricValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCard: {
    flex: 1,
    borderRadius: 12,
    elevation: 2,
  },
  gridCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalsCard: {
    borderRadius: 12,
    elevation: 2,
  },
  goalsCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  gridValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chartCard: {
    borderRadius: 16,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currencyButton: {
    borderRadius: 8,
    borderColor: 'rgba(93, 63, 211, 0.3)',
    height: 38,
    justifyContent: 'center',
  },
  ratesBar: {
    backgroundColor: 'rgba(93, 63, 211, 0.05)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 4,
  },
  ratesText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  balanceVesValue: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 16,
    fontWeight: '600',
    marginTop: -8,
    marginBottom: 12,
  },
});
