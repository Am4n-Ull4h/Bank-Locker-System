'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import ProtectedPage from '../../../components/layout/ProtectedPage';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/shared/PageHeader';
import DataTable from '../../../components/shared/DataTable';

export default function CustomerPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await api.get('/payments/me');
        setPayments(response.data?.data || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const columns = [
    { key: 'createdAt', label: 'Date', renderValue: (v) => (v ? new Date(v).toLocaleDateString() : '—'), sortable: true },
    { key: 'locker.lockerNumber', label: 'Locker #', renderValue: (_, row) => row.locker?.lockerNumber || '—' },
    { key: 'paymentType', label: 'Type', sortable: true },
    { key: 'amount', label: 'Amount', renderValue: (v) => `PKR ${Number(v || 0).toLocaleString()}`, sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'receiptNumber', label: 'Receipt #', renderValue: (v) => v || '—' },
  ];

  return (
    <ProtectedPage allowRoles={['CUSTOMER']}>
      <DashboardLayout>
        <PageHeader
          title="Payments"
          subtitle="View your payment history and receipts"
          breadcrumbs={[{ label: 'Customer' }, { label: 'Payments' }]}
        />

        <DataTable
          data={payments}
          columns={columns}
          loading={loading}
          searchFields={['paymentType', 'status', 'receiptNumber']}
          emptyMessage="No payments found."
        />
      </DashboardLayout>
    </ProtectedPage>
  );
}
