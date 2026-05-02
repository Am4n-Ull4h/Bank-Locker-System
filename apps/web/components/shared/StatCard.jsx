'use client';

import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const colorSchemes = {
  primary: {
    iconBg: 'linear-gradient(135deg, #0f3a6d 0%, #2b5f9b 100%)',
    iconShadow: 'rgba(15,58,109,0.35)',
    accent: '#0f3a6d',
    cardBorder: 'rgba(15,58,109,0.12)',
    progressColor: '#0f3a6d',
  },
  success: {
    iconBg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    iconShadow: 'rgba(5,150,105,0.35)',
    accent: '#059669',
    cardBorder: 'rgba(16,185,129,0.15)',
    progressColor: '#10b981',
  },
  warning: {
    iconBg: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    iconShadow: 'rgba(217,119,6,0.35)',
    accent: '#d97706',
    cardBorder: 'rgba(245,158,11,0.15)',
    progressColor: '#f59e0b',
  },
  error: {
    iconBg: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    iconShadow: 'rgba(220,38,38,0.35)',
    accent: '#dc2626',
    cardBorder: 'rgba(239,68,68,0.15)',
    progressColor: '#ef4444',
  },
  info: {
    iconBg: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
    iconShadow: 'rgba(2,132,199,0.35)',
    accent: '#0284c7',
    cardBorder: 'rgba(56,189,248,0.15)',
    progressColor: '#38bdf8',
  },
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  subtext = null,
  color = 'primary',
  progress = null,
  onClick = null,
  trend = null,
  trendDown = false,
}) {
  const scheme = colorSchemes[color] || colorSchemes.primary;

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.25s ease',
        border: `1px solid ${scheme.cardBorder}`,
        boxShadow: '0 4px 16px rgba(15,58,109,0.07)',
        overflow: 'visible',
        '&:hover': onClick
          ? {
              transform: 'translateY(-3px)',
              boxShadow: `0 12px 28px ${scheme.iconShadow}`,
            }
          : {
              boxShadow: '0 6px 20px rgba(15,58,109,0.1)',
            },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '14px',
              background: scheme.iconBg,
              display: 'grid',
              placeItems: 'center',
              color: 'white',
              boxShadow: `0 6px 16px ${scheme.iconShadow}`,
            }}
          >
            {Icon && <Icon sx={{ fontSize: 26 }} />}
          </Box>
          {trend && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.3,
                color: trendDown ? 'error.main' : 'success.main',
                bgcolor: trendDown ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                px: 1,
                py: 0.3,
                borderRadius: '20px',
              }}
            >
              {trendDown
                ? <ArrowDownwardIcon sx={{ fontSize: 13 }} />
                : <ArrowUpwardIcon sx={{ fontSize: 13 }} />}
              <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.7rem' }}>
                {trend}
              </Typography>
            </Box>
          )}
        </Box>

        <Typography
          variant="h5"
          sx={{ fontWeight: 800, mb: 0.4, color: 'text.primary', letterSpacing: -0.5 }}
        >
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>

        {subtext && (
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.75 }}>
            {subtext}
          </Typography>
        )}

        {progress !== null && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Progress</Typography>
              <Typography variant="caption" fontWeight={700} sx={{ color: scheme.accent }}>
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: `${scheme.cardBorder}`,
                '& .MuiLinearProgress-bar': { bgcolor: scheme.progressColor, borderRadius: 3 },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
