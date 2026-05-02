'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  MenuItem,
  TextField,
} from '@mui/material';
import api from '../../../lib/api';
import ProtectedPage from '../../../components/layout/ProtectedPage';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/shared/PageHeader';
import DataTable from '../../../components/shared/DataTable';

const resolutionStatuses = ['Approved', 'Rejected', 'Resolved'];

export default function ManagerRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/requests?limit=100');
      setRequests(response.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const resolveRequest = async (requestId, status) => {
    try {
      await api.put(`/requests/${requestId}/resolve`, {
        status,
        resolutionNotes: `Marked as ${status} by branch manager`,
      });
      toast.success(`Request ${status.toLowerCase()}`);
      loadRequests();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to resolve request');
    }
  };

  const columns = [
    { key: 'customer.user.name', label: 'Customer', renderValue: (_, row) => row.customer?.user?.name || '—', sortable: true },
    { key: 'requestType', label: 'Type', sortable: true },
    { key: 'subject', label: 'Subject', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'priority', label: 'Priority', type: 'status', sortable: true },
    {
      key: 'resolve',
      label: 'Resolve',
      renderValue: (_, row) => (
        row.status === 'Resolved'
          ? 'Done'
          : (
            <TextField
              select
              size="small"
              defaultValue=""
              onChange={(e) => resolveRequest(row._id, e.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="" disabled>Choose</MenuItem>
              {resolutionStatuses.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
            </TextField>
          )
      ),
    },
  ];

  return (
    <ProtectedPage allowRoles={['BRANCH_MANAGER']}>
      <DashboardLayout>
        <PageHeader
          title="Requests"
          subtitle="Review and resolve customer service requests"
          breadcrumbs={[{ label: 'Manager' }, { label: 'Requests' }]}
        />
        <DataTable
          data={requests}
          columns={columns}
          loading={loading}
          searchFields={['requestType', 'subject', 'status', 'priority']}
          emptyMessage="No requests found."
        />
      </DashboardLayout>
    </ProtectedPage>
  );
}
