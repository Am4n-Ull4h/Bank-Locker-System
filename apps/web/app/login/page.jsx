'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import HttpsOutlinedIcon from '@mui/icons-material/HttpsOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import { useAuth } from '../../contexts/AuthContext';

const schema = z.object({
  email: z.string().email('Enter valid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
});

const features = [
  { icon: AccountBalanceOutlinedIcon, title: 'Multi-Branch Management', desc: 'Centralized control across all bank branches' },
  { icon: SecurityOutlinedIcon, title: 'Role-Based Access Control', desc: 'Secure, tiered permissions for every user role' },
  { icon: HistoryEduOutlinedIcon, title: 'Complete Audit Trail', desc: 'Full activity logging for compliance and review' },
  { icon: VerifiedUserOutlinedIcon, title: 'KYC & Document Vault', desc: 'Verified customers with secure document storage' },
];

export default function LoginPage() {
  const { login, roleToHome } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const user = await login(values.email, values.password);
      toast.success(`Welcome back, ${user.name}!`);
      router.replace(roleToHome[user.role]);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #071e3d 0%, #0f3a6d 40%, #1a5aa3 70%, #0c2d55 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background blobs */}
      <Box sx={{ position: 'absolute', top: -120, right: -120, width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,152,0,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(21,75,135,0.4) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Left panel – features */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          px: { md: 6, lg: 10 },
          py: 6,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Branding */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 5 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #ff9800, #f59e0b)',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 8px 20px rgba(245,158,11,0.4)',
            }}
          >
            <LockOutlinedIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: 'white', lineHeight: 1.1 }}>
              Bank Locker
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.25 }}>
              Management System
            </Typography>
          </Box>
        </Box>

        <Typography variant="h3" fontWeight={800} sx={{ color: 'white', mb: 1.5, lineHeight: 1.2 }}>
          Secure. Efficient.
          <br />
          <Box component="span" sx={{ color: '#f59e0b' }}>Reliable.</Box>
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 5, maxWidth: 420, lineHeight: 1.8 }}>
          The modern platform for complete bank locker lifecycle management — from customer onboarding to automated compliance.
        </Typography>

        <Grid container spacing={2.5}>
          {features.map(({ icon: Icon, title, desc }) => (
            <Grid item xs={12} sm={6} key={title}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  background: 'rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'flex-start',
                  transition: 'background 0.2s',
                  '&:hover': { background: 'rgba(255,255,255,0.11)' },
                }}
              >
                <Box sx={{ mt: 0.25 }}>
                  <Icon sx={{ color: '#f59e0b', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={700} sx={{ color: 'white', mb: 0.3 }}>{title}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{desc}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Divider on large screens */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', px: 2 }}>
        <Divider orientation="vertical" sx={{ borderColor: 'rgba(255,255,255,0.12)', height: '60%' }} />
      </Box>

      {/* Right panel – login form */}
      <Box
        sx={{
          width: { xs: '100%', md: 480 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 420,
            borderRadius: 3.5,
            boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3.5 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: 'primary.main',
                  mx: 'auto',
                  mb: 1.5,
                  boxShadow: '0 8px 20px rgba(15,58,109,0.35)',
                }}
              >
                <LockOutlinedIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h5" fontWeight={800} color="text.primary">
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Sign in to your BLMS account
              </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                label="Email Address"
                fullWidth
                margin="normal"
                autoComplete="email"
                {...register('email')}
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                autoComplete="current-password"
                {...register('password')}
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HttpsOutlinedIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={submitting}
                sx={{
                  mt: 2.5,
                  py: 1.4,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, #0f3a6d, #154b87)',
                  boxShadow: '0 6px 16px rgba(15,58,109,0.35)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #0b2c53, #0f3a6d)',
                    boxShadow: '0 8px 20px rgba(15,58,109,0.45)',
                  },
                }}
              >
                {submitting ? <CircularProgress size={22} color="inherit" /> : 'Sign In Securely'}
              </Button>
            </form>

            <Divider sx={{ my: 2.5 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
              <VerifiedUserOutlinedIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.disabled" textAlign="center">
                Protected by 256-bit SSL encryption • Internal access only
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
