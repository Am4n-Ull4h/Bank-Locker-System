'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  CircularProgress,
  Typography,
  LinearProgress,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import api from '../../../lib/api';
import ProtectedPage from '../../../components/layout/ProtectedPage';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/shared/PageHeader';

const statusColor = (status) => {
  const map = { Active: 'success', Expired: 'error', Terminated: 'default', Pending: 'warning', Suspended: 'warning' };
  return map[status] || 'default';
};

export default function CustomerMyLockerPage() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await api.get('/allocations/me');
        setAllocations(response.data?.data || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load locker details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const active = allocations.find((a) => a.status === 'Active');

  const getDaysRemaining = (expiry) => {
    if (!expiry) return null;
    const diff = new Date(expiry) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getDaysProgress = (start, expiry) => {
    if (!start || !expiry) return 0;
    const total = new Date(expiry) - new Date(start);
    const elapsed = new Date() - new Date(start);
    return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
  };

  return (
    <ProtectedPage allowRoles={['CUSTOMER']}>
      <DashboardLayout>
        <PageHeader
          title="My Locker"
          subtitle="View your locker allocation details and lease information"
          breadcrumbs={[{ label: 'Customer' }, { label: 'My Locker' }]}
        />

        {loading ? (
          <Box sx={{ py: 6, display: 'grid', placeItems: 'center' }}>
            <CircularProgress />
          </Box>
        ) : allocations.length === 0 ? (
          <Card>
            <CardContent sx={{ py: 6, textAlign: 'center' }}>
              <InfoOutlinedIcon sx={{ fontSize: 52, color: '#d1d5db', mb: 1.5 }} />
              <Typography variant="h6" color="text.secondary" fontWeight={600}>No Locker Allocated</Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5, maxWidth: 360, mx: 'auto' }}>
                You don&apos;t have an active locker allocation. Submit a request from the Requests page to get started.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Active locker highlight */}
            {active && (
              <Card sx={{ mb: 3, border: '1px solid rgba(5,150,105,0.25)', background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '14px',
                          background: 'linear-gradient(135deg, #059669, #10b981)',
                          display: 'grid',
                          placeItems: 'center',
                          boxShadow: '0 6px 16px rgba(5,150,105,0.3)',
                        }}
                      >
                        <LockIcon sx={{ color: 'white', fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={800} color="text.primary">
                          Locker #{active.locker?.lockerNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {active.locker?.category} • {active.branch?.name || 'Main Branch'}
                        </Typography>
                        <Chip label="Active Lease" size="small" color="success" variant="filled" sx={{ mt: 0.75, height: 22, fontWeight: 700, fontSize: '0.72rem' }} />
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography variant="body2" color="text.secondary">Annual Rent</Typography>
                      <Typography variant="h5" fontWeight={800} color="success.main">
                        PKR {Number(active.rentAmount || 0).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="caption" color="text.secondary">
                        Lease Period: {new Date(active.startDate).toLocaleDateString()} → {new Date(active.expiryDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" fontWeight={700} color={getDaysRemaining(active.expiryDate) < 30 ? 'error.main' : 'success.main'}>
                        {getDaysRemaining(active.expiryDate)} days remaining
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={getDaysProgress(active.startDate, active.expiryDate)}
                      sx={{ height: 7, borderRadius: 4, bgcolor: 'rgba(5,150,105,0.12)', '& .MuiLinearProgress-bar': { bgcolor: '#059669', borderRadius: 4 } }}
                    />
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* All allocations */}
            <Grid container spacing={3}>
              {allocations.map((a) => (
                <Grid item xs={12} md={6} key={a._id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          Locker #{a.locker?.lockerNumber || '—'}
                        </Typography>
                        <Chip label={a.status} size="small" color={statusColor(a.status)} variant="filled" sx={{ height: 22, fontWeight: 700, fontSize: '0.72rem' }} />
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                        {[
                          { icon: LockIcon, label: 'Category', value: a.locker?.category || '—' },
                          { icon: CalendarTodayIcon, label: 'Start Date', value: new Date(a.startDate).toLocaleDateString() },
                          { icon: CalendarTodayIcon, label: 'Expiry Date', value: new Date(a.expiryDate).toLocaleDateString() },
                          { icon: AccountBalanceWalletIcon, label: 'Annual Rent', value: `PKR ${Number(a.rentAmount || 0).toLocaleString()}` },
                          { icon: AccountBalanceWalletIcon, label: 'Security Deposit', value: `PKR ${Number(a.depositAmount || 0).toLocaleString()}` },
                        ].map((row) => (
                          <Box key={row.label}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                              <Typography variant="body2" fontWeight={600}>{row.value}</Typography>
                            </Box>
                            <Divider sx={{ mt: 1 }} />
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </DashboardLayout>
    </ProtectedPage>
  );
}
