import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Box,
  Typography,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  School,
  People,
  Category,
  Receipt,
  SwapHoriz,
  TrendingUp,
  Alarm,
  Settings,
  ExitToApp,
  MenuBook,
  TrackChanges,
  AdminPanelSettings,
  ExpandLess,
  ExpandMore,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

const SIDEBAR_WIDTH = 260;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavItem[];
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Panel Principal',
    icon: <Dashboard />,
    roles: ['SYSTEM_ADMIN', 'CONTENT_MANAGER'],
    children: [
      { label: 'Dashboard Global', icon: <TrendingUp />, path: '/dashboard', roles: ['SYSTEM_ADMIN'] },
      { label: 'Dashboard Contenidos', icon: <School />, path: '/content-dashboard', roles: ['SYSTEM_ADMIN', 'CONTENT_MANAGER'] },
    ],
  },
  {
    label: 'Control de Usuarios',
    icon: <People />,
    roles: ['SYSTEM_ADMIN'],
    children: [
      { label: 'Directorio de Usuarios', icon: <People />, path: '/users', roles: ['SYSTEM_ADMIN'] },
      { label: 'Auditoría de Accesos', icon: <SwapHoriz />, path: '/shared-access', roles: ['SYSTEM_ADMIN'] },
    ],
  },
  {
    label: 'Configuración Financiera',
    icon: <AccountBalanceWallet />,
    roles: ['SYSTEM_ADMIN'],
    children: [
      { label: 'Categorías Globales', icon: <Category />, path: '/categories', roles: ['SYSTEM_ADMIN'] },
      { label: 'Auditoría Transaccional', icon: <Receipt />, path: '/transactions', roles: ['SYSTEM_ADMIN'] },
    ],
  },
  {
    label: 'Sistema de Aprendizaje',
    icon: <MenuBook />,
    roles: ['SYSTEM_ADMIN', 'CONTENT_MANAGER'],
    children: [
      { label: 'Gestor CMS', icon: <MenuBook />, path: '/content', roles: ['SYSTEM_ADMIN', 'CONTENT_MANAGER'] },
      { label: 'Progreso de Usuarios', icon: <TrackChanges />, path: '/user-progress', roles: ['SYSTEM_ADMIN', 'CONTENT_MANAGER'] },
    ],
  },
  {
    label: 'Operaciones y Alertas',
    icon: <Alarm />,
    roles: ['SYSTEM_ADMIN'],
    children: [
      { label: 'Motor de Recordatorios', icon: <Alarm />, path: '/reminders', roles: ['SYSTEM_ADMIN'] },
    ],
  },
];

const systemItems: NavItem[] = [
  { label: 'Configuración Global', icon: <Settings />, path: '/settings', roles: ['SYSTEM_ADMIN'] },
  { label: 'Mi Perfil', icon: <AdminPanelSettings />, path: '/profile', roles: ['SYSTEM_ADMIN', 'CONTENT_MANAGER'] },
];

function NavGroup({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  if (item.roles && !item.roles.some(hasRole)) return null;

  if (item.children) {
    const visibleChildren = item.children.filter(
      (c) => !c.roles || c.roles.some(hasRole)
    );
    if (visibleChildren.length === 0) return null;

    return (
      <>
        <ListItem disablePadding>
          <ListItemButton onClick={() => setOpen(!open)} sx={{ pl: 2 + depth * 2 }}>
            <ListItemIcon sx={{ color: 'grey.400', minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              slotProps={{ primary: { sx: { fontSize: 13, fontWeight: 600, color: 'grey.300' } } }}
            />
            {open ? <ExpandLess sx={{ color: 'grey.500' }} /> : <ExpandMore sx={{ color: 'grey.500' }} />}
          </ListItemButton>
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List disablePadding>
            {visibleChildren.map((child) => (
              <NavGroup key={child.path} item={child} depth={depth + 1} />
            ))}
          </List>
        </Collapse>
      </>
    );
  }

  const active = location.pathname === item.path;
  return (
    <ListItem disablePadding>
      <ListItemButton
        component={Link}
        to={item.path!}
        selected={active}
        onClick={() => navigate(item.path!)}
        sx={{
          pl: 2 + depth * 2,
          borderRadius: '0 24px 24px 0',
          mr: 1,
          '&.Mui-selected': {
            bgcolor: 'primary.dark',
            '& .MuiListItemIcon-root': { color: 'primary.light' },
            '& .MuiListItemText-primary': { color: 'white', fontWeight: 700 },
          },
          '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
        }}
      >
        <ListItemIcon sx={{ color: active ? 'primary.light' : 'grey.500', minWidth: 34 }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          slotProps={{ primary: { sx: { fontSize: 13, color: active ? 'white' : 'grey.400' } } }}
        />
      </ListItemButton>
    </ListItem>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          bgcolor: '#0f172a',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 3, py: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AccountBalanceWallet sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" color="white" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            Bolsi Admin
          </Typography>
          <Typography variant="caption" color="grey.500">
            v1.0 — Panel
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* Navigation */}
      <Box sx={{ overflowY: 'auto', flexGrow: 1, pt: 1 }}>
        <List dense>
          {navItems.map((item) => (
            <NavGroup key={item.label} item={item} />
          ))}
        </List>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 1 }} />

        <List dense>
          {systemItems.map((item) => (
            <NavGroup key={item.label} item={item} />
          ))}
        </List>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* User footer */}
      <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>
          {user?.first_name?.[0]?.toUpperCase() ?? 'A'}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="body2" color="white" sx={{ fontWeight: 600 }} noWrap>
            {user?.first_name ?? user?.username}
          </Typography>
          <Typography variant="caption" color="grey.500" noWrap>
            {user?.roles?.[0] ?? 'Admin'}
          </Typography>
        </Box>
        <Tooltip title="Cerrar sesión">
          <ListItemButton onClick={handleLogout} sx={{ p: 0.5, borderRadius: 1, minWidth: 0 }}>
            <ExitToApp sx={{ color: 'grey.500', fontSize: 20 }} />
          </ListItemButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
}
