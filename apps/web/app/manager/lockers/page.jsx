'use client';
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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedPage from '../../../components/layout/ProtectedPage';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/shared/PageHeader';
import DataTable from '../../../components/shared/DataTable';

const categories = ['Small', 'Medium', 'Large', 'Premium'];
const statuses = ['Available', 'Allocated', 'Frozen', 'Maintenance', 'Closed'];

const initialForm = { lockerNumber: '', category: 'Small', status: 'Available', annualRent: '', securityDeposit: '' };

const columns = [
  { key: 'lockerNumber', label: 'Locker #', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'status', label: 'Status', type: 'status', sortable: true },
  { key: 'annualRent', label: 'Annual Rent (PKR)', renderValue: (v) => `PKR ${Number(v || 0).toLocaleString()}` },
  { key: 'securityDeposit', label: 'Security Deposit (PKR)', renderValue: (v) => `PKR ${Number(v || 0).toLocaleString()}` },
];

export default function ManagerLockersPage() {
  const { user } = useAuth();
  const [lockers, setLockers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadLockers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/lockers?limit=100');
      setLockers(response.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load lockers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLockers(); }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!user?.branch) { toast.error('Branch is not assigned on your account'); return; }
    try {
      setSaving(true);
      await api.post('/lockers', { ...form, annualRent: Number(form.annualRent), securityDeposit: Number(form.securityDeposit), branch: user.branch });
      toast.success('Locker created');
      setForm(initialForm);
      setOpen(false);
      loadLockers();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create locker');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedPage allowRoles={['BRANCH_MANAGER']}>
      <DashboardLayout>
        <PageHeader
          title="Lockers"
          subtitle="Manage branch lockers, availability, and rental information"
          breadcrumbs={[{ label: 'Manager' }, { label: 'Lockers' }]}
          actionLabel="Add Locker"
          actionIcon={<AddIcon />}
          onAction={() => setOpen(true)}
        />

        <DataTable
          data={lockers}
          columns={columns}
          loading={loading}
          searchFields={['lockerNumber', 'category', 'status']}
          emptyMessage="No lockers found."
        />

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>
            <LockOutlinedIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
            Create New Locker
          </DialogTitle>
          <form onSubmit={onSubmit}>
            <DialogContent sx={{ pt: 1 }}>
              <TextField label="Locker Number" fullWidth size="small" margin="dense" value={form.lockerNumber} onChange={(e) => setForm((p) => ({ ...p, lockerNumber: e.target.value }))} required />
              <TextField select label="Category" fullWidth size="small" margin="dense" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
              <TextField select label="Status" fullWidth size="small" margin="dense" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                {statuses.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              <TextField label="Annual Rent (PKR)" type="number" fullWidth size="small" margin="dense" value={form.annualRent} onChange={(e) => setForm((p) => ({ ...p, annualRent: e.target.value }))} required />
              <TextField label="Security Deposit (PKR)" type="number" fullWidth size="small" margin="dense" value={form.securityDeposit} onChange={(e) => setForm((p) => ({ ...p, securityDeposit: e.target.value }))} required />
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
