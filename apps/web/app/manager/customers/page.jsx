'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedPage from '../../../components/layout/ProtectedPage';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/shared/PageHeader';
import DataTable from '../../../components/shared/DataTable';
import { exportToExcel, exportToPDF } from '../../../lib/export';

const kycOptions = ['Pending', 'Verified', 'Rejected'];
const documentTypes = ['CNIC', 'Passport', 'Agreement', 'Photo', 'Other'];
const initialForm = { name: '', email: '', phone: '', password: '', cnic: '', city: '' };
const kycColor = (s) => ({ Verified: 'success', Rejected: 'error', Pending: 'warning' }[s] || 'default');


export default function ManagerCustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [uploadingFor, setUploadingFor] = useState('');
  const [uploadDialogCustomer, setUploadDialogCustomer] = useState(null);
  const [docType, setDocType] = useState('CNIC');
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentsMap, setDocumentsMap] = useState({});
  const [kycFilter, setKycFilter] = useState('');

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const query = kycFilter ? `?kycStatus=${kycFilter}&limit=100` : '?limit=100';
      const response = await api.get(`/customers${query}`);
      const customerList = response.data?.data || [];
      setCustomers(customerList);
      if (customerList.length) {
        const docRes = await api.get('/documents?ownerModel=Customer');
        const docs = docRes.data?.data || [];
        const grouped = docs.reduce((acc, doc) => {
          const key = String(doc.owner);
          if (!acc[key]) acc[key] = [];
          acc[key].push(doc);
          return acc;
        }, {});
        setDocumentsMap(grouped);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCustomers(); }, [kycFilter]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!user?.branch) { toast.error('Branch is not assigned on your account'); return; }
    try {
      setSaving(true);
      await api.post('/customers', { name: form.name, email: form.email, phone: form.phone, password: form.password, cnic: form.cnic, branch: user.branch, address: { city: form.city, country: 'Pakistan' } });
      toast.success('Customer created');
      setForm(initialForm);
      setOpen(false);
      loadCustomers();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create customer');
    } finally {
      setSaving(false);
    }
  };

  const verifyKyc = async (customerId, status) => {
    try {
      await api.put(`/customers/${customerId}/verify-kyc`, { status });
      toast.success(`KYC marked as ${status}`);
      loadCustomers();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update KYC');
    }
  };

  const uploadCustomerDocument = async () => {
    if (!selectedFile || !uploadDialogCustomer) { toast.error('Choose a file first'); return; }
    try {
      setUploadingFor(uploadDialogCustomer._id);
      const payload = new FormData();
      payload.append('file', selectedFile);
      payload.append('owner', uploadDialogCustomer._id);
      payload.append('ownerModel', 'Customer');
      payload.append('documentType', docType);
      await api.post('/documents', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document uploaded');
      setSelectedFile(null);
      setUploadDialogCustomer(null);
      loadCustomers();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadingFor('');
    }
  };

  const columns = [
    { key: 'user.name', label: 'Name', sortable: true, render: (_, row) => row.user?.name || '—' },
    { key: 'user.email', label: 'Email', render: (_, row) => row.user?.email || '—' },
    { key: 'cnic', label: 'CNIC', sortable: true },
    { key: 'kycStatus', label: 'KYC Status', sortable: true, render: (v) => <Chip label={v} size="small" color={kycColor(v)} variant="filled" sx={{ height: 22, fontWeight: 700, fontSize: '0.72rem' }} /> },
    { key: 'documents', label: 'Documents', render: (_, row) => { const count = documentsMap[row._id]?.length || 0; return <Chip label={count ? `${count} file(s)` : 'No files'} size="small" variant="outlined" color={count ? 'primary' : 'default'} />; } },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <Stack direction="row" spacing={0.75}>
        {row.kycStatus !== 'Verified' && <Button size="small" variant="outlined" color="success" startIcon={<VerifiedUserIcon />} onClick={() => verifyKyc(row._id, 'Verified')} sx={{ fontSize: '0.72rem', py: 0.4 }}>Verify</Button>}
        <Button size="small" variant="outlined" startIcon={<UploadFileIcon />} onClick={() => { setUploadDialogCustomer(row); setDocType('CNIC'); setSelectedFile(null); }} sx={{ fontSize: '0.72rem', py: 0.4 }}>Upload</Button>
      </Stack>
    )},
  ];

  return (
    <ProtectedPage allowRoles={['BRANCH_MANAGER']}>
      <DashboardLayout>
        <PageHeader
          title="Customers"
          subtitle="Manage branch customers, KYC verification, and documents"
          breadcrumbs={[{ label: 'Manager' }, { label: 'Customers' }]}
          actions={[
            {
              label: 'Add Customer',
              icon: <AddIcon />,
              onClick: () => setOpen(true),
              variant: 'contained',
            },
            {
              label: 'Export Excel',
              icon: <DownloadIcon />,
              onClick: () => exportToExcel(customers, 'customers-report', columns),
              variant: 'outlined',
            },
            {
              label: 'Export PDF',
              icon: <DownloadIcon />,
              onClick: () => exportToPDF(customers, 'customers-report', columns, 'Customer Directory'),
              variant: 'outlined',
            },
          ]}
          secondaryAction={
            <TextField select size="small" label="KYC Filter" value={kycFilter} onChange={(e) => setKycFilter(e.target.value)} sx={{ minWidth: 140 }}>
              <MenuItem value="">All</MenuItem>
              {kycOptions.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          }
        />
        <DataTable data={customers} columns={columns} loading={loading} searchFields={['cnic', 'kycStatus']} emptyMessage="No customers found." />

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}><PersonOutlineIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />Create Customer</DialogTitle>
          <form onSubmit={onSubmit}>
            <DialogContent sx={{ pt: 1 }}>
              <TextField label="Full Name" fullWidth size="small" margin="dense" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
              <TextField label="Email" type="email" fullWidth size="small" margin="dense" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
              <TextField label="Phone" fullWidth size="small" margin="dense" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              <TextField label="Password" type="password" fullWidth size="small" margin="dense" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
              <TextField label="CNIC" fullWidth size="small" margin="dense" value={form.cnic} onChange={(e) => setForm((p) => ({ ...p, cnic: e.target.value }))} required />
              <TextField label="City" fullWidth size="small" margin="dense" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog open={Boolean(uploadDialogCustomer)} onClose={() => setUploadDialogCustomer(null)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}><UploadFileIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />Upload Document</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            {uploadDialogCustomer && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Customer: <strong>{uploadDialogCustomer.user?.name}</strong></Typography>}
            <TextField select label="Document Type" fullWidth size="small" margin="dense" value={docType} onChange={(e) => setDocType(e.target.value)}>
              {documentTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" component="label" fullWidth>
                {selectedFile ? selectedFile.name : 'Choose File (PDF / Image)'}
                <input hidden type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              </Button>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setUploadDialogCustomer(null)}>Cancel</Button>
            <Button variant="contained" disabled={!selectedFile || Boolean(uploadingFor)} onClick={uploadCustomerDocument}>{uploadingFor ? 'Uploading...' : 'Save'}</Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </ProtectedPage>
  );
}
