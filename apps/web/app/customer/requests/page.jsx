'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import api from '../../../lib/api';
import ProtectedPage from '../../../components/layout/ProtectedPage';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/shared/PageHeader';
import DataTable from '../../../components/shared/DataTable';

const requestTypes = ['New Locker', 'Locker Closure', 'Nominee Update', 'Access Appointment', 'Complaint', 'Support'];

const priorities = ['Low', 'Medium', 'High', 'Urgent'];

export default function CustomerRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [form, setForm] = useState({
    requestType: 'Support',
    priority: 'Medium',
    subject: '',
    description: '',
  });

  const initialForm = {
    requestType: 'Support',
    priority: 'Medium',
    subject: '',
    description: '',
  };

  const hasDraftChanges = useMemo(() => JSON.stringify(form) !== JSON.stringify(initialForm), [form]);

  const sortedRequests = useMemo(
    () => [...requests].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)),
    [requests],
  );

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'ALL') return sortedRequests;
    return sortedRequests.filter((request) => request.status === statusFilter);
  }, [sortedRequests, statusFilter]);

  const requestStats = useMemo(() => {
    const stats = { total: requests.length, pending: 0, resolved: 0, rejected: 0, open: 0 };

    requests.forEach((request) => {
      if (request.status === 'Pending') stats.pending += 1;
      if (request.status === 'Resolved') stats.resolved += 1;
      if (request.status === 'Rejected') stats.rejected += 1;
      if (!['Resolved', 'Rejected'].includes(request.status)) stats.open += 1;
    });

    return stats;
  }, [requests]);

  const requestStatuses = useMemo(
    () => ['ALL', ...new Set(requests.map((request) => request.status).filter(Boolean))],
    [requests],
  );

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasDraftChanges) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasDraftChanges]);

  const loadData = async () => {
    try {
      setLoading(true);
      const requestRes = await api.get('/requests/me');
      setRequests(requestRes.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetDraft = () => {
    setForm(initialForm);
    toast.success('Draft cleared');
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    const subject = form.subject.trim();
    const description = form.description.trim();

    if (subject.length < 5) {
      toast.error('Subject must be at least 5 characters');
      return;
    }

    if (description && description.length < 10) {
      toast.error('Description should be at least 10 characters when provided');
      return;
    }

    try {
      setSaving(true);
      await api.post('/requests/me', {
        ...form,
        subject,
        description,
      });
      toast.success('Request submitted');
      setForm(initialForm);
      loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to submit request');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'createdAt', label: 'Date', renderValue: (v) => (v ? new Date(v).toLocaleDateString() : '—'), sortable: true },
    { key: 'requestType', label: 'Type', sortable: true },
    { key: 'subject', label: 'Subject', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'priority', label: 'Priority', type: 'status', sortable: true },
  ];

  return (
    <ProtectedPage allowRoles={['CUSTOMER']}>
      <DashboardLayout>
        <PageHeader
          title="Requests"
          subtitle="Create and track your service requests"
          breadcrumbs={[{ label: 'Customer' }, { label: 'Requests' }]}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={2}>New Request</Typography>

                {hasDraftChanges && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    You have unsaved request draft changes.
                  </Alert>
                )}

                <form onSubmit={onSubmit}>
                  <TextField select label="Request Type" fullWidth size="small" margin="dense" value={form.requestType} onChange={(e) => setForm((prev) => ({ ...prev, requestType: e.target.value }))}>
                    {requestTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                  </TextField>
                  <TextField select label="Priority" fullWidth size="small" margin="dense" value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}>
                    {priorities.map((priority) => <MenuItem key={priority} value={priority}>{priority}</MenuItem>)}
                  </TextField>
                  <TextField label="Subject" fullWidth size="small" margin="dense" value={form.subject} onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))} required />
                  <TextField label="Description" fullWidth size="small" margin="dense" multiline minRows={3} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Subject: {form.subject.length} characters {form.subject.length > 0 && form.subject.length < 5 ? '(minimum 5)' : ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Description: {form.description.length} characters {form.description.length > 0 && form.description.length < 10 ? '(minimum 10 if provided)' : ''}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button type="submit" variant="contained" fullWidth disabled={saving}>{saving ? 'Submitting...' : 'Submit'}</Button>
                    <Button type="button" variant="outlined" fullWidth onClick={resetDraft} disabled={saving || !hasDraftChanges}>Reset Draft</Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Request Summary</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Chip size="small" label={`Total: ${requestStats.total}`} variant="outlined" />
                  <Chip size="small" label={`Open: ${requestStats.open}`} color="warning" variant="outlined" />
                  <Chip size="small" label={`Resolved: ${requestStats.resolved}`} color="success" variant="outlined" />
                  <Chip size="small" label={`Rejected: ${requestStats.rejected}`} color="error" variant="outlined" />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 2, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <TextField
                  select
                  size="small"
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ minWidth: 140 }}
                >
                  {requestStatuses.map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </TextField>
                <Button variant="outlined" onClick={loadData}>Refresh</Button>
              </Stack>

              <DataTable
                data={filteredRequests}
                columns={columns}
                loading={loading}
                searchFields={['requestType', 'subject', 'status', 'priority']}
                emptyMessage="No requests found for selected filter."
              />
            </Card>
          </Grid>
        </Grid>
      </DashboardLayout>
    </ProtectedPage>
  );
}
