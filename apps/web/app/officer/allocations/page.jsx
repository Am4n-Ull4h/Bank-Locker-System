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
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedPage from '../../../components/layout/ProtectedPage';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/shared/PageHeader';
import DataTable from '../../../components/shared/DataTable';

const initialForm = {
  locker: '',
  customer: '',
  startDate: '',
  expiryDate: '',
  rentAmount: '',
  depositAmount: '',
};

export default function OfficerAllocationsPage() {
  const { user } = useAuth();
  const [allocations, setAllocations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [lockers, setLockers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadScreenData = async () => {
    try {
      setLoading(true);
      const [allocationRes, customerRes, lockerRes] = await Promise.all([
        api.get('/allocations?limit=100'),
        api.get('/customers?limit=100'),
        api.get('/lockers?status=Available&limit=100'),
      ]);
      setAllocations(allocationRes.data?.data || []);
      setCustomers(customerRes.data?.data || []);
      setLockers(lockerRes.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load allocations data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScreenData();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!user?.branch) {
      toast.error('Branch is not assigned on your account');
      return;
    }

    try {
      setSaving(true);
      await api.post('/allocations', {
        locker: form.locker,
        customer: form.customer,
        branch: user.branch,
        startDate: form.startDate,
        expiryDate: form.expiryDate,
        rentAmount: Number(form.rentAmount),
        depositAmount: Number(form.depositAmount || 0),
      });
      toast.success('Locker allocated');
      setForm(initialForm);
      setOpen(false);
      loadScreenData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to allocate locker');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'locker.lockerNumber', label: 'Locker #', renderValue: (_, row) => row.locker?.lockerNumber || '—', sortable: true },
    { key: 'customer.user.name', label: 'Customer', renderValue: (_, row) => row.customer?.user?.name || '—', sortable: true },
    { key: 'startDate', label: 'Start Date', renderValue: (v) => (v ? new Date(v).toLocaleDateString() : '—'), sortable: true },
    { key: 'expiryDate', label: 'Expiry Date', renderValue: (v) => (v ? new Date(v).toLocaleDateString() : '—'), sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
  ];

  return (
    <ProtectedPage allowRoles={['LOCKER_OFFICER']}>
      <DashboardLayout>
        <PageHeader
          title="Allocations"
          subtitle="Assign lockers to customers and track current allocations"
          breadcrumbs={[{ label: 'Officer' }, { label: 'Allocations' }]}
          actionLabel="New Allocation"
          actionIcon={<AddIcon />}
          onAction={() => setOpen(true)}
        />

        <DataTable
          data={allocations}
          columns={columns}
          loading={loading}
          searchFields={['status']}
          emptyMessage="No allocations found."
        />

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>
            <AssignmentTurnedInIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
            Assign Locker
          </DialogTitle>
          <form onSubmit={onSubmit}>
            <DialogContent sx={{ pt: 1 }}>
              <TextField select label="Available Locker" fullWidth size="small" margin="dense" value={form.locker} onChange={(e) => setForm((prev) => ({ ...prev, locker: e.target.value }))} required>
                {lockers.map((locker) => <MenuItem key={locker._id} value={locker._id}>{locker.lockerNumber} ({locker.category})</MenuItem>)}
              </TextField>
              <TextField select label="Customer" fullWidth size="small" margin="dense" value={form.customer} onChange={(e) => setForm((prev) => ({ ...prev, customer: e.target.value }))} required>
                {customers.map((customer) => <MenuItem key={customer._id} value={customer._id}>{customer.user?.name || customer.customerCode}</MenuItem>)}
              </TextField>
              <TextField label="Start Date" type="date" fullWidth size="small" margin="dense" InputLabelProps={{ shrink: true }} value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))} required />
              <TextField label="Expiry Date" type="date" fullWidth size="small" margin="dense" InputLabelProps={{ shrink: true }} value={form.expiryDate} onChange={(e) => setForm((prev) => ({ ...prev, expiryDate: e.target.value }))} required />
              <TextField label="Rent Amount" type="number" fullWidth size="small" margin="dense" value={form.rentAmount} onChange={(e) => setForm((prev) => ({ ...prev, rentAmount: e.target.value }))} required />
              <TextField label="Deposit Amount" type="number" fullWidth size="small" margin="dense" value={form.depositAmount} onChange={(e) => setForm((prev) => ({ ...prev, depositAmount: e.target.value }))} />
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
