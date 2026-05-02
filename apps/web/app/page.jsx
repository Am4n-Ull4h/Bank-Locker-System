'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import ProtectedPage from '../components/layout/ProtectedPage';

export default function HomePage() {
  return (
    <ProtectedPage>
      <Box sx={{ minHeight: '50vh', display: 'grid', placeItems: 'center', textAlign: 'center', gap: 1 }}>
        <CircularProgress size={28} />
        <Typography variant="body2" color="text.secondary">Redirecting to your dashboard...</Typography>
      </Box>
    </ProtectedPage>
  );
}
