'use client';

import { Box, Button, Typography, Breadcrumbs, Chip } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Link from 'next/link';

export default function PageHeader({
  title,
  subtitle = null,
  actions = [],
  breadcrumbs = [],
  badge = null,
  actionLabel = null,
  actionIcon = null,
  onAction = null,
  actionVariant = 'contained',
  actionColor = 'primary',
  secondaryAction = null,
}) {
  const mergedActions = [...actions];

  if (actionLabel && onAction) {
    mergedActions.push({
      label: actionLabel,
      icon: actionIcon,
      onClick: onAction,
      variant: actionVariant,
      color: actionColor,
    });
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box>
        {breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<NavigateNextIcon sx={{ fontSize: 14 }} />}
            sx={{ mb: 0.75, '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' } }}
          >
            {breadcrumbs.map((crumb, idx) =>
              crumb.href && idx < breadcrumbs.length - 1 ? (
                <Typography
                  key={idx}
                  variant="caption"
                  component={Link}
                  href={crumb.href}
                  sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  {crumb.label}
                </Typography>
              ) : (
                <Typography key={idx} variant="caption" color="primary" fontWeight={600}>
                  {crumb.label}
                </Typography>
              )
            )}
          </Breadcrumbs>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              letterSpacing: -0.3,
            }}
          >
            {title}
          </Typography>
          {badge && (
            <Chip
              label={badge.label}
              size="small"
              color={badge.color || 'primary'}
              variant={badge.variant || 'filled'}
              sx={{ fontWeight: 600, height: 22, fontSize: '0.7rem' }}
            />
          )}
        </Box>

        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {(mergedActions.length > 0 || secondaryAction) && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          {secondaryAction}
          {mergedActions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.variant || 'contained'}
              onClick={action.onClick}
              startIcon={action.icon}
              size={action.size || 'medium'}
              color={action.color || 'primary'}
              disabled={action.disabled}
              sx={{ fontWeight: 600, ...(action.sx || {}) }}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
}
