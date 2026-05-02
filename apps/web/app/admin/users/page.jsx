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
  MenuItem,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../../../lib/api';
import ProtectedPage from '../../../components/layout/ProtectedPage';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import DataTable from '../../../components/shared/DataTable';
import PageHeader from '../../../components/shared/PageHeader';
import { exportToExcel, exportToPDF } from '../../../lib/export';

const roles = ['SUPER_ADMIN', 'BRANCH_MANAGER', 'LOCKER_OFFICER'];

const userSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(roles),
  branch: z.string().optional(),
});

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: { role: 'LOCKER_OFFICER', branch: '' }
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, branchesRes] = await Promise.all([
        api.get('/users?limit=200'),
        api.get('/branches?limit=200'),
      ]);
      setUsers(usersRes.data?.data || []);
      setBranches(branchesRes.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (data) => {
    try {
      const payload = { ...data };
      if (!payload.branch) delete payload.branch;
      await api.post('/users', payload);
      toast.success('User created successfully');
      reset();
      setOpenDialog(false);
      loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDelete = async (user) => {
    if (confirm(`Deactivate user ${user.name}?`)) {
      try {
        await api.delete(`/users/${user._id}`);
        toast.success('User deactivated');
        loadData();
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to deactivate');
      }
    }
  };

  const filteredUsers = roleFilter
    ? users.filter((user) => user.role === roleFilter)
    : users;

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (value) => (
        <Chip size="small" label={value} color="primary" variant="outlined" />
      ),
    },
    {
      key: 'branch',
      label: 'Branch',
      render: (value, row) => row.branch?.name || '-',
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value) => (
        <Chip size="small" label={value ? 'Active' : 'Inactive'} color={value ? 'success' : 'default'} />
      ),
    },
  ];

  return (
    <ProtectedPage allowRoles={['SUPER_ADMIN']}>
      <DashboardLayout>
        <PageHeader
          title="User Management"
          subtitle="Manage staff and system users"
          breadcrumbs={[{ label: 'Admin' }, { label: 'Users' }]}
          actions={[
            {
              label: 'New User',
              icon: <AddIcon />,
              onClick: () => setOpenDialog(true),
              variant: 'contained',
            },
            {
              label: 'Export Excel',
              icon: <DownloadIcon />,
              onClick: () => exportToExcel(filteredUsers, 'users-report', columns),
              variant: 'outlined',
            },
            {
              label: 'Export PDF',
              icon: <DownloadIcon />,
              onClick: () => exportToPDF(filteredUsers, 'users-report', columns, 'System Users Report'),
              variant: 'outlined',
            },
          ]}
        />

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Users List
              </Typography>
              <TextField
                select
                size="small"
                label="Filter by Role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="">All Roles</MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <DataTable
              data={filteredUsers}
              columns={columns}
              loading={loading}
              searchFields={['name', 'email']}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>Create New User</DialogTitle>
          <DialogContent dividers sx={{ py: 3 }}>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Full Name"
                fullWidth
                size="small"
                {...register('name')}
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
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
              <TextField
                label="Phone"
                fullWidth
                size="small"
                {...register('phone')}
                error={Boolean(errors.phone)}
                helperText={errors.phone?.message}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                size="small"
                {...register('password')}
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
              />
              <TextField
                select
                label="Role"
                fullWidth
                size="small"
                defaultValue="LOCKER_OFFICER"
                {...register('role')}
                error={Boolean(errors.role)}
                helperText={errors.role?.message}
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Branch (Optional)"
                fullWidth
                size="small"
                {...register('branch')}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {branches.map((branch) => (
                  <MenuItem key={branch._id} value={branch._id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </ProtectedPage>
  );
}
