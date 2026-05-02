'use client';

import { Alert, Card, CardContent, Typography } from '@mui/material';

export default function ModulePlaceholder({ title, description }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={700} mb={1}>{title}</Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>{description}</Typography>
        <Alert severity="info">API endpoints are ready; connect forms and tables here as next iteration.</Alert>
      </CardContent>
    </Card>
  );
}
