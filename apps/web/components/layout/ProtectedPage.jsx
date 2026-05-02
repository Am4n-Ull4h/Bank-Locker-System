'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedPage({ children, allowRoles }) {
  const { user, loading, roleToHome } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (allowRoles?.length && !allowRoles.includes(user.role)) {
      router.replace(roleToHome[user.role]);
      return;
    }

    if (pathname === '/') {
      router.replace(roleToHome[user.role]);
    }
  }, [user, loading, allowRoles, router, pathname, roleToHome]);

  if (loading || !user) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (allowRoles?.length && !allowRoles.includes(user.role)) {
    return null;
  }

  return children;
}
