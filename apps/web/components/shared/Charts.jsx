'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
} from 'chart.js';
import { Pie, Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler);

const modernPalette = ['#0f3a6d', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#0ea5e9', '#8b5cf6', '#f97316'];

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        font: { family: 'Inter, sans-serif', size: 12 },
        padding: 18,
        usePointStyle: true,
        pointStyleWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleFont: { family: 'Inter, sans-serif', size: 13, weight: 'bold' },
      bodyFont: { family: 'Inter, sans-serif', size: 12 },
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
      boxHeight: 8,
      boxWidth: 8,
    },
  },
};

const lineBarOptions = {
  ...baseOptions,
  scales: {
    x: {
      grid: { color: 'rgba(15,58,109,0.06)' },
      ticks: { font: { family: 'Inter, sans-serif', size: 11 }, color: '#6b7280' },
    },
    y: {
      grid: { color: 'rgba(15,58,109,0.06)' },
      ticks: { font: { family: 'Inter, sans-serif', size: 11 }, color: '#6b7280' },
      beginAtZero: true,
    },
  },
};

function ChartWrapper({ title, subtitle, height = 280, actions, children }) {
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 8px 28px rgba(15,58,109,0.12)' },
      }}
    >
      <CardContent sx={{ pb: '16px !important' }}>
        {(title || actions) && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: subtitle ? 0.5 : 2 }}>
            <Box>
              {title && (
                <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
              )}
            </Box>
            {actions}
          </Box>
        )}
        {subtitle && !title ? null : title && subtitle ? <Box sx={{ mb: 2 }} /> : null}
        <Box sx={{ height }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
}

export function PieChart({ data, title, subtitle, options = {}, height = 280 }) {
  const enriched = {
    ...data,
    datasets: data.datasets?.map((ds, i) => ({
      backgroundColor: modernPalette,
      borderColor: 'white',
      borderWidth: 3,
      hoverOffset: 6,
      ...ds,
    })),
  };
  return (
    <ChartWrapper title={title} subtitle={subtitle} height={height}>
      <Pie data={enriched} options={{ ...baseOptions, ...options }} />
    </ChartWrapper>
  );
}

export function DoughnutChart({ data, title, subtitle, options = {}, height = 280 }) {
  const enriched = {
    ...data,
    datasets: data.datasets?.map((ds) => ({
      backgroundColor: modernPalette,
      borderColor: 'white',
      borderWidth: 3,
      hoverOffset: 6,
      ...ds,
    })),
  };
  return (
    <ChartWrapper title={title} subtitle={subtitle} height={height}>
      <Doughnut data={enriched} options={{ ...baseOptions, cutout: '65%', ...options }} />
    </ChartWrapper>
  );
}

export function LineChart({ data, title, subtitle, options = {}, height = 280 }) {
  const enriched = {
    ...data,
    datasets: data.datasets?.map((ds, i) => ({
      borderColor: modernPalette[i] || modernPalette[0],
      backgroundColor: `${modernPalette[i] || modernPalette[0]}18`,
      borderWidth: 2.5,
      pointBackgroundColor: modernPalette[i] || modernPalette[0],
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: true,
      tension: 0.4,
      ...ds,
    })),
  };
  return (
    <ChartWrapper title={title} subtitle={subtitle} height={height}>
      <Line data={enriched} options={{ ...lineBarOptions, ...options }} />
    </ChartWrapper>
  );
}

export function BarChart({ data, title, subtitle, options = {}, height = 280 }) {
  const enriched = {
    ...data,
    datasets: data.datasets?.map((ds, i) => ({
      backgroundColor: modernPalette[i] || modernPalette[0],
      borderRadius: 6,
      borderSkipped: false,
      hoverBackgroundColor: `${modernPalette[i] || modernPalette[0]}cc`,
      ...ds,
    })),
  };
  return (
    <ChartWrapper title={title} subtitle={subtitle} height={height}>
      <Bar data={enriched} options={{ ...lineBarOptions, ...options }} />
    </ChartWrapper>
  );
}
