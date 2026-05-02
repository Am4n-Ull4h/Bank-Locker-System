'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Box, Card, CardContent, Chip, CircularProgress, Divider, Grid, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PaymentsIcon from '@mui/icons-material/Payments';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import api from '../../../lib/api';
import ProtectedPage from '../../../components/layout/ProtectedPage';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/shared/StatCard';
import PageHeader from '../../../components/shared/PageHeader';
import { useAuth } from '../../../contexts/AuthContext';

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    allocation: null,
    pendingPayment: null,
    openRequests: 0,
    latestAccess: null,
    recentPayments: [],
    recentRequests: [],
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [allocRes, payRes, reqRes, accessRes] = await Promise.all([
          api.get('/allocations/me'),
          api.get('/payments/me'),
          api.get('/requests/me'),
          api.get('/access-logs?limit=5'),
        ]);

        const allocations = allocRes.data?.data || [];
        const payments = payRes.data?.data || [];
        const requests = reqRes.data?.data || [];
        const accessLogs = accessRes.data?.data || [];

        setData({
          allocation: allocations[0] || null,
          pendingPayment: payments.find((p) => p.status === 'Pending' || p.status === 'Overdue') || null,
          openRequests: requests.filter((r) => !['Resolved', 'Rejected'].includes(r.status)).length,
          latestAccess: accessLogs[0] || null,
          recentPayments: payments.slice(0, 3),
          recentRequests: requests.slice(0, 3),
        });
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statusColor = (status) => {
    const map = { Active: 'success', Expired: 'error', Pending: 'warning', Terminated: 'default' };
    return map[status] || 'default';
  };

  return (
    <ProtectedPage allowRoles={['CUSTOMER']}>
      <DashboardLayout>
        <PageHeader
          title={`Welcome, ${user?.name?.split(' ')[0] || 'Customer'}`}
          subtitle="Your locker account summary and recent activity"
          breadcrumbs={[{ label: 'Customer' }, { label: 'Dashboard' }]}
        />

        {loading ? (
          <Box sx={{ py: 6, display: 'grid', placeItems: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Stat row */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={LockIcon}
                  label="Locker Status"
                  value={data.allocation?.status || 'No Locker'}
                  subtext={data.allocation ? `Locker #${data.allocation.locker?.lockerNumber || '—'}` : 'No allocation found'}
                  color={data.allocation?.status === 'Active' ? 'success' : data.allocation ? 'warning' : 'primary'}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={PaymentsIcon}
                  label="Payment Due"
                  value={data.pendingPayment ? `PKR ${Number(data.pendingPayment.amount || 0).toLocaleString()}` : 'No Due'}
                  subtext={data.pendingPayment ? `Status: ${data.pendingPayment.status}` : 'All payments clear'}
                  color={data.pendingPayment?.status === 'Overdue' ? 'error' : data.pendingPayment ? 'warning' : 'success'}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={ContactSupportIcon}
                  label="Open Requests"
                  value={data.openRequests}
                  subtext="Pending resolution"
                  color={data.openRequests > 0 ? 'warning' : 'success'}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={AccessTimeIcon}
                  label="Last Access"
                  value={data.latestAccess ? new Date(data.latestAccess.accessDate).toLocaleDateString() : 'N/A'}
                  subtext={data.latestAccess ? data.latestAccess.purpose || 'Regular access' : 'No access recorded'}
                  color="info"
                />
              </Grid>
            </Grid>

            {/* Locker info + recent items */}
            <Grid container spacing={3}>
              {/* Locker Details Card */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LockIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      <Typography variant="subtitle1" fontWeight={700}>My Locker</Typography>
                    </Box>
                    {data.allocation ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Locker No.</Typography>
                          <Typography variant="body2" fontWeight={600}>#{data.allocation.locker?.lockerNumber || '—'}</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Category</Typography>
                          <Typography variant="body2" fontWeight={600}>{data.allocation.locker?.category || '—'}</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Status</Typography>
                          <Chip label={data.allocation.status} size="small" color={statusColor(data.allocation.status)} variant="filled" sx={{ height: 22, fontWeight: 600, fontSize: '0.72rem' }} />
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Expires</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {data.allocation.expiryDate ? new Date(data.allocation.expiryDate).toLocaleDateString() : '—'}
                          </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Annual Rent</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            PKR {Number(data.allocation.rentAmount || 0).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                        <InfoOutlinedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
                        <Typography variant="body2">No locker allocated</Typography>
                        <Typography variant="caption">Submit a request to get started</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Recent Payments */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <PaymentsIcon sx={{ color: 'success.main', fontSize: 20 }} />
                      <Typography variant="subtitle1" fontWeight={700}>Recent Payments</Typography>
                    </Box>
                    {data.recentPayments.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                        {data.recentPayments.map((p, i) => (
                          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, borderBottom: i < data.recentPayments.length - 1 ? '1px solid rgba(15,58,109,0.07)' : 'none' }}>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>{p.paymentType || 'Rent'}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {p.paidDate ? new Date(p.paidDate).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="body2" fontWeight={700}>PKR {Number(p.amount || 0).toLocaleString()}</Typography>
                              <Chip label={p.status} size="small" color={p.status === 'Paid' ? 'success' : p.status === 'Overdue' ? 'error' : 'warning'} variant="outlined" sx={{ height: 18, fontSize: '0.68rem', fontWeight: 600 }} />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                        <Typography variant="body2">No payment history yet</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Recent Requests */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <EventAvailableIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                      <Typography variant="subtitle1" fontWeight={700}>Recent Requests</Typography>
                    </Box>
                    {data.recentRequests.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                        {data.recentRequests.map((r, i) => (
                          <Box key={i} sx={{ py: 0.75, borderBottom: i < data.recentRequests.length - 1 ? '1px solid rgba(15,58,109,0.07)' : 'none' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Typography variant="body2" fontWeight={500}>{r.requestType}</Typography>
                              <Chip label={r.status} size="small" color={r.status === 'Resolved' ? 'success' : r.status === 'Rejected' ? 'error' : r.status === 'Approved' ? 'success' : 'warning'} variant="outlined" sx={{ height: 18, fontSize: '0.68rem', fontWeight: 600 }} />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(r.createdAt).toLocaleDateString()} • {r.priority || 'Normal'} priority
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                        <Typography variant="body2">No requests submitted</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </DashboardLayout>
    </ProtectedPage>
  );
}
