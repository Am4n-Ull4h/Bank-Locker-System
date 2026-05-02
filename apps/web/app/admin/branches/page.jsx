'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../../../lib/api';
import ProtectedPage from '../../../components/layout/ProtectedPage';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import DataTable from '../../../components/shared/DataTable';
import PageHeader from '../../../components/shared/PageHeader';
import { exportToExcel, exportToPDF } from '../../../lib/export';

const branchSchema = z.object({
  name: z.string().min(2, 'Branch name is required'),
  code: z.string().min(2, 'Code is required'),
  address: z.object({
    city: z.string().min(2, 'City is required'),
  }),
  phone: z.string().min(10, 'Valid phone required'),
  email: z.string().email().optional(),
});

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(branchSchema),
  });

  const loadBranches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/branches?limit=100');
      setBranches(response.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await api.put(`/branches/${editingId}`, data);
        toast.success('Branch updated successfully');
      } else {
        await api.post('/branches', data);
        toast.success('Branch created successfully');
      }
      reset();
      setOpenDialog(false);
      setEditingId(null);
      loadBranches();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save branch');
    }
  };

  const handleEdit = (branch) => {
    setEditingId(branch._id);
    setValue('name', branch.name);
    setValue('code', branch.code);
    setValue('address.city', branch.address?.city || '');
    setValue('phone', branch.phone);
    setValue('email', branch.email || '');
    setOpenDialog(true);
  };

  const handleDelete = async (branch) => {
    if (confirm(`Delete branch ${branch.name}?`)) {
      try {
        await api.delete(`/branches/${branch._id}`);
        toast.success('Branch deleted');
        loadBranches();
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to delete');
      }
    }
  };

  const columns = [
    { key: 'name', label: 'Branch Name' },
    { key: 'code', label: 'Code' },
    {
      key: 'address',
      label: 'City',
      render: (value) => value?.city || '-',
    },
    {
      key: 'manager',
      label: 'Manager',
      render: (value) => value?.name || '-',
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value) => (
        <Chip size="small" label={value ? 'Active' : 'Inactive'} color={value ? 'success' : 'default'} />
      ),
    },
  ];

  const handleOpenDialog = () => {
    setEditingId(null);
    reset();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    reset();
  };

  return (
    <ProtectedPage allowRoles={['SUPER_ADMIN']}>
      <DashboardLayout>
        <PageHeader
          title="Branch Management"
          subtitle="Manage bank branches and locations"
          breadcrumbs={[{ label: 'Admin' }, { label: 'Branches' }]}
          actions={[
            {
              label: 'New Branch',
              icon: <AddIcon />,
              onClick: handleOpenDialog,
              variant: 'contained',
            },
            {
              label: 'Export Excel',
              icon: <DownloadIcon />,
              onClick: () => exportToExcel(branches, 'branches-report', columns),
              variant: 'outlined',
            },
            {
              label: 'Export PDF',
              icon: <DownloadIcon />,
              onClick: () => exportToPDF(branches, 'branches-report', columns, 'Branch Directory'),
              variant: 'outlined',
            },
          ]}
        />

        <Card>
          <CardContent>
            <DataTable
              data={branches}
              columns={columns}
              loading={loading}
              searchFields={['name', 'code']}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
            {editingId ? 'Edit Branch' : 'Create New Branch'}
          </DialogTitle>
          <DialogContent dividers sx={{ py: 3 }}>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Branch Name"
                fullWidth
                size="small"
                {...register('name')}
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
              />
              <TextField
                label="Code"
                fullWidth
                size="small"
                {...register('code')}
                error={Boolean(errors.code)}
                helperText={errors.code?.message}
              />
              <TextField
                label="City"
                fullWidth
                size="small"
                {...register('address.city')}
                error={Boolean(errors.address?.city)}
                helperText={errors.address?.city?.message}
              />
              <TextField
                label="Phone"
                fullWidth
                size="small"
                {...register('phone')}
                error={Boolean(errors.phone)}
                helperText={errors.phone?.message}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                size="small"
                {...register('email')}
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </ProtectedPage>
  );
}
