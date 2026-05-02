'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Grid, Card, CardContent, Typography } from '@mui/material';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PaymentsIcon from '@mui/icons-material/Payments';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import api from '../../../lib/api';
import ProtectedPage from '../../../components/layout/ProtectedPage';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/shared/StatCard';
import PageHeader from '../../../components/shared/PageHeader';
import { BarChart, DoughnutChart } from '../../../components/shared/Charts';

export default function OfficerDashboardPage() {
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

  const paymentStatusData = stats && {
    labels: ['Paid (est.)', 'Pending', 'Overdue'],
    datasets: [{
      data: [
        Math.max(0, (stats.allocatedLockers || 0) - (stats.pendingPayments || 0) - (stats.overduePayments || 0)),
        stats.pendingPayments || 0,
        stats.overduePayments || 0,
      ],
    }],
  };

  const workloadData = stats && {
    labels: ['Allocated', 'Available', 'Expiring', 'Overdue'],
    datasets: [{
      label: 'Units',
      data: [stats.allocatedLockers || 0, stats.availableLockers || 0, stats.expiringSoon || 0, stats.overduePayments || 0],
    }],
  };

  const priorityItems = [
    { label: 'Overdue payments need collection', color: '#dc2626', count: stats?.overduePayments || 0 },
    { label: 'Leases expiring in 30 days', color: '#d97706', count: stats?.expiringSoon || 0 },
    { label: 'Pending payment approvals', color: '#0284c7', count: stats?.pendingPayments || 0 },
  ];

  return (
    <ProtectedPage allowRoles={['LOCKER_OFFICER']}>
      <DashboardLayout>
        <PageHeader
          title="Officer Workstation"
          subtitle="Daily operational overview — access, allocations, and payment management"
          breadcrumbs={[{ label: 'Officer' }, { label: 'Dashboard' }]}
        />

        {loading ? (
          <Box sx={{ py: 6, display: 'grid', placeItems: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={AssignmentTurnedInIcon}
                  label="Allocated Lockers"
                  value={stats?.allocatedLockers ?? 0}
                  subtext={`${stats?.availableLockers ?? 0} available`}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={PaymentsIcon}
                  label="Pending Payments"
                  value={stats?.pendingPayments ?? 0}
                  subtext="Awaiting processing"
                  color="warning"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={WarningAmberIcon}
                  label="Overdue Payments"
                  value={stats?.overduePayments ?? 0}
                  subtext="Requires urgent action"
                  color="error"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={EventBusyIcon}
                  label="Expiring Soon"
                  value={stats?.expiringSoon ?? 0}
                  subtext="Next 30 days"
                  color={stats?.expiringSoon > 5 ? 'warning' : 'info'}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                {paymentStatusData && <DoughnutChart data={paymentStatusData} title="Payment Status" subtitle="Allocation payment overview" />}
              </Grid>
              <Grid item xs={12} md={4}>
                {workloadData && <BarChart data={workloadData} title="Workload Summary" subtitle="Key operational figures" />}
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Priority Actions</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {priorityItems.map((item) => (
                        <Box
                          key={item.label}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: `${item.color}0d`,
                            border: `1px solid ${item.color}25`,
                          }}
                        >
                          <Box
                            sx={{
                              minWidth: 36,
                              height: 36,
                              borderRadius: '10px',
                              bgcolor: `${item.color}18`,
                              display: 'grid',
                              placeItems: 'center',
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              color: item.color,
                            }}
                          >
                            {item.count}
                          </Box>
                          <Typography variant="body2" fontWeight={500} color="text.secondary" sx={{ lineHeight: 1.4 }}>
                            {item.label}
                          </Typography>
                        </Box>
                      ))}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, color: 'success.main' }}>
                        <CheckCircleIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption" fontWeight={600}>System running normally</Typography>
                      </Box>
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
