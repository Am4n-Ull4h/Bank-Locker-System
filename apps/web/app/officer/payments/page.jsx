'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Button,
  MenuItem,
  TextField,
} from '@mui/material';
import api from '../../../lib/api';
import ProtectedPage from '../../../components/layout/ProtectedPage';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/shared/PageHeader';
import DataTable from '../../../components/shared/DataTable';

const methods = ['Cash', 'Bank Transfer', 'Cheque', 'Online'];

export default function OfficerPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState('');
  const [processForm, setProcessForm] = useState({ paymentMethod: 'Cash', transactionId: '', remarks: '' });

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments?limit=100');
      setPayments(response.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const processPayment = async (paymentId) => {
    try {
      setProcessingId(paymentId);
      await api.put(`/payments/${paymentId}/process`, processForm);
      toast.success('Payment processed');
      setProcessForm({ paymentMethod: 'Cash', transactionId: '', remarks: '' });
      loadPayments();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to process payment');
    } finally {
      setProcessingId('');
    }
  };

  const columns = [
    { key: 'customer.user.name', label: 'Customer', renderValue: (_, row) => row.customer?.user?.name || '—', sortable: true },
    { key: 'locker.lockerNumber', label: 'Locker', renderValue: (_, row) => row.locker?.lockerNumber || '—' },
    { key: 'paymentType', label: 'Type', sortable: true },
    { key: 'amount', label: 'Amount', renderValue: (v) => `PKR ${Number(v || 0).toLocaleString()}`, sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'paymentMethod', label: 'Method', renderValue: (v, row) => row.status === 'Paid' ? (v || '—') : (
      <TextField
        select
        size="small"
        value={processForm.paymentMethod}
        onChange={(e) => setProcessForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
        sx={{ minWidth: 130 }}
      >
        {methods.map((method) => <MenuItem key={method} value={method}>{method}</MenuItem>)}
      </TextField>
    ) },
    {
      key: 'action',
      label: 'Action',
      renderValue: (_, row) => row.status === 'Paid' ? 'Done' : (
        <Button size="small" variant="contained" disabled={processingId === row._id} onClick={() => processPayment(row._id)}>
          {processingId === row._id ? 'Processing...' : 'Process'}
        </Button>
      ),
    },
  ];

  return (
    <ProtectedPage allowRoles={['LOCKER_OFFICER']}>
      <DashboardLayout>
        <PageHeader
          title="Payments"
          subtitle="Process pending customer payments and update statuses"
          breadcrumbs={[{ label: 'Officer' }, { label: 'Payments' }]}
        />

        <DataTable
          data={payments}
          columns={columns}
          loading={loading}
          searchFields={['paymentType', 'status']}
          emptyMessage="No payments found."
        />
      </DashboardLayout>
    </ProtectedPage>
  );
}
