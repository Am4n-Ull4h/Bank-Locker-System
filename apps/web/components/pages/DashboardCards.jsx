'use client';

import { Grid, Card, CardContent, Typography } from '@mui/material';

export default function DashboardCards({ items }) {
  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid item xs={12} sm={6} md={3} key={item.label}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ minHeight: 112, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{item.label}</Typography>
              <Typography variant="h5" fontWeight={800} color="primary.main">{item.value}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
