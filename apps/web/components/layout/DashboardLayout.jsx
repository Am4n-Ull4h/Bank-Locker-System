'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Avatar,
  AppBar,
  Badge,
  Box,
  Chip,
  Drawer,
  Divider,
  IconButton,
  ListItemIcon,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Toolbar,
  Typography,
} from '@mui/material';
// Nav icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LockIcon from '@mui/icons-material/Lock';
import GroupIcon from '@mui/icons-material/Group';
import PaymentsIcon from '@mui/icons-material/Payments';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
// Toolbar icons
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import roleNavigation from './roleNavigation';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 264;

const iconMap = {
  Dashboard: DashboardIcon,
  AccountBalance: AccountBalanceIcon,
  PeopleAlt: PeopleAltIcon,
  BarChart: BarChartIcon,
  Person: PersonIcon,
  Settings: SettingsIcon,
  Lock: LockIcon,
  Group: GroupIcon,
  Payments: PaymentsIcon,
  Assignment: AssignmentIcon,
  VpnKey: VpnKeyIcon,
  AssignmentTurnedIn: AssignmentTurnedInIcon,
  ContactSupport: ContactSupportIcon,
};

const roleColors = {
  SUPER_ADMIN: '#f59e0b',
  BRANCH_MANAGER: '#10b981',
  LOCKER_OFFICER: '#6366f1',
  CUSTOMER: '#0ea5e9',
};

const roleLabels = {
  SUPER_ADMIN: 'Super Admin',
  BRANCH_MANAGER: 'Branch Manager',
  LOCKER_OFFICER: 'Locker Officer',
  CUSTOMER: 'Customer',
};

export default function DashboardLayout({ title, children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState(null);

  const links = useMemo(() => roleNavigation[user?.role] || [], [user?.role]);

  const onLogout = () => {
    setAnchorEl(null);
    logout();
    router.replace('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const roleColor = roleColors[user?.role] || '#667eea';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(90deg, #0b2c53 0%, #0f3a6d 60%, #154b87 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 64 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ff9800, #f59e0b)',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 3px 8px rgba(245,158,11,0.4)',
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 20, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} lineHeight={1.1} sx={{ color: 'white' }}>
                BLMS
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, color: 'white', lineHeight: 1 }}>
                Bank Locker Management
              </Typography>
            </Box>
          </Box>

          {/* Right controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton sx={{ color: 'rgba(255,255,255,0.85)' }}>
                <Badge badgeContent={3} color="error">
                  <NotificationsOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Account menu">
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer', px: 1.5, py: 0.75, borderRadius: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <Avatar
                  sx={{ width: 34, height: 34, bgcolor: roleColor, fontSize: '0.85rem', fontWeight: 700, border: '2px solid rgba(255,255,255,0.25)' }}
                >
                  {initials}
                </Avatar>
                <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" fontWeight={700} sx={{ color: 'white', lineHeight: 1.2 }}>{user?.name}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.75, color: 'white', lineHeight: 1 }}>{roleLabels[user?.role] || user?.role}</Typography>
                </Box>
              </Box>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 2 } }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2" fontWeight={700}>{user?.name}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip label={roleLabels[user?.role] || user?.role} size="small" sx={{ bgcolor: roleColor, color: 'white', fontSize: '0.7rem', height: 20 }} />
                </Box>
              </Box>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); router.push('/profile'); }}>
                <PersonIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                My Profile
              </MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); router.push('/settings'); }}>
                <SettingsIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={onLogout} sx={{ color: 'error.main' }}>
                <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
                Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            marginTop: '64px',
            height: 'calc(100% - 64px)',
            borderRight: '1px solid rgba(15,58,109,0.1)',
            background: '#ffffff',
            overflowX: 'hidden',
          },
        }}
      >
        {/* Branch info if available */}
        {user?.branch?.name && (
          <Box sx={{ px: 2.5, py: 1.75, bgcolor: 'rgba(15,58,109,0.04)', borderBottom: '1px solid rgba(15,58,109,0.07)' }}>
            <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Branch
            </Typography>
            <Typography variant="body2" fontWeight={700} color="primary">
              {user.branch.name}
            </Typography>
          </Box>
        )}

        {/* Nav label */}
        <Box sx={{ px: 2.5, pt: user?.branch?.name ? 1.5 : 2, pb: 0.5 }}>
          <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Navigation
          </Typography>
        </Box>

        <List sx={{ px: 1.5, pb: 2 }}>
          {links.map((link) => {
            const isActive = pathname === link.path || pathname?.startsWith(link.path + '/');
            const NavIcon = iconMap[link.icon] || DashboardIcon;
            return (
              <ListItemButton
                key={link.path}
                component={Link}
                href={link.path}
                selected={isActive}
                sx={{
                  my: 0.3,
                  borderRadius: '10px',
                  py: 1.1,
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    background: 'linear-gradient(90deg, rgba(15,58,109,0.12) 0%, rgba(15,58,109,0.06) 100%)',
                    borderLeft: '3px solid #0f3a6d',
                    pl: '13px',
                    '& .MuiListItemText-primary': {
                      color: '#0f3a6d',
                      fontWeight: 700,
                    },
                  },
                  '&:not(.Mui-selected):hover': {
                    bgcolor: 'rgba(15,58,109,0.05)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isActive ? '#0f3a6d' : '#9ca3af',
                    '& svg': { transition: 'transform 0.2s', ...(isActive && { transform: 'scale(1.05)' }) },
                  }}
                >
                  <NavIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 700 : 500 }}
                />
                {isActive && (
                  <Box
                    sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#0f3a6d', mr: 0.5 }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>

        {/* Bottom version label */}
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2, borderTop: '1px solid rgba(15,58,109,0.07)' }}>
          <Typography variant="caption" color="text.disabled" display="block" textAlign="center">
            BLMS v1.0 • {new Date().getFullYear()}
          </Typography>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 2, sm: 3 },
          py: 3,
          mt: '64px',
          ml: `${drawerWidth}px`,
          minHeight: 'calc(100vh - 64px)',
          maxWidth: `calc(100vw - ${drawerWidth}px)`,
        }}
      >
        {title ? (
          <Typography variant="h5" fontWeight={800} mb={2.5} color="text.primary" sx={{ letterSpacing: -0.3 }}>
            {title}
          </Typography>
        ) : null}
        {children}
      </Box>
    </Box>
  );
}
