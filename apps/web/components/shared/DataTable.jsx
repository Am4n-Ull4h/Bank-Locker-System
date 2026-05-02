'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  CircularProgress,
  Typography,
  Paper,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

// Map common status values to Chip colors
const statusColorMap = {
  active: 'success',
  allocated: 'primary',
  available: 'success',
  pending: 'warning',
  paid: 'success',
  overdue: 'error',
  approved: 'success',
  rejected: 'error',
  resolved: 'default',
  frozen: 'info',
  maintenance: 'warning',
  closed: 'default',
  terminated: 'error',
  expired: 'error',
  verified: 'success',
  unverified: 'warning',
  inactive: 'default',
};

function getStatusChipColor(val) {
  if (!val) return 'default';
  return statusColorMap[String(val).toLowerCase()] || 'default';
}

function getNestedValue(row, key) {
  if (!key) return undefined;
  if (!String(key).includes('.')) return row?.[key];
  return String(key).split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), row);
}

function normalizeValueForSort(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;

  if (value instanceof Date) return value.getTime();

  const asDate = new Date(value);
  if (!Number.isNaN(asDate.getTime()) && String(value).length >= 8) {
    return asDate.getTime();
  }

  if (!Number.isNaN(Number(value)) && String(value).trim() !== '') {
    return Number(value);
  }

  return String(value).toLowerCase();
}

export default function DataTable({
  data = [],
  columns = [],
  loading = false,
  onEdit = null,
  onDelete = null,
  onView = null,
  searchFields = [],
  emptyMessage = 'No records found',
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, dir: 'asc' });

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
    setPage(0);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((row) =>
      searchFields.some((field) =>
        String(getNestedValue(row, field) ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, searchFields]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const av = normalizeValueForSort(getNestedValue(a, sortConfig.key));
      const bv = normalizeValueForSort(getNestedValue(b, sortConfig.key));

      let result = 0;
      if (typeof av === 'number' && typeof bv === 'number') {
        result = av - bv;
      } else {
        result = String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
      }

      return sortConfig.dir === 'asc' ? result : -result;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(
    () => sortedData.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [sortedData, page, rowsPerPage]
  );

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const hasActions = onEdit || onDelete || onView;

  return (
    <Box>
      {searchFields.length > 0 && (
        <TextField
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
          size="small"
          sx={{ mb: 2, minWidth: 260 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => { setSearchTerm(''); setPage(0); }}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      )}

      <Paper
        variant="outlined"
        sx={{ borderRadius: 2, overflow: 'hidden', borderColor: 'rgba(15,58,109,0.1)' }}
      >
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    sortDirection={sortConfig.key === col.key ? sortConfig.dir : false}
                    sx={{
                      fontWeight: 700,
                      color: '#0f3a6d',
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      bgcolor: 'rgba(15,58,109,0.04)',
                      whiteSpace: 'nowrap',
                      py: 1.5,
                    }}
                  >
                    {col.sortable !== false ? (
                      <TableSortLabel
                        active={sortConfig.key === col.key}
                        direction={sortConfig.key === col.key ? sortConfig.dir : 'asc'}
                        onClick={() => handleSort(col.key)}
                        sx={{ '& .MuiTableSortLabel-icon': { fontSize: 14 } }}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : col.label}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: '#0f3a6d',
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      bgcolor: 'rgba(15,58,109,0.04)',
                    }}
                  >
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={36} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>Loading data...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} align="center" sx={{ py: 6 }}>
                    <InboxOutlinedIcon sx={{ fontSize: 44, color: '#d1d5db', mb: 1 }} />
                    <Typography variant="body2" color="text.disabled" fontWeight={500}>
                      {searchTerm ? `No results matching "${searchTerm}"` : emptyMessage}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, idx) => (
                  <TableRow
                    key={idx}
                    hover
                    sx={{
                      '&:last-child td': { border: 0 },
                      '&:nth-of-type(even)': { bgcolor: 'rgba(15,58,109,0.015)' },
                      transition: 'background 0.15s',
                    }}
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key} sx={{ py: 1.5, fontSize: '0.875rem' }}>
                        {col.render || col.renderValue
                          ? (col.render || col.renderValue)(getNestedValue(row, col.key), row)
                          : renderValue(getNestedValue(row, col.key), col)}
                      </TableCell>
                    ))}
                    {hasActions && (
                      <TableCell sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {onView && (
                            <IconButton
                              size="small"
                              onClick={() => onView(row)}
                              title="View"
                              sx={{ color: '#6366f1', '&:hover': { bgcolor: 'rgba(99,102,241,0.1)' } }}
                            >
                              <VisibilityIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          )}
                          {onEdit && (
                            <IconButton
                              size="small"
                              onClick={() => onEdit(row)}
                              title="Edit"
                              sx={{ color: '#0f3a6d', '&:hover': { bgcolor: 'rgba(15,58,109,0.1)' } }}
                            >
                              <EditIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          )}
                          {onDelete && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => onDelete(row)}
                              title="Delete"
                              sx={{ '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}
                            >
                              <DeleteIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: '1px solid rgba(15,58,109,0.08)' }}
        />
      </Paper>
    </Box>
  );
}

function renderValue(value, col) {
  if (value === null || value === undefined) return <Typography variant="body2" color="text.disabled">—</Typography>;
  if (typeof value === 'boolean') return (
    <Chip label={value ? 'Yes' : 'No'} size="small" color={value ? 'success' : 'default'} variant="outlined" sx={{ fontSize: '0.75rem', height: 22 }} />
  );

  // Auto-detect status fields
  const isStatusField = col?.type === 'status' || (col?.key && ['status', 'kycStatus', 'paymentStatus', 'lockerStatus'].some((k) => col.key.toLowerCase().includes('status')));
  if (isStatusField) {
    return (
      <Chip
        label={String(value)}
        size="small"
        color={getStatusChipColor(value)}
        variant="filled"
        sx={{ fontWeight: 600, fontSize: '0.72rem', height: 22, textTransform: 'capitalize' }}
      />
    );
  }

  if (value instanceof Date) return value.toLocaleDateString();
  return String(value);
}
