import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, FlatList, Platform, Animated, Easing } from 'react-native';
import { Text, Card, Button, TextInput, SegmentedButtons, IconButton, FAB, useTheme, ActivityIndicator, Portal, Dialog, ProgressBar, Divider, HelperText, Menu } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQuery, useMutation } from '@tanstack/react-query';
import { debtService } from '../../services/debt.service';
import { investmentService } from '../../services/investment.service';
import { goalService } from '../../services/goal.service';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Debt, Investment, Goal } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { AccountSwitcher } from '../../components/AccountSwitcher';

// Form validation schemas
const debtSchema = z.object({
  counterparty_name: z.string().min(1, 'El nombre del deudor/acreedor es requerido'),
  total_amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
  debt_type: z.enum(['I_OWE', 'THEY_OWE_ME']),
  interest_rate: z.coerce.number().min(0, 'El interés no puede ser negativo'),
  urgency: z.coerce.number().int().min(1, 'La urgencia debe ser mínimo 1').max(10, 'La urgencia debe ser máximo 10'),
  due_date: z.string().optional(),
  start_date: z.string().optional(),
  interest_period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
});

const investmentSchema = z.object({
  name: z.string().min(1, 'El nombre de la inversión es requerido'),
  asset_type: z.enum(['STOCK', 'CRYPTO', 'REAL_ESTATE', 'OTHER']),
  custom_asset_type: z.string().optional(),
  platform: z.string().optional(),
  current_value: z.coerce.number().min(0),
}).refine(
  (data) => {
    if (data.asset_type === 'OTHER') {
      return !!data.custom_asset_type && data.custom_asset_type.trim().length > 0;
    }
    return true;
  },
  {
    message: 'Por favor, describe el tipo de activo',
    path: ['custom_asset_type'],
  }
);

const goalSchema = z.object({
  name: z.string().min(1, 'El nombre de la meta es requerido'),
  description: z.string().optional(),
  target_amount: z.coerce.number().positive('La meta debe ser mayor a 0'),
  deadline: z.string().optional(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

// Simplified action modals schema
const actionSchema = z.object({
  amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
});

export default function PlanningScreen() {
  const theme = useTheme();
  const { activeUserId, activeAccessLevel } = useAuth();
  const [activeSection, setActiveSection] = useState<'debts' | 'investments' | 'goals'>('debts');
  const [refreshing, setRefreshing] = useState(false);

  // Modals visibility state
  const [debtModalVisible, setDebtModalVisible] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [urgencyMenuVisible, setUrgencyMenuVisible] = useState(false);
  const [interestPeriodMenuVisible, setInterestPeriodMenuVisible] = useState(false);

  const [investmentModalVisible, setInvestmentModalVisible] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [invTxModalVisible, setInvTxModalVisible] = useState(false);
  const [invTxType, setInvTxType] = useState<'CONTRIBUTION' | 'WITHDRAWAL' | 'RETURN'>('CONTRIBUTION');

  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [contribModalVisible, setContribModalVisible] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Animation values for the pulsing FAB
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Set initial opacity based on dark/light mode for best contrast
    const initialOpacity = theme.dark ? 0.7 : 0.9;
    opacityAnim.setValue(initialOpacity);

    const pulse = Animated.loop(
      Animated.parallel([
        Animated.timing(pulseAnim, {
          toValue: 1.6,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(buttonScaleAnim, {
            toValue: 1.06,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(buttonScaleAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulse.start();

    return () => {
      pulse.stop();
      pulseAnim.setValue(1);
      opacityAnim.setValue(initialOpacity);
      buttonScaleAnim.setValue(1);
    };
  }, [theme.dark]);

  // React Queries
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
    await Promise.all([refetchDebts(), refetchInvestments(), refetchGoals()]);
    setRefreshing(false);
  };

  // Mutators for Debt
  const createDebtMutation = useMutation({
    mutationFn: (data: Partial<Debt>) => debtService.createDebt(data),
    onSuccess: () => { refetchDebts(); setDebtModalVisible(false); }
  });

  const updateDebtMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Debt> }) => debtService.updateDebt(id, data),
    onSuccess: () => { refetchDebts(); setDebtModalVisible(false); setEditingDebt(null); }
  });

  const deleteDebtMutation = useMutation({
    mutationFn: (id: number) => debtService.deleteDebt(id),
    onSuccess: () => { refetchDebts(); setDebtModalVisible(false); setEditingDebt(null); }
  });

  const payDebtMutation = useMutation({
    mutationFn: ({ debtId, amount }: { debtId: number, amount: number }) => debtService.payDebt(debtId, amount),
    onSuccess: () => { refetchDebts(); setPayModalVisible(false); setEditingDebt(null); }
  });

  // Mutators for Investment
  const createInvMutation = useMutation({
    mutationFn: (data: Partial<Investment>) => investmentService.createInvestment(data),
    onSuccess: () => { refetchInvestments(); setInvestmentModalVisible(false); }
  });

  const updateInvMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Investment> }) => investmentService.updateInvestment(id, data),
    onSuccess: () => { refetchInvestments(); setInvestmentModalVisible(false); setEditingInvestment(null); }
  });

  const deleteInvMutation = useMutation({
    mutationFn: (id: number) => investmentService.deleteInvestment(id),
    onSuccess: () => { refetchInvestments(); setInvestmentModalVisible(false); setEditingInvestment(null); }
  });

  const addInvTxMutation = useMutation({
    mutationFn: ({ invId, type, amount }: { invId: number, type: string, amount: number }) =>
      investmentService.addInvestmentTransaction(invId, { type, amount }),
    onSuccess: () => { refetchInvestments(); setInvTxModalVisible(false); setEditingInvestment(null); }
  });

  // Mutators for Goal
  const createGoalMutation = useMutation({
    mutationFn: (data: Partial<Goal>) => goalService.createGoal(data),
    onSuccess: () => { refetchGoals(); setGoalModalVisible(false); },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || err.message || 'Error al crear la meta');
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Goal> }) => goalService.updateGoal(id, data),
    onSuccess: () => { refetchGoals(); setGoalModalVisible(false); setEditingGoal(null); },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || err.message || 'Error al actualizar la meta');
    }
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id: number) => goalService.deleteGoal(id),
    onSuccess: () => { refetchGoals(); setGoalModalVisible(false); setEditingGoal(null); }
  });

  const contributeGoalMutation = useMutation({
    mutationFn: ({ goalId, amount }: { goalId: number, amount: number }) => goalService.contributeToGoal(goalId, amount),
    onSuccess: () => { refetchGoals(); setContribModalVisible(false); setEditingGoal(null); }
  });

  // Forms configurations
  const { control: debtControl, handleSubmit: handleDebtSubmit, reset: resetDebtForm } = useForm({
    resolver: zodResolver(debtSchema),
    defaultValues: { counterparty_name: '', total_amount: 0, debt_type: 'I_OWE', interest_rate: 0, interest_period: 'monthly' as const, urgency: 5, due_date: '', start_date: new Date().toISOString().split('T')[0] }
  });

  const { control: invControl, handleSubmit: handleInvSubmit, reset: resetInvForm, watch: watchInv } = useForm({
    resolver: zodResolver(investmentSchema),
    defaultValues: { name: '', asset_type: 'STOCK' as const, custom_asset_type: '', platform: '', current_value: 0 }
  });

  const watchedAssetType = watchInv('asset_type');

  const { control: goalControl, handleSubmit: handleGoalSubmit, reset: resetGoalForm } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: { name: '', description: '', target_amount: 0, deadline: '', status: 'IN_PROGRESS' as const }
  });

  const { control: actionControl, handleSubmit: handleActionSubmit, reset: resetActionForm } = useForm({
    resolver: zodResolver(actionSchema),
    defaultValues: { amount: 0 }
  });

  // Submit functions
  const onDebtSubmit = (data: any) => {
    if (editingDebt) {
      updateDebtMutation.mutate({ id: editingDebt.id, data });
    } else {
      createDebtMutation.mutate(data);
    }
  };

  const onInvSubmit = (data: any) => {
    const payload = {
      ...data,
      custom_asset_type: data.asset_type === 'OTHER' ? data.custom_asset_type : null
    };
    if (editingInvestment) {
      updateInvMutation.mutate({ id: editingInvestment.id, data: payload });
    } else {
      createInvMutation.mutate(payload);
    }
  };

  const onGoalSubmit = (data: any) => {
    setErrorMsg(null);
    const payload = {
      ...data,
      deadline: data.deadline === '' ? null : data.deadline,
    };
    if (editingGoal) {
      updateGoalMutation.mutate({ id: editingGoal.id, data: payload });
    } else {
      createGoalMutation.mutate(payload);
    }
  };

  const onActionSubmit = (data: any) => {
    if (payModalVisible && editingDebt) {
      payDebtMutation.mutate({ debtId: editingDebt.id, amount: data.amount });
    } else if (contribModalVisible && editingGoal) {
      contributeGoalMutation.mutate({ goalId: editingGoal.id, amount: data.amount });
    } else if (invTxModalVisible && editingInvestment) {
      addInvTxMutation.mutate({ invId: editingInvestment.id, type: invTxType, amount: data.amount });
    }
  };

  // Open modals setup
  const openDebtEdit = (d: Debt) => {
    if (activeAccessLevel === 'READ_ONLY') return;
    setEditingDebt(d);
    resetDebtForm({
      counterparty_name: d.counterparty_name,
      total_amount: Number(d.total_amount),
      debt_type: d.debt_type,
      interest_rate: Number(d.interest_rate),
      interest_period: d.interest_period || 'monthly',
      urgency: Number(d.urgency || 5),
      due_date: d.due_date ? new Date(d.due_date).toISOString().split('T')[0] : '',
      start_date: d.start_date ? new Date(d.start_date).toISOString().split('T')[0] : '',
    });
    setDebtModalVisible(true);
  };

  const openDebtPay = (d: Debt) => {
    if (activeAccessLevel === 'READ_ONLY') return;
    setEditingDebt(d);
    resetActionForm({ amount: 0 });
    setPayModalVisible(true);
  };

  const openInvEdit = (inv: Investment) => {
    if (activeAccessLevel === 'READ_ONLY') return;
    setEditingInvestment(inv);
    resetInvForm({
      name: inv.name,
      asset_type: inv.asset_type,
      custom_asset_type: inv.custom_asset_type || '',
      platform: inv.platform || '',
      current_value: Number(inv.current_value),
    });
    setInvestmentModalVisible(true);
  };

  const openInvTx = (inv: Investment, type: typeof invTxType) => {
    if (activeAccessLevel === 'READ_ONLY') return;
    setEditingInvestment(inv);
    setInvTxType(type);
    resetActionForm({ amount: 0 });
    setInvTxModalVisible(true);
  };

  const openGoalEdit = (g: Goal) => {
    if (activeAccessLevel === 'READ_ONLY') return;
    setEditingGoal(g);
    resetGoalForm({
      name: g.name,
      description: g.description || '',
      target_amount: Number(g.target_amount),
      deadline: g.deadline ? new Date(g.deadline).toISOString().split('T')[0] : '',
      status: g.status || 'IN_PROGRESS',
    });
    setErrorMsg(null);
    setGoalModalVisible(true);
  };

  const openGoalContrib = (g: Goal) => {
    if (activeAccessLevel === 'READ_ONLY') return;
    setEditingGoal(g);
    resetActionForm({ amount: 0 });
    setContribModalVisible(true);
  };

  const sortedDebts = useMemo(() => {
    if (!debts) return [];
    return debts.slice().sort((a, b) => (b.urgency || 5) - (a.urgency || 5));
  }, [debts]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const isMainLoading = loadingDebts || loadingInvestments || loadingGoals;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AccountSwitcher />
      <View style={styles.headerToggle}>
        <SegmentedButtons
          value={activeSection}
          onValueChange={(value) => setActiveSection(value as any)}
          buttons={[
            { value: 'debts', label: 'Deudas' },
            { value: 'investments', label: 'Inversiones' },
            { value: 'goals', label: 'Metas' },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isMainLoading ? (
          <ActivityIndicator style={styles.loader} size="large" />
        ) : activeSection === 'debts' ? (
          sortedDebts?.map((d) => {
            const paid = Number(d.total_amount) - Number(d.remaining_amount);
            const progress = Number(d.total_amount) > 0 ? paid / Number(d.total_amount) : 0;
            const urgency = d.urgency || 5;
            const urgencyLabel = urgency >= 8 ? 'Alta' : urgency >= 4 ? 'Media' : 'Baja';
            const urgencyColor = urgency >= 8 ? '#EF4444' : urgency >= 4 ? '#F59E0B' : '#10B981';
            return (
              <Card key={d.id} style={styles.card} onPress={() => openDebtEdit(d)}>
                <Card.Content>
                  <View style={styles.rowBetween}>
                    <View style={styles.flex1}>
                      <View style={styles.urgencyRow}>
                        <Text style={styles.cardTitle}>{d.counterparty_name}</Text>
                        <View style={[styles.urgencyBadge, { backgroundColor: urgencyColor }]}>
                          <Text style={styles.urgencyBadgeText}>{urgencyLabel} {urgency}/10</Text>
                        </View>
                      </View>
                      <Text style={styles.cardSub}>
                        {d.debt_type === 'I_OWE' ? 'Debo a esta persona' : 'Me deben a mí'} • Interés: {d.interest_rate}% {d.interest_period === 'daily' ? 'diario' : d.interest_period === 'weekly' ? 'semanal' : d.interest_period === 'yearly' ? 'anual' : 'mensual'}
                      </Text>
                    </View>
                    {activeAccessLevel !== 'READ_ONLY' && (
                      <IconButton
                        icon="cash-register"
                        iconColor={theme.colors.primary}
                        size={24}
                        onPress={() => openDebtPay(d)}
                      />
                    )}
                  </View>
                  <ProgressBar progress={progress} color={d.debt_type === 'I_OWE' ? '#EF4444' : '#10B981'} style={styles.progress} />
                  <View style={styles.rowBetween}>
                    <Text style={styles.cardProgressText}>Pagado: {formatCurrency(paid)}</Text>
                    <Text style={styles.cardTargetText}>Resta: {formatCurrency(Number(d.remaining_amount))}</Text>
                  </View>
                  <View style={[styles.rowBetween, { marginTop: 6 }]}>
                    <Text style={styles.cardProgressText}>
                      Inicio: {d.start_date ? new Date(d.start_date + 'T00:00:00').toLocaleDateString() : 'N/A'}
                    </Text>
                    <Text style={styles.cardTargetText}>
                      Límite: {d.due_date ? new Date(d.due_date + 'T00:00:00').toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            );
          })
        ) : activeSection === 'investments' ? (
          investments?.map((inv) => {
            const txs = inv.transactions || [];
            const contributed = txs.filter(t => t.type === 'CONTRIBUTION').reduce((sum, t) => sum + Number(t.amount), 0);
            const withdrawn = txs.filter(t => t.type === 'WITHDRAWAL').reduce((sum, t) => sum + Number(t.amount), 0);
            const netCapital = contributed - withdrawn;
            const returns = txs.filter(t => t.type === 'RETURN').reduce((sum, t) => sum + Number(t.amount), 0);

            return (
              <Card key={inv.id} style={styles.card} onPress={() => openInvEdit(inv)}>
                <Card.Content>
                  <View style={styles.rowBetween}>
                    <View>
                      <Text style={styles.cardTitle}>{inv.name}</Text>
                      <Text style={styles.cardSub}>
                        Plataforma: {inv.platform || 'N/A'} • Tipo: {inv.asset_type === 'OTHER' ? (inv.custom_asset_type || 'Otro') : inv.asset_type}
                      </Text>
                    </View>
                    <Text style={styles.invValue}>{formatCurrency(Number(inv.current_value))}</Text>
                  </View>
                  <View style={[styles.rowBetween, { marginTop: 8 }]}>
                    <Text style={styles.cardProgressText}>
                      Invertido: {formatCurrency(netCapital)}
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#10B981' }}>
                      Rendimiento: +{formatCurrency(returns)}
                    </Text>
                  </View>
                  {activeAccessLevel !== 'READ_ONLY' && (
                    <View style={[styles.row, styles.invActions]}>
                      <Button compact mode="outlined" icon="plus" onPress={() => openInvTx(inv, 'CONTRIBUTION')}>
                        Aportar
                      </Button>
                      <Button compact mode="outlined" icon="minus" onPress={() => openInvTx(inv, 'WITHDRAWAL')}>
                        Retirar
                      </Button>
                      <Button compact mode="outlined" icon="trending-up" onPress={() => openInvTx(inv, 'RETURN')}>
                        Rendimiento
                      </Button>
                    </View>
                  )}
                </Card.Content>
              </Card>
            );
          })
        ) : (
          goals?.map((g) => {
            const progress = Number(g.target_amount) > 0 ? Number(g.current_amount) / Number(g.target_amount) : 0;
            const status = g.status || 'IN_PROGRESS';
            const statusLabel = status === 'COMPLETED' ? 'Completada' : status === 'CANCELLED' ? 'Cancelada' : 'En progreso';
            const statusColor = status === 'COMPLETED' ? '#10B981' : status === 'CANCELLED' ? '#EF4444' : '#3B82F6';

            // Calcular abono diario requerido
            const calculateDailyAmount = () => {
              const remaining = Number(g.target_amount) - Number(g.current_amount);
              if (remaining <= 0 || status === 'COMPLETED') return 0;
              if (!g.deadline) return null;
              
              const deadlineDate = new Date(g.deadline);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              deadlineDate.setHours(0, 0, 0, 0);
              
              const diffTime = deadlineDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays <= 0) return remaining;
              return remaining / diffDays;
            };

            const dailyAmount = calculateDailyAmount();

            const getFormattedDeadline = () => {
              if (!g.deadline) return 'Sin límite';
              const parts = g.deadline.split('T')[0].split('-');
              if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
              }
              return new Date(g.deadline).toLocaleDateString();
            };

            return (
              <Card key={g.id} style={styles.card} onPress={() => openGoalEdit(g)}>
                <Card.Content>
                  <View style={styles.rowBetween}>
                    <View style={styles.flex1}>
                      <View style={styles.urgencyRow}>
                        <Text style={styles.cardTitle}>{g.name}</Text>
                        <View style={[styles.urgencyBadge, { backgroundColor: statusColor }]}>
                          <Text style={styles.urgencyBadgeText}>{statusLabel}</Text>
                        </View>
                      </View>
                      {g.description && <Text style={styles.cardSub}>{g.description}</Text>}
                    </View>
                    {activeAccessLevel !== 'READ_ONLY' && (
                      <TouchableOpacity
                        onPress={() => openGoalContrib(g)}
                        style={styles.contribButton}
                      >
                        <Text style={[styles.contribLabel, { color: theme.colors.primary }]}>
                          Abonar
                        </Text>
                        <View style={styles.contribIconWrapper}>
                          <Animated.View
                            style={[
                              styles.contribPulseRing,
                              {
                                transform: [{ scale: pulseAnim }],
                                opacity: opacityAnim,
                                backgroundColor: theme.colors.primary,
                              },
                            ]}
                          />
                          <MaterialCommunityIcons
                            name="piggy-bank"
                            size={22}
                            color={theme.colors.primary}
                          />
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                  <ProgressBar progress={progress} color="#D97706" style={styles.progress} />
                  <View style={styles.rowBetween}>
                    <Text style={styles.cardProgressText}>Ahorrado: {formatCurrency(Number(g.current_amount))} ({(progress * 100).toFixed(0)}%)</Text>
                    <Text style={styles.cardTargetText}>Meta: {formatCurrency(Number(g.target_amount))}</Text>
                  </View>
                  <View style={[styles.rowBetween, { marginTop: 8, borderTopWidth: 1, borderTopColor: theme.dark ? '#334155' : '#E2E8F0', paddingTop: 8 }]}>
                    <Text style={styles.cardDetailText}>
                      Límite: {getFormattedDeadline()}
                    </Text>
                    {dailyAmount !== null && dailyAmount > 0 ? (
                      <Text style={styles.cardDetailText}>
                        Abono diario: {formatCurrency(dailyAmount)}
                      </Text>
                    ) : null}
                  </View>
                </Card.Content>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* FAB to Add item depending on tab */}
      {activeAccessLevel !== 'READ_ONLY' && (
        <View style={styles.fabContainer}>
          <View style={styles.fabRow}>
            <View
              style={[
                styles.fabLabelWrapper,
                {
                  backgroundColor: theme.dark ? '#1E293B' : '#FFFFFF',
                  borderColor: theme.dark ? '#334155' : '#E2E8F0',
                },
              ]}
            >
              <Text style={[styles.fabLabelText, { color: theme.dark ? '#F8FAFC' : '#0F172A' }]}>
                {activeSection === 'debts'
                  ? 'Nueva deuda'
                  : activeSection === 'investments'
                    ? 'Nueva inversión'
                    : 'Nueva meta'}
              </Text>
            </View>
            <View style={styles.fabInsideWrapper}>
              <Animated.View
                style={[
                  styles.pulseRing,
                  {
                    borderColor: theme.colors.primary,
                    borderWidth: 2,
                    backgroundColor: typeof theme.colors.primary === 'string' && theme.colors.primary.startsWith('#')
                      ? (theme.dark ? `${theme.colors.primary}15` : `${theme.colors.primary}08`)
                      : 'transparent',
                    transform: [{ scale: pulseAnim }],
                    opacity: opacityAnim,
                  },
                ]}
              />
              <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                <FAB
                  icon="plus"
                  style={[styles.fabInside, { backgroundColor: theme.colors.primary }]}
                  color="#FFFFFF"
                  onPress={() => {
                    if (activeSection === 'debts') {
                      setEditingDebt(null);
                      resetDebtForm({ counterparty_name: '', total_amount: 0, debt_type: 'I_OWE', interest_rate: 0, interest_period: 'monthly' as const, urgency: 5, due_date: '', start_date: new Date().toISOString().split('T')[0] });
                      setDebtModalVisible(true);
                    } else if (activeSection === 'investments') {
                      setEditingInvestment(null);
                      resetInvForm({ name: '', asset_type: 'STOCK', custom_asset_type: '', platform: '', current_value: 0 });
                      setInvestmentModalVisible(true);
                    } else {
                      setEditingGoal(null);
                      resetGoalForm({ name: '', description: '', target_amount: 0, deadline: '', status: 'IN_PROGRESS' as const });
                      setErrorMsg(null);
                      setGoalModalVisible(true);
                    }
                  }}
                />
              </Animated.View>
            </View>
          </View>
        </View>
      )}

      {/* MODAL: CREATE/EDIT DEBT */}
      <Portal>
        <Dialog visible={debtModalVisible} onDismiss={() => setDebtModalVisible(false)}>
          <Dialog.Title>{editingDebt ? 'Editar Deuda' : 'Nueva Deuda'}</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <Controller
              control={debtControl}
              name="counterparty_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput mode="outlined" label="Contacto / Entidad" onBlur={onBlur} onChangeText={onChange} value={value} />
              )}
            />
            <Controller
              control={debtControl}
              name="total_amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput mode="outlined" label="Monto Total" keyboardType="numeric" onBlur={onBlur} onChangeText={onChange} value={value === 0 ? '' : String(value)} />
              )}
            />
            <Controller
              control={debtControl}
              name="debt_type"
              render={({ field: { onChange, value } }) => (
                <SegmentedButtons
                  value={value}
                  onValueChange={onChange}
                  buttons={[
                    { value: 'I_OWE', label: 'Debo' },
                    { value: 'THEY_OWE_ME', label: 'Me deben' },
                  ]}
                />
              )}
            />
            <Controller
              control={debtControl}
              name="interest_rate"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput mode="outlined" label="Interés (%)" keyboardType="numeric" onBlur={onBlur} onChangeText={onChange} value={value === 0 ? '' : String(value)} />
              )}
            />
            <Controller
              control={debtControl}
              name="interest_period"
              render={({ field: { onChange, value } }) => (
                <View style={{ marginBottom: 12 }}>
                  <Menu
                    visible={interestPeriodMenuVisible}
                    onDismiss={() => setInterestPeriodMenuVisible(false)}
                    anchor={
                      <TouchableOpacity onPress={() => setInterestPeriodMenuVisible(true)}>
                        <View pointerEvents="none">
                          <TextInput
                            mode="outlined"
                            label="Período de Interés"
                            value={
                              value === 'daily'
                                ? 'Diario'
                                : value === 'weekly'
                                  ? 'Semanal'
                                  : value === 'yearly'
                                    ? 'Anual'
                                    : 'Mensual'
                            }
                            right={<TextInput.Icon icon="chevron-down" />}
                          />
                        </View>
                      </TouchableOpacity>
                    }
                  >
                    <Menu.Item onPress={() => { onChange('daily'); setInterestPeriodMenuVisible(false); }} title="Diario" />
                    <Menu.Item onPress={() => { onChange('weekly'); setInterestPeriodMenuVisible(false); }} title="Semanal" />
                    <Menu.Item onPress={() => { onChange('monthly'); setInterestPeriodMenuVisible(false); }} title="Mensual" />
                    <Menu.Item onPress={() => { onChange('yearly'); setInterestPeriodMenuVisible(false); }} title="Anual" />
                  </Menu>
                </View>
              )}
            />
            <Controller
              control={debtControl}
              name="urgency"
              render={({ field: { onChange, value } }) => (
                <View>
                  <Menu
                    visible={urgencyMenuVisible}
                    onDismiss={() => setUrgencyMenuVisible(false)}
                    anchor={
                      <TouchableOpacity onPress={() => setUrgencyMenuVisible(true)}>
                        <View pointerEvents="none">
                          <TextInput
                            mode="outlined"
                            label="Nivel de Urgencia (1-10)"
                            value={value ? `${value}/10` : 'Seleccione Urgencia'}
                            right={<TextInput.Icon icon="chevron-down" />}
                          />
                        </View>
                      </TouchableOpacity>
                    }
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <Menu.Item
                        key={num}
                        onPress={() => {
                          onChange(num);
                          setUrgencyMenuVisible(false);
                        }}
                        title={`${num} - ${num >= 8 ? 'Alta 🔴' : num >= 4 ? 'Media 🟡' : 'Baja 🟢'}`}
                      />
                    ))}
                  </Menu>
                </View>
              )}
            />
            <Controller
              control={debtControl}
              name="due_date"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={{ marginBottom: 12 }}>
                  <TouchableOpacity onPress={() => setShowDueDatePicker(true)}>
                    <View pointerEvents="none">
                      <TextInput
                        mode="outlined"
                        label="Fecha Límite (YYYY-MM-DD)"
                        onBlur={onBlur}
                        value={value || ''}
                        right={<TextInput.Icon icon="calendar" />}
                      />
                    </View>
                  </TouchableOpacity>
                  {showDueDatePicker && Platform.OS !== 'web' && (
                    <DateTimePicker
                      value={value ? new Date(value + 'T12:00:00') : new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        if (Platform.OS === 'android') {
                          setShowDueDatePicker(false);
                        }
                        if (selectedDate) {
                          const year = selectedDate.getFullYear();
                          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                          const day = String(selectedDate.getDate()).padStart(2, '0');
                          onChange(`${year}-${month}-${day}`);
                        }
                      }}
                    />
                  )}
                </View>
              )}
            />
            <Controller
              control={debtControl}
              name="start_date"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
                    <View pointerEvents="none">
                      <TextInput
                        mode="outlined"
                        label="Fecha de Inicio (YYYY-MM-DD)"
                        onBlur={onBlur}
                        value={value || ''}
                        right={<TextInput.Icon icon="calendar" />}
                      />
                    </View>
                  </TouchableOpacity>
                  {showStartDatePicker && Platform.OS !== 'web' && (
                    <DateTimePicker
                      value={value ? new Date(value + 'T12:00:00') : new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        if (Platform.OS === 'android') {
                          setShowStartDatePicker(false);
                        }
                        if (selectedDate) {
                          const year = selectedDate.getFullYear();
                          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                          const day = String(selectedDate.getDate()).padStart(2, '0');
                          onChange(`${year}-${month}-${day}`);
                        }
                      }}
                    />
                  )}
                </View>
              )}
            />
          </Dialog.Content>
          <Dialog.Actions>
            {editingDebt && (
              <Button textColor={theme.colors.error} onPress={() => deleteDebtMutation.mutate(editingDebt.id)}>
                Eliminar
              </Button>
            )}
            <Button onPress={() => setDebtModalVisible(false)}>Cancelar</Button>
            <Button onPress={handleDebtSubmit(onDebtSubmit)}>Guardar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* MODAL: CREATE/EDIT INVESTMENT */}
      <Portal>
        <Dialog visible={investmentModalVisible} onDismiss={() => setInvestmentModalVisible(false)}>
          <Dialog.Title>{editingInvestment ? 'Editar Inversión' : 'Nueva Inversión'}</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <Controller
              control={invControl}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput mode="outlined" label="Nombre" onBlur={onBlur} onChangeText={onChange} value={value} />
              )}
            />
            <Controller
              control={invControl}
              name="platform"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput mode="outlined" label="Plataforma" onBlur={onBlur} onChangeText={onChange} value={value} />
              )}
            />
            <Controller
              control={invControl}
              name="asset_type"
              render={({ field: { onChange, value } }) => (
                <View style={styles.selectContainer}>
                  <Text style={styles.label}>Tipo de Activo</Text>
                  <SegmentedButtons
                    value={value}
                    onValueChange={onChange}
                    buttons={[
                      { value: 'STOCK', label: 'Acción' },
                      { value: 'CRYPTO', label: 'Crypto' },
                      { value: 'REAL_ESTATE', label: 'Inmueble' },
                      { value: 'OTHER', label: 'Otro' },
                    ]}
                  />
                </View>
              )}
            />
            {watchedAssetType === 'OTHER' && (
              <Controller
                control={invControl}
                name="custom_asset_type"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <View style={{ marginBottom: 12 }}>
                    <TextInput
                      mode="outlined"
                      label="Describir tipo de activo"
                      placeholder="Ej. Oro, Arte, Metales"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value || ''}
                      error={!!error}
                    />
                    {error && (
                      <HelperText type="error" visible={!!error} style={{ paddingHorizontal: 0 }}>
                        {error.message}
                      </HelperText>
                    )}
                  </View>
                )}
              />
            )}
            <Controller
              control={invControl}
              name="current_value"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput mode="outlined" label="Monto Actual" keyboardType="numeric" onBlur={onBlur} onChangeText={onChange} value={value === 0 ? '' : String(value)} />
              )}
            />
          </Dialog.Content>
          <Dialog.Actions>
            {editingInvestment && (
              <Button textColor={theme.colors.error} onPress={() => deleteInvMutation.mutate(editingInvestment.id)}>
                Eliminar
              </Button>
            )}
            <Button onPress={() => setInvestmentModalVisible(false)}>Cancelar</Button>
            <Button onPress={handleInvSubmit(onInvSubmit)}>Guardar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* MODAL: CREATE/EDIT GOAL */}
      <Portal>
        <Dialog visible={goalModalVisible} onDismiss={() => setGoalModalVisible(false)}>
          <Dialog.Title>{editingGoal ? 'Editar Meta' : 'Nueva Meta'}</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            {errorMsg && <Text style={{ color: theme.colors.error, marginBottom: 8 }}>{errorMsg}</Text>}
            <Controller
              control={goalControl}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput mode="outlined" label="Nombre" onBlur={onBlur} onChangeText={onChange} value={value} />
              )}
            />
            <Controller
              control={goalControl}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput mode="outlined" label="Descripción" onBlur={onBlur} onChangeText={onChange} value={value} />
              )}
            />
            <Controller
              control={goalControl}
              name="target_amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput mode="outlined" label="Meta de Ahorro" keyboardType="numeric" onBlur={onBlur} onChangeText={onChange} value={value === 0 ? '' : String(value)} />
              )}
            />
            <Controller
              control={goalControl}
              name="deadline"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TouchableOpacity onPress={() => setShowDeadlinePicker(true)}>
                    <View pointerEvents="none">
                      <TextInput
                        mode="outlined"
                        label="Fecha Límite (YYYY-MM-DD)"
                        onBlur={onBlur}
                        value={value || ''}
                        right={<TextInput.Icon icon="calendar" />}
                      />
                    </View>
                  </TouchableOpacity>
                  {showDeadlinePicker && Platform.OS !== 'web' && (
                    <DateTimePicker
                      value={value ? new Date(value + 'T12:00:00') : new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        if (Platform.OS === 'android') {
                          setShowDeadlinePicker(false);
                        }
                        if (selectedDate) {
                          const year = selectedDate.getFullYear();
                          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                          const day = String(selectedDate.getDate()).padStart(2, '0');
                          onChange(`${year}-${month}-${day}`);
                        }
                      }}
                    />
                  )}
                </View>
              )}
            />
            {editingGoal && (
              <Controller
                control={goalControl}
                name="status"
                render={({ field: { onChange, value } }) => (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.label}>Estado de la Meta</Text>
                    <SegmentedButtons
                      value={value}
                      onValueChange={onChange}
                      buttons={[
                        { value: 'IN_PROGRESS', label: 'En progreso' },
                        { value: 'COMPLETED', label: 'Completada' },
                        { value: 'CANCELLED', label: 'Cancelada' },
                      ]}
                    />
                  </View>
                )}
              />
            )}
          </Dialog.Content>
          <Dialog.Actions>
            {editingGoal && (
              <Button textColor={theme.colors.error} onPress={() => deleteGoalMutation.mutate(editingGoal.id)}>
                Eliminar
              </Button>
            )}
            <Button onPress={() => setGoalModalVisible(false)}>Cancelar</Button>
            <Button onPress={handleGoalSubmit(onGoalSubmit)}>Guardar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* MODAL GENERAL ACTION DIALOG (PAY / CONTRIBUTE / INVESTMENT TX) */}
      <Portal>
        <Dialog visible={payModalVisible || contribModalVisible || invTxModalVisible} onDismiss={() => { setPayModalVisible(false); setContribModalVisible(false); setInvTxModalVisible(false); }}>
          <Dialog.Title>
            {payModalVisible ? 'Registrar Pago' : contribModalVisible ? 'Aportar a Meta' : `Movimiento de Inversión (${invTxType === 'CONTRIBUTION' ? 'Aporte' : invTxType === 'WITHDRAWAL' ? 'Retiro' : 'Rendimiento'})`}
          </Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <Controller
              control={actionControl}
              name="amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput mode="outlined" label="Monto" keyboardType="numeric" onBlur={onBlur} onChangeText={onChange} value={value === 0 ? '' : String(value)} />
              )}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => { setPayModalVisible(false); setContribModalVisible(false); setInvTxModalVisible(false); }}>Cancelar</Button>
            <Button onPress={handleActionSubmit(onActionSubmit)}>Registrar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerToggle: {
    padding: 16,
    paddingBottom: 8,
  },
  scrollContainer: {
    padding: 16,
    gap: 12,
    paddingBottom: 80,
  },
  loader: {
    marginTop: 40,
  },
  card: {
    elevation: 2,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSub: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 2,
  },
  progress: {
    height: 8,
    borderRadius: 4,
    marginVertical: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardProgressText: {
    fontSize: 11,
    color: '#64748B',
  },
  cardTargetText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  invValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  invActions: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 30,
    elevation: 6,
  },
  fabContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    margin: 16,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  fabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fabLabelWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  fabLabelText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  fabInsideWrapper: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  fabInside: {
    borderRadius: 30,
    elevation: 6,
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
  actionButton: {
    borderRadius: 8,
  },
  urgencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  urgencyBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  contribButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  contribIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  contribPulseRing: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  contribLabel: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  cardDetailText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
});
