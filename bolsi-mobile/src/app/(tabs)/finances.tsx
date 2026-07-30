import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Modal, Image, TouchableOpacity, FlatList, Platform, Animated, Easing } from 'react-native';
import { Text, Card, Button, TextInput, SegmentedButtons, IconButton, FAB, useTheme, ActivityIndicator, Portal, Dialog, Divider, HelperText } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQuery, useMutation } from '@tanstack/react-query';
import { accountService } from '../../services/account.service';
import { transactionService } from '../../services/transaction.service';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IMAGE_BASE_URL } from '../../services/api';
import { Account, Transaction } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AccountSwitcher } from '../../components/AccountSwitcher';

// Zod schemas for forms
const accountSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  type: z.enum(['BANK', 'CASH', 'CREDIT_CARD']),
  balance: z.coerce.number().min(0, 'El balance debe ser mayor o igual a 0'),
  currency: z.string().default('USD'),
});

const transactionSchema = z.object({
  accountId: z.coerce.number(),
  categoryId: z.coerce.number().optional(),
  amount: z.coerce.number().optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'DOA', 'SAVING']),
  description: z.string().optional(),
  transaction_date: z.string().min(1, 'La fecha es requerida'),
  tithePercent: z.coerce.number().min(0, 'Mínimo 0%').max(100, 'Máximo 100%').optional(),
  offeringPercent: z.coerce.number().min(0, 'Mínimo 0%').max(100, 'Máximo 100%').optional(),
  savingsPercent: z.coerce.number().min(0, 'Mínimo 0%').max(100, 'Máximo 100%').optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'DOA') {
    const t = data.tithePercent ?? 0;
    const o = data.offeringPercent ?? 0;
    const s = data.savingsPercent ?? 0;
    if (t + o + s > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La suma de porcentajes no puede superar el 100%',
        path: ['tithePercent'],
      });
    }
  } else {
    if (data.amount === undefined || data.amount === null || data.amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El monto debe ser mayor que 0',
        path: ['amount'],
      });
    }
    if (data.categoryId === undefined || data.categoryId === null || isNaN(data.categoryId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La categoría es obligatoria',
        path: ['categoryId'],
      });
    }
  }
});

export default function FinancesScreen() {
  const theme = useTheme();
  const { activeUserId, activeAccessLevel, isDoaPractice } = useAuth();
  const [activeSection, setActiveSection] = useState<'accounts' | 'transactions'>('accounts');
  const [refreshing, setRefreshing] = useState(false);

  // Modal control states
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [txModalVisible, setTxModalVisible] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [txDetailVisible, setTxDetailVisible] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Filters for transactions
  const [txFilter, setTxFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'DOA' | 'SAVING'>('ALL');

  // Animation values for the "Add Account" pulsing button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Only run animation when the FAB is actually visible on screen
    const isFabVisible = activeAccessLevel !== 'READ_ONLY' && (
      activeSection === 'accounts' || (activeSection === 'transactions' && txFilter !== 'ALL')
    );
    if (!isFabVisible) return;

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
  }, [activeSection, txFilter, theme.dark, activeAccessLevel]);

  useEffect(() => {
    if (!isDoaPractice && txFilter === 'DOA') {
      setTxFilter('SAVING');
    } else if (isDoaPractice && txFilter === 'SAVING') {
      setTxFilter('DOA');
    }
  }, [isDoaPractice, txFilter]);

  // React Queries
  const { data: accounts, refetch: refetchAccounts, isLoading: loadingAccounts } = useQuery({
    queryKey: ['accounts', activeUserId],
    queryFn: () => accountService.getAccounts(),
  });

  const { data: transactions, refetch: refetchTransactions, isLoading: loadingTx } = useQuery({
    queryKey: ['transactions', activeUserId],
    queryFn: () => transactionService.getTransactions(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => transactionService.getCategories(),
  });

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchAccounts(), refetchTransactions()]);
    setRefreshing(false);
  };

  // Mutators for accounts
  const createAccountMutation = useMutation({
    mutationFn: (data: Partial<Account>) => accountService.createAccount(data),
    onSuccess: () => {
      refetchAccounts();
      setAccountModalVisible(false);
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Account> }) => accountService.updateAccount(id, data),
    onSuccess: () => {
      refetchAccounts();
      setAccountModalVisible(false);
      setEditingAccount(null);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (id: number) => accountService.deleteAccount(id),
    onSuccess: () => {
      refetchAccounts();
      setAccountModalVisible(false);
      setEditingAccount(null);
    },
  });

  // Mutators for transactions
  const createTxMutation = useMutation({
    mutationFn: ({ data, image }: { data: any; image?: string }) => transactionService.createTransaction(data, image),
    onSuccess: () => {
      refetchTransactions();
      refetchAccounts();
      setTxModalVisible(false);
      setReceiptImage(null);
      setTxError(null);
    },
    onError: (err: any) => {
      console.error('Error al crear transacción:', err);
      setTxError(err.response?.data?.error || err.message || 'Error al crear la transacción');
    }
  });

  const deleteTxMutation = useMutation({
    mutationFn: (id: number) => transactionService.deleteTransaction(id),
    onSuccess: () => {
      refetchTransactions();
      refetchAccounts();
      setTxDetailVisible(false);
      setSelectedTx(null);
    },
  });

  // React Hook Forms
  const { control: accountControl, handleSubmit: handleAccountSubmit, reset: resetAccountForm, formState: { errors: accountErrors } } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: '', type: 'BANK', balance: 0, currency: 'USD' }
  });

  const { control: txControl, handleSubmit: handleTxSubmit, reset: resetTxForm, watch: watchTx, formState: { errors: txErrors } } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      accountId: undefined,
      categoryId: undefined,
      amount: 0,
      type: 'EXPENSE',
      description: '',
      transaction_date: new Date().toISOString().split('T')[0],
      tithePercent: 10,
      offeringPercent: 5,
      savingsPercent: 20,
    }
  });

  const txTypeWatch = watchTx('type');
  const watchAccountId = watchTx('accountId');
  const watchTithePercent = watchTx('tithePercent');
  const watchOfferingPercent = watchTx('offeringPercent');
  const watchSavingsPercent = watchTx('savingsPercent');

  const selectedAccount = useMemo(() => {
    return accounts?.find(a => a.id === watchAccountId);
  }, [accounts, watchAccountId]);

  const currentAccountBalance = selectedAccount ? Number(selectedAccount.balance) : 0;

  // Launch Camera or Picker for receipt image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  // Submit methods
  const onAccountSubmit = (data: any) => {
    if (editingAccount) {
      updateAccountMutation.mutate({ id: editingAccount.id, data });
    } else {
      createAccountMutation.mutate(data);
    }
  };

  const onTxSubmit = (data: any) => {
    let apiData: any;
    if (data.type === 'DOA') {
      const selectedAcc = accounts?.find(a => a.id === data.accountId);
      const base = selectedAcc ? Number(selectedAcc.balance) : 0;

      const tPercent = Number(data.tithePercent || 0);
      const oPercent = Number(data.offeringPercent || 0);
      const sPercent = Number(data.savingsPercent || 0);

      const tAmount = Number(((base * tPercent) / 100).toFixed(2));
      const oAmount = Number(((base * oPercent) / 100).toFixed(2));
      const sAmount = Number(((base * sPercent) / 100).toFixed(2));
      const totalDoa = Number((tAmount + oAmount + sAmount).toFixed(2));

      apiData = {
        account_id: data.accountId,
        category_id: null,
        amount: totalDoa,
        type: 'DOA',
        description: data.description || 'Distribución DOA',
        transaction_date: data.transaction_date,
        doa_allocations: [
          { doa_type: 'TITHE', amount: tAmount },
          { doa_type: 'OFFERING', amount: oAmount },
          { doa_type: 'SAVINGS', amount: sAmount }
        ]
      };
    } else {
      apiData = {
        account_id: data.accountId,
        category_id: data.categoryId,
        amount: Number(data.amount),
        type: data.type,
        description: data.description,
        transaction_date: data.transaction_date,
      };
    }
    createTxMutation.mutate({ data: apiData, image: data.type === 'DOA' ? undefined : (receiptImage || undefined) });
  };

  const openEditAccount = (acc: Account) => {
    if (activeAccessLevel === 'READ_ONLY') return;
    setEditingAccount(acc);
    resetAccountForm({
      name: acc.name,
      type: acc.type,
      balance: Number(acc.balance),
      currency: acc.currency,
    });
    setAccountModalVisible(true);
  };

  const openCreateAccount = () => {
    setEditingAccount(null);
    resetAccountForm({ name: '', type: 'BANK', balance: 0, currency: 'USD' });
    setAccountModalVisible(true);
  };

  const openCreateTx = (type: 'EXPENSE' | 'INCOME' | 'DOA' | 'SAVING' = 'EXPENSE') => {
    resetTxForm({
      accountId: accounts && accounts.length > 0 ? accounts[0].id : undefined,
      categoryId: undefined,
      amount: 0,
      type: type,
      description: '',
      transaction_date: new Date().toISOString().split('T')[0],
      tithePercent: 10,
      offeringPercent: 5,
      savingsPercent: 20,
    });
    setReceiptImage(null);
    setTxError(null);
    setTxModalVisible(true);
  };

  const filteredTxs = useMemo(() => {
    if (!transactions) return [];
    if (txFilter === 'ALL') return transactions;
    return transactions.filter(t => t.type === txFilter);
  }, [transactions, txFilter]);

  const doaTotals = useMemo(() => {
    let tithe = 0;
    let offering = 0;
    let savings = 0;
    transactions?.forEach(tx => {
      tx.doa_allocations?.forEach(alloc => {
        if (alloc.doa_type === 'TITHE') tithe += Number(alloc.amount);
        else if (alloc.doa_type === 'OFFERING') offering += Number(alloc.amount);
        else if (alloc.doa_type === 'SAVINGS') savings += Number(alloc.amount);
      });
    });
    return { tithe, offering, savings };
  }, [transactions]);

  const savingsTotal = useMemo(() => {
    let total = 0;
    transactions?.forEach(tx => {
      if (tx.type === 'SAVING') {
        total += Number(tx.amount);
      }
    });
    return total;
  }, [transactions]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AccountSwitcher />
      <View style={styles.headerToggle}>
        <SegmentedButtons
          value={activeSection}
          onValueChange={value => setActiveSection(value as 'accounts' | 'transactions')}
          buttons={[
            { value: 'accounts', label: 'Mis Cuentas' },
            { value: 'transactions', label: 'Transacciones' },
          ]}
        />
      </View>

      {activeSection === 'accounts' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {loadingAccounts ? (
            <ActivityIndicator style={styles.loader} size="large" />
          ) : (
            accounts?.map((acc) => (
              <Card key={acc.id} style={styles.card} onPress={() => openEditAccount(acc)}>
                <Card.Content style={styles.accountCardContent}>
                  <View style={styles.accountIconWrapper}>
                    <IconButton
                      icon={
                        acc.type === 'BANK'
                          ? 'bank'
                          : acc.type === 'CREDIT_CARD'
                            ? 'credit-card'
                            : 'cash-multiple'
                      }
                      size={28}
                      iconColor={theme.colors.primary}
                    />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.accountName}>{acc.name}</Text>
                    <Text style={styles.accountType}>
                      {acc.type === 'BANK'
                        ? 'Banco'
                        : acc.type === 'CREDIT_CARD'
                          ? 'Tarjeta de Crédito'
                          : 'Efectivo'}
                    </Text>
                  </View>
                  <Text style={styles.accountBalance}>{formatCurrency(Number(acc.balance))}</Text>
                </Card.Content>
              </Card>
            ))
          )}
        </ScrollView>
      ) : (
        <View style={styles.flex1}>
          {/* Filters for transactions */}
          <View style={styles.filtersRow}>
            <SegmentedButtons
              value={txFilter}
              onValueChange={value => setTxFilter(value as any)}
              style={styles.filterSegmented}
              buttons={[
                { value: 'ALL', label: 'Todos' },
                { value: 'INCOME', label: 'Ingresos' },
                { value: 'EXPENSE', label: 'Egresos' },
                isDoaPractice
                  ? { value: 'DOA', label: 'DOA' }
                  : { value: 'SAVING', label: 'Ahorro' },
              ]}
            />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {/* Accumulated Summary Card */}
            {!isDoaPractice ? (
              <Card style={styles.doaTotalsCard}>
                <Card.Content>
                  <Text style={styles.doaTotalsTitle}>Acumulado Histórico de Ahorro</Text>
                  <View style={styles.doaTotalsRow}>
                    <View style={styles.doaTotalsCol}>
                      <Text style={styles.doaTotalsLabel}>Ahorro Total 🐷</Text>
                      <Text style={styles.doaTotalsValue}>{formatCurrency(savingsTotal)}</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ) : (
              <Card style={styles.doaTotalsCard}>
                <Card.Content>
                  <Text style={styles.doaTotalsTitle}>Acumulado Histórico DOA</Text>
                  <View style={styles.doaTotalsRow}>
                    <View style={styles.doaTotalsCol}>
                      <Text style={styles.doaTotalsLabel}>Diezmo ⛪</Text>
                      <Text style={styles.doaTotalsValue}>{formatCurrency(doaTotals.tithe)}</Text>
                    </View>
                    <View style={styles.doaTotalsCol}>
                      <Text style={styles.doaTotalsLabel}>Ofrenda 🤲</Text>
                      <Text style={styles.doaTotalsValue}>{formatCurrency(doaTotals.offering)}</Text>
                    </View>
                    <View style={styles.doaTotalsCol}>
                      <Text style={styles.doaTotalsLabel}>Ahorro 🐷</Text>
                      <Text style={styles.doaTotalsValue}>{formatCurrency(doaTotals.savings)}</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            )}

            {loadingTx ? (
              <ActivityIndicator style={styles.loader} size="large" />
            ) : (
              filteredTxs.map((tx) => (
                <Card
                  key={tx.id}
                  style={styles.card}
                  onPress={() => {
                    setSelectedTx(tx);
                    setTxDetailVisible(true);
                  }}
                >
                  <Card.Content style={styles.txCardContent}>
                    <IconButton
                      icon={
                        tx.type === 'INCOME'
                          ? 'arrow-up-circle'
                          : tx.type === 'EXPENSE'
                            ? 'arrow-down-circle'
                            : (tx.type === 'DOA' || tx.type === 'SAVING')
                              ? 'piggy-bank'
                              : 'swap-horizontal'
                      }
                      iconColor={
                        tx.type === 'INCOME'
                          ? '#10B981'
                          : tx.type === 'EXPENSE'
                            ? '#EF4444'
                            : tx.type === 'DOA'
                              ? '#9333EA'
                              : tx.type === 'SAVING'
                                ? '#F59E0B'
                                : theme.colors.primary
                      }
                      size={24}
                    />
                    <View style={styles.flex1}>
                      <Text style={styles.txDesc} numberOfLines={1}>
                        {tx.description || tx.category?.name || 'Movimiento'}
                      </Text>
                      <Text style={styles.txSub}>
                        {tx.account.name} • {new Date(tx.transaction_date).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.txAmount,
                        {
                          color:
                            tx.type === 'INCOME'
                              ? '#10B981'
                              : tx.type === 'EXPENSE'
                                ? '#EF4444'
                                : tx.type === 'DOA'
                                  ? '#9333EA'
                                  : tx.type === 'SAVING'
                                    ? '#F59E0B'
                                    : theme.colors.primary,
                        },
                      ]}
                    >
                      {tx.type === 'EXPENSE' || tx.type === 'DOA' || tx.type === 'SAVING' ? '-' : tx.type === 'INCOME' ? '+' : ''}
                      {formatCurrency(Number(tx.amount))}
                    </Text>
                  </Card.Content>
                </Card>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* FAB to add account or transaction */}
      {activeSection === 'accounts' && activeAccessLevel !== 'READ_ONLY' && (
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
                Nueva cuenta
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
                  onPress={openCreateAccount}
                />
              </Animated.View>
            </View>
          </View>
        </View>
      )}
      {activeSection === 'transactions' && txFilter !== 'ALL' && activeAccessLevel !== 'READ_ONLY' && (
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
                {txFilter === 'INCOME'
                  ? 'Nuevo ingreso'
                  : txFilter === 'EXPENSE'
                    ? 'Nuevo egreso'
                    : txFilter === 'SAVING'
                      ? 'Nuevo ahorro'
                      : 'Nuevo DOA'}
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
                  onPress={() => openCreateTx(txFilter as 'EXPENSE' | 'INCOME' | 'DOA' | 'SAVING')}
                />
              </Animated.View>
            </View>
          </View>
        </View>
      )}

      {/* MODAL: CREATE / EDIT ACCOUNT */}
      <Portal>
        <Dialog visible={accountModalVisible} onDismiss={() => setAccountModalVisible(false)}>
          <Dialog.Title>{editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <Controller
              control={accountControl}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="Nombre de la cuenta"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={!!accountErrors.name}
                />
              )}
            />
            <Controller
              control={accountControl}
              name="type"
              render={({ field: { onChange, value } }) => (
                <View style={styles.segmentedWrapper}>
                  <Text style={styles.label}>Tipo</Text>
                  <SegmentedButtons
                    value={value}
                    onValueChange={onChange}
                    buttons={[
                      { value: 'BANK', label: 'Banco' },
                      { value: 'CASH', label: 'Efectivo' },
                      { value: 'CREDIT_CARD', label: 'Tarjeta' },
                    ]}
                  />
                </View>
              )}
            />
            <Controller
              control={accountControl}
              name="balance"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="Monto Inicial / Actual"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value === 0 ? '' : String(value)}
                  error={!!accountErrors.balance}
                />
              )}
            />
          </Dialog.Content>
          <Dialog.Actions>
            {editingAccount && activeAccessLevel !== 'READ_ONLY' && (
              <Button
                textColor={theme.colors.error}
                onPress={() => deleteAccountMutation.mutate(editingAccount.id)}
              >
                Eliminar
              </Button>
            )}
            <Button onPress={() => setAccountModalVisible(false)}>Cancelar</Button>
            {activeAccessLevel !== 'READ_ONLY' && (
              <Button onPress={handleAccountSubmit(onAccountSubmit)}>Guardar</Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* MODAL: CREATE TRANSACTION */}
      <Portal>
        <Dialog visible={txModalVisible} onDismiss={() => setTxModalVisible(false)}>
          <Dialog.Title>
            {txTypeWatch === 'EXPENSE'
              ? 'Nuevo Egreso'
              : txTypeWatch === 'INCOME'
                ? 'Nuevo Ingreso'
                : txTypeWatch === 'SAVING'
                  ? 'Nuevo Ahorro'
                  : 'Nueva Distribución DOA'}
          </Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView contentContainerStyle={styles.dialogScrollContent}>
              {txError && (
                <View style={{ backgroundColor: theme.colors.errorContainer, padding: 8, borderRadius: 8, marginBottom: 8 }}>
                  <Text style={{ color: theme.colors.error, fontWeight: 'bold' }}>{txError}</Text>
                </View>
              )}

              <Controller
                control={txControl}
                name="accountId"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.selectContainer}>
                    <Text style={styles.label}>Cuenta origen</Text>
                    <FlatList
                      data={accounts}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(item) => String(item.id)}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.chip,
                            value === item.id && { backgroundColor: theme.colors.primaryContainer },
                          ]}
                          onPress={() => onChange(item.id)}
                        >
                          <Text style={{ fontWeight: value === item.id ? '700' : '400' }}>
                            {item.name} ({formatCurrency(Number(item.balance))})
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                    {txErrors.accountId && (
                      <HelperText type="error" visible={true}>
                        {txErrors.accountId.message}
                      </HelperText>
                    )}
                  </View>
                )}
              />

              {txTypeWatch !== 'DOA' && (
                <Controller
                  control={txControl}
                  name="categoryId"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.selectContainer}>
                      <Text style={styles.label}>Categoría</Text>
                      <FlatList
                        data={categories?.filter(c => c.type === txTypeWatch)}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={[
                              styles.chip,
                              value === item.id && { backgroundColor: theme.colors.primaryContainer },
                            ]}
                            onPress={() => onChange(item.id)}
                          >
                            <Text style={{ fontWeight: value === item.id ? '700' : '400' }}>
                              {item.name}
                            </Text>
                          </TouchableOpacity>
                        )}
                      />
                      {txErrors.categoryId && (
                        <HelperText type="error" visible={true}>
                          {txErrors.categoryId.message}
                        </HelperText>
                      )}
                    </View>
                  )}
                />
              )}

              {txTypeWatch !== 'DOA' && (
                <Controller
                  control={txControl}
                  name="amount"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <TextInput
                        mode="outlined"
                        label="Monto"
                        keyboardType="numeric"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value === 0 ? '' : String(value)}
                        error={!!txErrors.amount}
                      />
                      {txErrors.amount && (
                        <HelperText type="error" visible={true}>
                          {txErrors.amount.message}
                        </HelperText>
                      )}
                    </View>
                  )}
                />
              )}

              {txTypeWatch === 'DOA' && (
                <View style={styles.doaFieldsContainer}>
                  <View style={styles.doaBalanceInfo}>
                    <Text style={styles.doaBalanceInfoLabel}>Saldo disponible en la cuenta:</Text>
                    <Text style={styles.doaBalanceInfoValue}>{formatCurrency(currentAccountBalance)}</Text>
                  </View>

                  <Text style={styles.doaSubtitle}>Distribución de Porcentajes</Text>

                  {/* Tithe */}
                  <View style={styles.doaFormRow}>
                    <View style={styles.doaInputWrap}>
                      <Controller
                        control={txControl}
                        name="tithePercent"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            mode="outlined"
                            label="Diezmo (%)"
                            keyboardType="numeric"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value === 0 ? '' : String(value)}
                            error={!!txErrors.tithePercent}
                          />
                        )}
                      />
                    </View>
                    <View style={styles.doaValueWrap}>
                      <Text style={styles.doaCalculatedVal}>
                        Diezmo: {formatCurrency((currentAccountBalance * Number(watchTithePercent || 0)) / 100)}
                      </Text>
                    </View>
                  </View>

                  {/* Offering */}
                  <View style={styles.doaFormRow}>
                    <View style={styles.doaInputWrap}>
                      <Controller
                        control={txControl}
                        name="offeringPercent"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            mode="outlined"
                            label="Ofrenda (%)"
                            keyboardType="numeric"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value === 0 ? '' : String(value)}
                            error={!!txErrors.offeringPercent}
                          />
                        )}
                      />
                    </View>
                    <View style={styles.doaValueWrap}>
                      <Text style={styles.doaCalculatedVal}>
                        Ofrenda: {formatCurrency((currentAccountBalance * Number(watchOfferingPercent || 0)) / 100)}
                      </Text>
                    </View>
                  </View>

                  {/* Savings */}
                  <View style={styles.doaFormRow}>
                    <View style={styles.doaInputWrap}>
                      <Controller
                        control={txControl}
                        name="savingsPercent"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            mode="outlined"
                            label="Ahorro (%)"
                            keyboardType="numeric"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value === 0 ? '' : String(value)}
                            error={!!txErrors.savingsPercent}
                          />
                        )}
                      />
                    </View>
                    <View style={styles.doaValueWrap}>
                      <Text style={styles.doaCalculatedVal}>
                        Ahorro: {formatCurrency((currentAccountBalance * Number(watchSavingsPercent || 0)) / 100)}
                      </Text>
                    </View>
                  </View>

                  {txErrors.tithePercent && (
                    <HelperText type="error" visible={true}>
                      {txErrors.tithePercent.message}
                    </HelperText>
                  )}

                  {/* Total DOA */}
                  <View style={styles.doaTotalContainer}>
                    <Text style={styles.doaTotalLabel}>Total DOA:</Text>
                    <Text style={styles.doaTotalValue}>
                      {formatCurrency(
                        ((currentAccountBalance * Number(watchTithePercent || 0)) / 100) +
                        ((currentAccountBalance * Number(watchOfferingPercent || 0)) / 100) +
                        ((currentAccountBalance * Number(watchSavingsPercent || 0)) / 100)
                      )}
                    </Text>
                  </View>
                </View>
              )}

              <Controller
                control={txControl}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    mode="outlined"
                    label="Descripción (Opcional)"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />

              <Controller
                control={txControl}
                name="transaction_date"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                      <View pointerEvents="none">
                        <TextInput
                          mode="outlined"
                          label="Fecha (YYYY-MM-DD)"
                          onBlur={onBlur}
                          value={value}
                          error={!!txErrors.transaction_date}
                          right={<TextInput.Icon icon="calendar" />}
                        />
                      </View>
                    </TouchableOpacity>
                    {showDatePicker && Platform.OS !== 'web' && (
                      <DateTimePicker
                        value={value ? new Date(value + 'T12:00:00') : new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          if (Platform.OS === 'android') {
                            setShowDatePicker(false);
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
                    {txErrors.transaction_date && (
                      <HelperText type="error" visible={true}>
                        {txErrors.transaction_date.message}
                      </HelperText>
                    )}
                  </View>
                )}
              />

              {txTypeWatch !== 'DOA' && txTypeWatch !== 'SAVING' && (
                <View style={styles.imagePickerWrapper}>
                  <Text style={styles.label}>Comprobante (Opcional)</Text>
                  <View style={styles.row}>
                    <Button mode="outlined" icon="camera" onPress={takePhoto}>
                      Cámara
                    </Button>
                    <Button mode="outlined" icon="image" onPress={pickImage}>
                      Galería
                    </Button>
                  </View>
                  {receiptImage && (
                    <Image source={{ uri: receiptImage }} style={styles.previewImage} />
                  )}
                </View>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setTxModalVisible(false)}>Cancelar</Button>
            <Button onPress={handleTxSubmit(onTxSubmit)}>Crear</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* DETAIL MODAL FOR TRANSACTIONS */}
      <Portal>
        <Dialog visible={txDetailVisible} onDismiss={() => setTxDetailVisible(false)}>
          <Dialog.Title>Detalles del Movimiento</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            {selectedTx && (
              <View style={styles.detailWrapper}>
                <Text style={styles.detailLabel}>Descripción / Categoría:</Text>
                <Text style={styles.detailValue}>
                  {selectedTx.description || selectedTx.category?.name || 'Sin descripción'}
                </Text>

                <Text style={styles.detailLabel}>Monto:</Text>
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color:
                        selectedTx.type === 'INCOME'
                          ? '#10B981'
                          : selectedTx.type === 'EXPENSE'
                            ? '#EF4444'
                            : selectedTx.type === 'DOA'
                              ? '#9333EA'
                              : theme.colors.primary,
                      fontWeight: 'bold',
                    },
                  ]}
                >
                  {formatCurrency(Number(selectedTx.amount))}
                </Text>

                <Text style={styles.detailLabel}>Cuenta:</Text>
                <Text style={styles.detailValue}>{selectedTx.account.name}</Text>

                <Text style={styles.detailLabel}>Fecha:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedTx.transaction_date).toLocaleDateString()}
                </Text>

                {(selectedTx.type === 'INCOME' || selectedTx.type === 'DOA') && selectedTx.doa_allocations && selectedTx.doa_allocations.length > 0 && (
                  <View style={styles.doaWrapper}>
                    <Divider style={styles.divider} />
                    <Text style={styles.detailLabel}>Asignaciones DOA (Diezmo/Ofrenda/Ahorro):</Text>
                    {selectedTx.doa_allocations.map((alloc) => (
                      <Text key={alloc.id} style={styles.doaText}>
                        • {alloc.doa_type === 'TITHE' ? 'Diezmo' : alloc.doa_type === 'OFFERING' ? 'Ofrenda' : 'Ahorro'}: {formatCurrency(Number(alloc.amount))}
                      </Text>
                    ))}
                    <Divider style={styles.divider} />
                  </View>
                )}

                {selectedTx.payment_receipt_image && (
                  <View style={styles.receiptWrapper}>
                    <Text style={styles.detailLabel}>Comprobante cargado:</Text>
                    <Image
                      source={{ uri: `${IMAGE_BASE_URL}${selectedTx.payment_receipt_image}` }}
                      style={styles.receiptImage}
                      resizeMode="contain"
                    />
                  </View>
                )}
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            {selectedTx && activeAccessLevel !== 'READ_ONLY' && (
              <Button
                textColor={theme.colors.error}
                onPress={() => deleteTxMutation.mutate(selectedTx.id)}
              >
                Eliminar
              </Button>
            )}
            <Button onPress={() => setTxDetailVisible(false)}>Cerrar</Button>
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
  accountCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  accountType: {
    fontSize: 12,
    opacity: 0.6,
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filtersRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterSegmented: {
    maxHeight: 40,
  },
  txCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  txDesc: {
    fontSize: 15,
    fontWeight: '600',
  },
  txSub: {
    fontSize: 12,
    opacity: 0.5,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: 'bold',
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
  segmentedWrapper: {
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
  scrollArea: {
    maxHeight: 400,
    paddingHorizontal: 0,
  },
  dialogScrollContent: {
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectContainer: {
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#e2e8f069',
    marginRight: 8,
  },
  imagePickerWrapper: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
  detailWrapper: {
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.5,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
    marginBottom: 8,
  },
  doaWrapper: {
    marginVertical: 4,
    gap: 4,
  },
  divider: {
    marginVertical: 8,
  },
  doaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D9488',
  },
  receiptWrapper: {
    marginTop: 8,
    gap: 6,
  },
  receiptImage: {
    height: 200,
    borderRadius: 8,
  },
  doaTotalsCard: {
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    elevation: 1,
  },
  doaTotalsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#6B21A8',
    marginBottom: 8,
    textAlign: 'center',
  },
  doaTotalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  doaTotalsCol: {
    alignItems: 'center',
    flex: 1,
  },
  doaTotalsLabel: {
    fontSize: 11,
    color: '#5B21B6',
    fontWeight: '600',
    opacity: 0.8,
  },
  doaTotalsValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7E22CE',
    marginTop: 2,
  },
  doaFieldsContainer: {
    gap: 8,
    marginVertical: 4,
  },
  doaSubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 4,
  },
  doaFormRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  doaInputWrap: {
    flex: 1,
  },
  doaValueWrap: {
    flex: 1.2,
    justifyContent: 'center',
  },
  doaCalculatedVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B21A8',
  },
  doaTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginTop: 8,
  },
  doaTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B21A8',
  },
  doaTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7E22CE',
  },
  doaBalanceInfo: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  doaBalanceInfoLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  doaBalanceInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 2,
  },
});