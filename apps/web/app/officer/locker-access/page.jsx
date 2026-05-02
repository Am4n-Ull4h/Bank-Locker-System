'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import api from '../../../lib/api';
import ProtectedPage from '../../../components/layout/ProtectedPage';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/shared/PageHeader';
import DataTable from '../../../components/shared/DataTable';

const initialForm = {
  locker: '',
  customer: '',
  purpose: '',
  remarks: '',
};

export default function OfficerLockerAccessPage() {
  const [logs, setLogs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [lockers, setLockers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsRes, customerRes, lockerRes] = await Promise.all([
        api.get('/access-logs?limit=100'),
        api.get('/customers?limit=100'),
        api.get('/lockers?limit=100'),
      ]);
      setLogs(logsRes.data?.data || []);
      setCustomers(customerRes.data?.data || []);
      setLockers(lockerRes.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load access log data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await api.post('/access-logs', {
        locker: form.locker,
        customer: form.customer,
        purpose: form.purpose,
        remarks: form.remarks,
      });
      toast.success('Access log recorded');
      setForm(initialForm);
      setOpen(false);
      loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create access log');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'accessDate', label: 'Date & Time', renderValue: (v) => (v ? new Date(v).toLocaleString() : '—'), sortable: true },
    { key: 'customer.user.name', label: 'Customer', renderValue: (_, row) => row.customer?.user?.name || '—', sortable: true },
    { key: 'locker.lockerNumber', label: 'Locker', renderValue: (_, row) => row.locker?.lockerNumber || '—', sortable: true },
    { key: 'purpose', label: 'Purpose', sortable: true },
    { key: 'approvedBy.name', label: 'Approved By', renderValue: (_, row) => row.approvedBy?.name || '—' },
  ];

  return (
    <ProtectedPage allowRoles={['LOCKER_OFFICER']}>
      <DashboardLayout>
        <PageHeader
          title="Locker Access"
          subtitle="Record and review locker access logs"
          breadcrumbs={[{ label: 'Officer' }, { label: 'Locker Access' }]}
          actionLabel="Record Access"
          actionIcon={<AddIcon />}
          onAction={() => setOpen(true)}
        />

        <DataTable
          data={logs}
          columns={columns}
          loading={loading}
          searchFields={['purpose']}
          emptyMessage="No access logs found."
        />

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>
            <VpnKeyIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
            Record Locker Access
          </DialogTitle>
          <form onSubmit={onSubmit}>
            <DialogContent sx={{ pt: 1 }}>
              <TextField select label="Locker" fullWidth size="small" margin="dense" value={form.locker} onChange={(e) => setForm((prev) => ({ ...prev, locker: e.target.value }))} required>
                {lockers.map((locker) => <MenuItem key={locker._id} value={locker._id}>{locker.lockerNumber}</MenuItem>)}
              </TextField>
              <TextField select label="Customer" fullWidth size="small" margin="dense" value={form.customer} onChange={(e) => setForm((prev) => ({ ...prev, customer: e.target.value }))} required>
                {customers.map((customer) => <MenuItem key={customer._id} value={customer._id}>{customer.user?.name || customer.customerCode}</MenuItem>)}
              </TextField>
              <TextField label="Purpose" fullWidth size="small" margin="dense" value={form.purpose} onChange={(e) => setForm((prev) => ({ ...prev, purpose: e.target.value }))} />
              <TextField label="Remarks" fullWidth size="small" margin="dense" value={form.remarks} onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))} />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </DialogActions>
          </form>
        </Dialog>
      </DashboardLayout>
    </ProtectedPage>
  );
}
