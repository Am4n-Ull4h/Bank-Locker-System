'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ProtectedPage from '../../components/layout/ProtectedPage';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/shared/PageHeader';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile, changePassword, refreshMe } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [initialProfileForm, setInitialProfileForm] = useState({ name: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [lastProfileSavedAt, setLastProfileSavedAt] = useState(null);
  const [lastPasswordUpdatedAt, setLastPasswordUpdatedAt] = useState(null);

  useEffect(() => {
    const initial = { name: user?.name || '', phone: user?.phone || '' };
    setProfileForm(initial);
    setInitialProfileForm(initial);
  }, [user]);

  const hasProfileChanges = useMemo(
    () => JSON.stringify(profileForm) !== JSON.stringify(initialProfileForm),
    [profileForm, initialProfileForm],
  );

  const passwordChecks = useMemo(() => {
    const newPassword = passwordForm.newPassword || '';
    return {
      hasCurrentPassword: Boolean(passwordForm.currentPassword),
      minLength: newPassword.length >= 6,
      hasLetter: /[A-Za-z]/.test(newPassword),
      hasNumber: /\d/.test(newPassword),
      matches: newPassword.length > 0 && newPassword === passwordForm.confirmPassword,
    };
  }, [passwordForm]);

  const isPasswordFormReady =
    passwordChecks.hasCurrentPassword
    && passwordChecks.minLength
    && passwordChecks.hasLetter
    && passwordChecks.hasNumber
    && passwordChecks.matches;

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasProfileChanges) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasProfileChanges]);

  const resetProfileChanges = () => {
    setProfileForm(initialProfileForm);
    toast.success('Profile changes reverted');
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();

    if (!hasProfileChanges) {
      toast('No profile changes to save');
      return;
    }

    try {
      setProfileSaving(true);
      const payload = {
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
      };
      await updateProfile(payload);
      await refreshMe();
      setInitialProfileForm(payload);
      setLastProfileSavedAt(new Date());
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    if (!isPasswordFormReady) {
      toast.error('Please satisfy password requirements before updating');
      return;
    }

    try {
      setPasswordSaving(true);
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setLastPasswordUpdatedAt(new Date());
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <ProtectedPage>
      <DashboardLayout>
        <PageHeader
          title="My Profile"
          subtitle="Manage your account details and security"
          actions={[
            {
              label: 'Reset Changes',
              icon: <RestartAltIcon />,
              onClick: resetProfileChanges,
              variant: 'outlined',
            },
          ]}
        />

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'grid', placeItems: 'center', py: 2 }}>
                    <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', mb: 1.5 }}>
                      <PersonIcon sx={{ fontSize: 36 }} />
                    </Avatar>
                    <Typography variant="h6" fontWeight={700}>{user?.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{user?.email}</Typography>
                    <Chip label={user?.role?.replaceAll('_', ' ')} size="small" color="primary" variant="outlined" />
                    {user?.branch?.name && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                        Branch: {user.branch.name}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Account Status</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {hasProfileChanges ? 'Profile changes pending' : 'Profile is up to date'}
                  </Typography>
                  {lastProfileSavedAt && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Profile saved: {lastProfileSavedAt.toLocaleString()}
                    </Typography>
                  )}
                  {lastPasswordUpdatedAt && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Password updated: {lastPasswordUpdatedAt.toLocaleString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                {hasProfileChanges && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    You have unsaved profile changes.
                  </Alert>
                )}

                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Profile Information</Typography>
                <Box component="form" onSubmit={handleProfileSave} sx={{ display: 'grid', gap: 2 }}>
                  <TextField
                    label="Full Name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  <TextField label="Email" value={user?.email || ''} disabled />
                  <TextField
                    label="Phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                  <Box>
                    <Button type="submit" variant="contained" disabled={profileSaving || !hasProfileChanges}>
                      {profileSaving ? 'Saving...' : 'Save Profile'}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SecurityIcon color="action" />
                  <Typography variant="h6" fontWeight={700}>Password & Security</Typography>
                </Box>

                <Box component="form" onSubmit={handlePasswordSave} sx={{ display: 'grid', gap: 2 }}>
                  <TextField
                    label="Current Password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  />
                  <TextField
                    label="New Password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  />
                  <TextField
                    label="Confirm New Password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  />

                  <Divider />
                  <Typography variant="subtitle2" color="text.secondary">Password Requirements</Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color={passwordChecks.hasCurrentPassword ? 'success.main' : 'text.secondary'}>
                      • Current password entered
                    </Typography>
                    <Typography variant="caption" color={passwordChecks.minLength ? 'success.main' : 'text.secondary'}>
                      • At least 6 characters
                    </Typography>
                    <Typography variant="caption" color={passwordChecks.hasLetter ? 'success.main' : 'text.secondary'}>
                      • Contains letters
                    </Typography>
                    <Typography variant="caption" color={passwordChecks.hasNumber ? 'success.main' : 'text.secondary'}>
                      • Contains numbers
                    </Typography>
                    <Typography variant="caption" color={passwordChecks.matches ? 'success.main' : 'text.secondary'}>
                      • Confirmation matches
                    </Typography>
                  </Stack>

                  <Box>
                    <Button type="submit" variant="contained" disabled={passwordSaving || !isPasswordFormReady}>
                      {passwordSaving ? 'Updating...' : 'Update Password'}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DashboardLayout>
    </ProtectedPage>
  );
}
