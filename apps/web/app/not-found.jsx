'use client';

import Link from 'next/link';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';

export default function NotFound() {
  return (
    <Box sx={{ minHeight: '80vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Card sx={{ maxWidth: 520, width: '100%' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight={800} color="primary.main" sx={{ mb: 1 }}>
            404
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            Page not found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            The page you requested does not exist or may have been moved.
          </Typography>
          <Button component={Link} href="/" variant="contained">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
