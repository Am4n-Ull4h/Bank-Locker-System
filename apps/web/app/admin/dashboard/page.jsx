'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Grid, Card, CardContent, Typography, LinearProgress } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import GroupIcon from '@mui/icons-material/Group';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import api from '../../../lib/api';
import ProtectedPage from '../../../components/layout/ProtectedPage';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/shared/StatCard';
import PageHeader from '../../../components/shared/PageHeader';
import QuickActionsPanel from '../../../components/shared/QuickActionsPanel';
import { DoughnutChart, LineChart, BarChart } from '../../../components/shared/Charts';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/reports/dashboard');
        setStats(response.data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const allocationRate = stats?.totalLockers
    ? Math.round(((stats.allocatedLockers || 0) / stats.totalLockers) * 100)
    : 0;

  const lockerData = stats && {
    labels: ['Available', 'Allocated', 'Other'],
    datasets: [{
      data: [
        stats.availableLockers || 0,
        stats.allocatedLockers || 0,
        Math.max(0, (stats.totalLockers || 0) - (stats.availableLockers || 0) - (stats.allocatedLockers || 0)),
      ],
    }],
  };

  const revenueData = stats && {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue (PKR)',
      data: [35000, 45000, 52000, 48000, 61000, stats.monthlyRevenue || 58000],
    }],
  };

  const branchData = stats && {
    labels: ['Branch A', 'Branch B', 'Branch C', 'Branch D'],
    datasets: [{
      label: 'Lockers',
      data: [45, 38, 52, 41],
    }],
  };

  const metrics = [
    { label: 'Allocation Rate', value: `${allocationRate}%`, progress: allocationRate, color: '#0f3a6d' },
    { label: 'Pending Payments', value: stats?.pendingPayments ?? 0, progress: null, color: '#d97706' },
    { label: 'Overdue Payments', value: stats?.overduePayments ?? 0, progress: null, color: '#dc2626' },
    { label: 'Expiring Leases', value: stats?.expiringSoon ?? 0, progress: null, color: '#0284c7' },
    { label: 'Collection Rate', value: '98.5%', progress: 98.5, color: '#059669' },
    { label: 'Pending Requests', value: stats?.pendingRequests ?? 0, progress: null, color: '#6366f1' },
  ];

  return (
    <ProtectedPage allowRoles={['SUPER_ADMIN']}>
      <DashboardLayout>
        <PageHeader
          title="System Dashboard"
          subtitle={`Overview as of ${new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
          breadcrumbs={[{ label: 'Admin' }, { label: 'Dashboard' }]}
        />

        {loading ? (
          <Box sx={{ py: 6, display: 'grid', placeItems: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <QuickActionsPanel role="SUPER_ADMIN" onNavigate={(path) => router.push(`/${path}`)} />

            {/* Primary stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={StorageIcon}
                  label="Total Lockers"
                  value={stats?.totalLockers ?? 0}
                  subtext={`${stats?.availableLockers ?? 0} available`}
                  color="primary"
                  progress={allocationRate}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={GroupIcon}
                  label="Total Customers"
                  value={stats?.totalCustomers ?? 0}
                  subtext={`${stats?.pendingPayments ?? 0} pending payments`}
                  color="info"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={TrendingUpIcon}
                  label="Monthly Revenue"
                  value={`PKR ${(stats?.monthlyRevenue ?? 0).toLocaleString()}`}
                  subtext="This month"
                  color="success"
                  trend="+12.5%"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={AccountBalanceIcon}
                  label="Total Branches"
                  value={stats?.totalBranches ?? 0}
                  subtext="All active locations"
                  color="warning"
                />
              </Grid>
            </Grid>

            {/* Secondary stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={AssignmentLateIcon}
                  label="Pending Requests"
                  value={stats?.pendingRequests ?? 0}
                  subtext="Awaiting review"
                  color="warning"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={EventBusyIcon}
                  label="Overdue Payments"
                  value={stats?.overduePayments ?? 0}
                  subtext="Requires collection"
                  color="error"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={StorageIcon}
                  label="Expiring Leases"
                  value={stats?.expiringSoon ?? 0}
                  subtext="Next 30 days"
                  color={stats?.expiringSoon > 5 ? 'warning' : 'info'}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={TrendingUpIcon}
                  label="Allocated Lockers"
                  value={stats?.allocatedLockers ?? 0}
                  subtext={`${allocationRate}% occupancy`}
                  color="primary"
                />
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                {lockerData && <DoughnutChart data={lockerData} title="Locker Distribution" subtitle="Current locker status breakdown" />}
              </Grid>
              <Grid item xs={12} md={4}>
                {branchData && <BarChart data={branchData} title="Lockers per Branch" subtitle="Branch capacity comparison" />}
              </Grid>
              <Grid item xs={12} md={4}>
                {revenueData && <LineChart data={revenueData} title="Revenue Trend" subtitle="Monthly revenue (last 6 months)" />}
              </Grid>
            </Grid>

            {/* Metrics table */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                      System KPIs
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
                      {metrics.map((m) => (
                        <Box key={m.label}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: m.progress !== null ? 0.5 : 0 }}>
                            <Typography variant="body2" color="text.secondary">{m.label}</Typography>
                            <Typography variant="body2" fontWeight={700} sx={{ color: m.color }}>{m.value}</Typography>
                          </Box>
                          {m.progress !== null && (
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(m.progress, 100)}
                              sx={{
                                height: 5,
                                borderRadius: 3,
                                bgcolor: `${m.color}18`,
                                '& .MuiLinearProgress-bar': { bgcolor: m.color, borderRadius: 3 },
                              }}
                            />
                          )}
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                      Recent Activity
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {[
                        { title: 'New locker allocated', time: '2 hours ago', color: '#0f3a6d' },
                        { title: 'Payment received – PKR 12,000', time: '4 hours ago', color: '#059669' },
                        { title: 'Customer KYC verified', time: '6 hours ago', color: '#0284c7' },
                        { title: 'Branch report generated', time: '1 day ago', color: '#6366f1' },
                        { title: 'New user registered', time: '1 day ago', color: '#f59e0b' },
                      ].map((item, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                          <Box sx={{ width: 3, minHeight: 36, borderRadius: '2px', bgcolor: item.color, mt: 0.3 }} />
                          <Box>
                            <Typography variant="body2" fontWeight={500}>{item.title}</Typography>
                            <Typography variant="caption" color="text.disabled">{item.time}</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
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
