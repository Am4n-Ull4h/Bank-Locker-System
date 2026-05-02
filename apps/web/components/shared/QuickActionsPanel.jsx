'use client';

import { Card, CardContent, Grid, Typography, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentsIcon from '@mui/icons-material/Payments';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import StorageIcon from '@mui/icons-material/Storage';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const actionsByRole = {
  SUPER_ADMIN: [
    {
      id: 'add-user',
      label: 'Add Staff User',
      icon: GroupAddIcon,
      color: '#0f3a6d',
      description: 'Create new admin or officer account',
      action: 'admin/users',
    },
    {
      id: 'add-branch',
      label: 'Manage Branches',
      icon: StorageIcon,
      color: '#059669',
      description: 'Add or edit branch locations',
      action: 'admin/branches',
    },
    {
      id: 'view-reports',
      label: 'System Reports',
      icon: TrendingUpIcon,
      color: '#6366f1',
      description: 'Export audit trails & analytics',
      action: 'admin/reports',
    },
  ],
  BRANCH_MANAGER: [
    {
      id: 'add-customer',
      label: 'Register Customer',
      icon: GroupAddIcon,
      color: '#0f3a6d',
      description: 'Create customer & initiate KYC',
      action: 'manager/customers',
    },
    {
      id: 'verify-kyc',
      label: 'KYC Verification',
      icon: VerifiedUserIcon,
      color: '#059669',
      description: 'Review and verify documents',
      action: 'manager/customers',
    },
    {
      id: 'manage-lockers',
      label: 'Manage Lockers',
      icon: StorageIcon,
      color: '#f59e0b',
      description: 'Allocate or retire locker units',
      action: 'manager/lockers',
    },
    {
      id: 'pending-payments',
      label: 'Pending Requests',
      icon: AssignmentIcon,
      color: '#d97706',
      description: 'Review customer requests',
      action: 'manager/requests',
    },
  ],
  LOCKER_OFFICER: [
    {
      id: 'process-payments',
      label: 'Process Payments',
      icon: PaymentsIcon,
      color: '#0f3a6d',
      description: 'Record payment transactions',
      action: 'officer/payments',
    },
    {
      id: 'locker-access',
      label: 'Grant Access',
      icon: StorageIcon,
      color: '#059669',
      description: 'Approve customer access requests',
      action: 'officer/locker-access',
    },
    {
      id: 'allocations',
      label: 'Allocations',
      icon: AssignmentIcon,
      color: '#f59e0b',
      description: 'View and manage locker assignments',
      action: 'officer/allocations',
    },
  ],
  CUSTOMER: [
    {
      id: 'view-locker',
      label: 'My Locker',
      icon: StorageIcon,
      color: '#0f3a6d',
      description: 'View assigned locker details',
      action: 'customer/my-locker',
    },
    {
      id: 'view-payments',
      label: 'Payments',
      icon: PaymentsIcon,
      color: '#059669',
      description: 'View payment history & dues',
      action: 'customer/payments',
    },
    {
      id: 'submit-request',
      label: 'Support Request',
      icon: AddIcon,
      color: '#6366f1',
      description: 'Submit a service request',
      action: 'customer/requests',
    },
  ],
};

export default function QuickActionsPanel({ role, onNavigate }) {
  const actions = actionsByRole[role] || [];

  if (actions.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: 'text.primary', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={action.id}>
              <Card
                onClick={() => onNavigate?.(action.action)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                  },
                  borderLeft: `5px solid ${action.color}`,
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        background: `${action.color}15`,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ color: action.color, fontSize: 20 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} sx={{ mb: 0.25 }}>
                        {action.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, display: 'block' }}>
                        {action.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
