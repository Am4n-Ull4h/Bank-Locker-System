'use client';

import { Box, CircularProgress, Typography } from '@mui/material';

export default function Loading() {
  return (
    <Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center', textAlign: 'center', gap: 1.5 }}>
      <CircularProgress size={32} />
      <Typography variant="body2" color="text.secondary">
        Loading, please wait...
      </Typography>
    </Box>
  );
}
