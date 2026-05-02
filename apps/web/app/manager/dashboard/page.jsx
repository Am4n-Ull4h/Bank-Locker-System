'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Grid } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GroupIcon from '@mui/icons-material/Group';
import PaymentsIcon from '@mui/icons-material/Payments';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import api from '../../../lib/api';
import ProtectedPage from '../../../components/layout/ProtectedPage';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/shared/StatCard';
import PageHeader from '../../../components/shared/PageHeader';
import QuickActionsPanel from '../../../components/shared/QuickActionsPanel';
import { PieChart, BarChart, LineChart } from '../../../components/shared/Charts';

export default function ManagerDashboardPage() {
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

  const lockerStatusData = stats && {
    labels: ['Available', 'Allocated', 'Other'],
    datasets: [{
      data: [
        stats.availableLockers || 0,
        stats.allocatedLockers || 0,
        Math.max(0, (stats.totalLockers || 0) - (stats.availableLockers || 0) - (stats.allocatedLockers || 0)),
      ],
    }],
  };

  const paymentData = stats && {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Monthly Revenue (PKR)',
      data: [28000, 34000, 42000, 38000, 51000, stats.monthlyRevenue || 47000],
    }],
  };

  const allocationBarData = stats && {
    labels: ['Allocated', 'Available', 'Pending', 'Expiring'],
    datasets: [{
      label: 'Units',
      data: [stats.allocatedLockers || 0, stats.availableLockers || 0, stats.pendingRequests || 0, stats.expiringSoon || 0],
    }],
  };

  return (
    <ProtectedPage allowRoles={['BRANCH_MANAGER']}>
      <DashboardLayout>
        <PageHeader
          title="Branch Dashboard"
          subtitle="Operations overview for your assigned branch"
          breadcrumbs={[{ label: 'Manager' }, { label: 'Dashboard' }]}
        />

        {loading ? (
          <Box sx={{ py: 6, display: 'grid', placeItems: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <QuickActionsPanel role="BRANCH_MANAGER" onNavigate={(path) => router.push(`/${path}`)} />

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={LockIcon}
                  label="Total Lockers"
                  value={stats?.totalLockers ?? 0}
                  subtext={`${stats?.availableLockers ?? 0} available`}
                  color="primary"
                  progress={stats?.totalLockers ? Math.round(((stats?.allocatedLockers || 0) / stats.totalLockers) * 100) : 0}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={CheckCircleOutlineIcon}
                  label="Allocated Lockers"
                  value={stats?.allocatedLockers ?? 0}
                  subtext={`${stats?.expiringSoon ?? 0} expiring soon`}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={GroupIcon}
                  label="Total Customers"
                  value={stats?.totalCustomers ?? 0}
                  subtext="Registered this branch"
                  color="info"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={PaymentsIcon}
                  label="Pending Payments"
                  value={stats?.pendingPayments ?? 0}
                  subtext={`${stats?.overduePayments ?? 0} overdue`}
                  color={stats?.overduePayments > 0 ? 'error' : 'warning'}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={TrendingUpIcon}
                  label="Monthly Revenue"
                  value={`PKR ${(stats?.monthlyRevenue ?? 0).toLocaleString()}`}
                  subtext="This month"
                  color="success"
                  trend="+8.3%"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={AssignmentLateIcon}
                  label="Pending Requests"
                  value={stats?.pendingRequests ?? 0}
                  subtext="Awaiting processing"
                  color="warning"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={LockIcon}
                  label="Expiring Leases"
                  value={stats?.expiringSoon ?? 0}
                  subtext="Next 30 days"
                  color="error"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={CheckCircleOutlineIcon}
                  label="Overdue Payments"
                  value={stats?.overduePayments ?? 0}
                  subtext="Requires follow-up"
                  color="error"
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                {lockerStatusData && <PieChart data={lockerStatusData} title="Locker Status" subtitle="Current allocation breakdown" />}
              </Grid>
              <Grid item xs={12} md={4}>
                {allocationBarData && <BarChart data={allocationBarData} title="Branch Metrics" subtitle="Operational snapshot" />}
              </Grid>
              <Grid item xs={12} md={4}>
                {paymentData && <LineChart data={paymentData} title="Revenue Trend" subtitle="Last 6 months" />}
              </Grid>
            </Grid>
          </>
        )}
      </DashboardLayout>
    </ProtectedPage>
  );
}
