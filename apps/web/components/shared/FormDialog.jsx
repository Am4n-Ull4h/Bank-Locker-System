'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';

export default function FormDialog({
  open,
  title,
  onClose,
  onSubmit,
  children,
  loading = false,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  fullWidth = true,
  maxWidth = 'sm',
  showActions = true,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth={fullWidth} maxWidth={maxWidth}>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem', pb: 1 }}>{title}</DialogTitle>
      <DialogContent dividers sx={{ py: 3 }}>
        {children}
      </DialogContent>
      {showActions && (
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            onClick={onSubmit}
            variant="contained"
            disabled={loading}
            sx={{ minWidth: 100 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : submitLabel}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
