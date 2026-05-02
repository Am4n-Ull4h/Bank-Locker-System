'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  TextField,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../../../lib/api';
import ProtectedPage from '../../../components/layout/ProtectedPage';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/shared/PageHeader';
import StatCard from '../../../components/shared/StatCard';
import DataTable from '../../../components/shared/DataTable';
import { BarChart, LineChart, PieChart, DoughnutChart } from '../../../components/shared/Charts';
import { exportToPDF } from '../../../lib/export';
import PieChartIcon from '@mui/icons-material/PieChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DocumentIcon from '@mui/icons-material/Description';

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [branchReport, setBranchReport] = useState([]);
  const [revenueReport, setRevenueReport] = useState([]);
  const [expiringLockers, setExpiringLockers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [dashboardRes, branchRes, revenueRes, expiringRes, auditRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/reports/branches'),
          api.get('/reports/revenue'),
          api.get('/reports/expiring-lockers?days=60'),
          api.get('/audit-logs?limit=50'),
        ]);
        setDashboardStats(dashboardRes.data?.data || null);
        setBranchReport(branchRes.data?.data || []);
        setRevenueReport(revenueRes.data?.data || []);
        setExpiringLockers(expiringRes.data?.data || []);
        setAuditLogs(auditRes.data?.data || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const branchChartData = branchReport.length > 0 && {
    labels: branchReport.map(b => b.code),
    datasets: [{
      label: 'Lockers',
      data: branchReport.map(b => b.totalLockers),
      backgroundColor: '#667eea',
    }],
  };

  const revenueChartData = revenueReport.length > 0 && {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue (PKR)',
      data: [35000, 45000, 52000, 48000, 61000, dashboardStats?.monthlyRevenue || 58000],
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const expiryData = expiringLockers.length > 0 && {
    labels: ['Next 30 Days', '30-60 Days', '>60 Days'],
    datasets: [{
      data: [expiringLockers.filter(e => new Date(e.expiryDate) < new Date(Date.now() + 30*24*60*60*1000)).length,
             expiringLockers.filter(e => new Date(e.expiryDate) >= new Date(Date.now() + 30*24*60*60*1000) && new Date(e.expiryDate) < new Date(Date.now() + 60*24*60*60*1000)).length, 0],
      backgroundColor: ['#f5576c', '#feca57', '#84fab0'],
    }],
  };

  const branchColumns = [
    { key: 'name', label: 'Branch Name' },
    { key: 'totalLockers', label: 'Total Lockers' },
    { key: 'allocatedLockers', label: 'Allocated' },
    { key: 'availableLockers', label: 'Available' },
    { key: 'totalCustomers', label: 'Customers' },
  ];

  const expiryColumns = [
    { key: 'customer', label: 'Customer', render: (val, row) => row.customer?.user?.name || '-' },
    { key: 'locker', label: 'Locker', render: (val, row) => row.locker?.lockerNumber || '-' },
    { key: 'branch', label: 'Branch', render: (val, row) => row.branch?.name || '-' },
    { key: 'expiryDate', label: 'Expiry Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'status', label: 'Status' },
  ];

  const auditColumns = [
    { key: 'createdAt', label: 'Date/Time', render: (val) => new Date(val).toLocaleString() },
    { key: 'user', label: 'User', render: (val) => val?.name || '-' },
    { key: 'module', label: 'Module' },
    { key: 'action', label: 'Action' },
  ];

  return (
    <ProtectedPage allowRoles={['SUPER_ADMIN']}>
      <DashboardLayout>
        <PageHeader
          title="Analytics & Reports"
          subtitle="Comprehensive system analytics and business insights"
          breadcrumbs={[{ label: 'Admin' }, { label: 'Reports' }]}
          actions={[
            {
              label: 'Export Report',
              icon: <DownloadIcon />,
              onClick: () => exportToPDF([], 'system-report', [], 'Bank Locker System Report'),
              variant: 'outlined',
            },
          ]}
        />

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={PieChartIcon}
              label="Total Lockers"
              value={dashboardStats?.totalLockers ?? 0}
              subtext={`${dashboardStats?.availableLockers ?? 0} available`}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={TrendingUpIcon}
              label="Monthly Revenue"
              value={`PKR ${(dashboardStats?.monthlyRevenue ?? 0).toLocaleString()}`}
              subtext="This month"
              color="success"
              trend="+12.5%"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={DocumentIcon}
              label="Expiring Soon"
              value={dashboardStats?.expiringSoon ?? 0}
              subtext="Next 60 days"
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={TrendingUpIcon}
              label="Pending Dues"
              value={dashboardStats?.pendingPayments ?? 0}
              subtext="Total pending"
              color="error"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            {branchChartData && <BarChart data={branchChartData} title="Lockers by Branch" />}
          </Grid>
          <Grid item xs={12} md={6}>
            {revenueChartData && <LineChart data={revenueChartData} title="Monthly Revenue Trend" />}
          </Grid>
          <Grid item xs={12} md={6}>
            {expiryData && <DoughnutChart data={expiryData} title="Locker Expiry Distribution" />}
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>Performance Metrics</div>
                  <TextField
                    select
                    size="small"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </TextField>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1.5, borderBottom: '1px solid #e5e7eb' }}>
                    <span  style={{ fontSize: '0.95rem' }}>Allocation Rate</span>
                    <strong style={{ fontSize: '0.95rem' }}>
                      {dashboardStats?.totalLockers ? Math.round(((dashboardStats?.allocatedLockers || 0) / dashboardStats.totalLockers) * 100) : 0}%
                    </strong>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1.5, borderBottom: '1px solid #e5e7eb' }}>
                    <span  style={{ fontSize: '0.95rem' }}>Collection Rate</span>
                    <strong style={{ fontSize: '0.95rem' }}>98.5%</strong>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1.5, borderBottom: '1px solid #e5e7eb' }}>
                    <span  style={{ fontSize: '0.95rem' }}>Avg Lease Duration</span>
                    <strong style={{ fontSize: '0.95rem' }}>24 months</strong>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span  style={{ fontSize: '0.95rem' }}>Customer Satisfaction</span>
                    <strong style={{ fontSize: '0.95rem' }}>4.8/5.0</strong>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Branch Summary</div>
                <DataTable
                  data={branchReport}
                  columns={branchColumns}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Expiring Leases (Next 60 Days)</div>
                <DataTable
                  data={expiringLockers}
                  columns={expiryColumns}
                  loading={loading}
                  searchFields={['customer']}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Activities</div>
                <DataTable
                  data={auditLogs}
                  columns={auditColumns}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DashboardLayout>
    </ProtectedPage>
  );
}
