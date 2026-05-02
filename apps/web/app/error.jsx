'use client';

import { useEffect } from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Box sx={{ minHeight: '80vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Card sx={{ maxWidth: 560, width: '100%' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            An unexpected error occurred while loading this page.
          </Typography>
          <Button variant="contained" onClick={() => reset()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
