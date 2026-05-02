'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import ProtectedPage from '../../components/layout/ProtectedPage';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/shared/PageHeader';
import { useAuth } from '../../contexts/AuthContext';

const defaultSettings = {
  theme: 'light',
  dateFormat: 'DD/MM/YYYY',
  language: 'en',
  notifications: {
    email: true,
    sms: false,
    inApp: true,
  },
};

const isSameSettings = (left, right) => JSON.stringify(left) === JSON.stringify(right);

export default function SettingsPage() {
  const { getSettings, updateSettings } = useAuth();
  const [settings, setSettings] = useState(defaultSettings);
  const [initialSettings, setInitialSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      const merged = {
        ...defaultSettings,
        ...data,
        notifications: { ...defaultSettings.notifications, ...(data?.notifications || {}) },
      };

      setSettings(merged);
      setInitialSettings(merged);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [getSettings]);

  const hasUnsavedChanges = useMemo(() => !isSameSettings(settings, initialSettings), [settings, initialSettings]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const saveAll = async () => {
    if (!hasUnsavedChanges) {
      toast('No changes to save');
      return;
    }

    try {
      setSaving(true);
      await updateSettings(settings);
      setInitialSettings(settings);
      setLastSavedAt(new Date());
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const resetToLoaded = () => {
    setSettings(initialSettings);
    toast.success('Changes reverted');
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    toast.success('Default settings applied locally');
  };

  return (
    <ProtectedPage>
      <DashboardLayout>
        <PageHeader
          title="Settings"
          subtitle="Configure your workspace preferences"
          actions={[
            {
              label: 'Reload',
              icon: <RefreshIcon />,
              onClick: loadSettings,
              variant: 'outlined',
            },
            {
              label: 'Reset Changes',
              icon: <RestartAltIcon />,
              onClick: resetToLoaded,
              variant: 'outlined',
            },
            {
              label: saving ? 'Saving...' : 'Save Settings',
              icon: <SaveIcon />,
              onClick: saveAll,
              variant: 'contained',
            },
          ]}
        />

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                {hasUnsavedChanges && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    You have unsaved changes. Save before leaving this page.
                  </Alert>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SettingsIcon color="action" />
                  <Typography variant="h6" fontWeight={700}>General Preferences</Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Theme"
                      value={settings.theme}
                      onChange={(e) => setSettings((prev) => ({ ...prev, theme: e.target.value }))}
                      disabled={loading}
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="system">System Default</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Date Format"
                      value={settings.dateFormat}
                      onChange={(e) => setSettings((prev) => ({ ...prev, dateFormat: e.target.value }))}
                      disabled={loading}
                    >
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Language"
                      value={settings.language}
                      onChange={(e) => setSettings((prev) => ({ ...prev, language: e.target.value }))}
                      disabled={loading}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="ur">Urdu</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>Notifications</Typography>
                <FormControlLabel
                  control={<Switch checked={settings.notifications.email} onChange={(e) => setSettings((prev) => ({ ...prev, notifications: { ...prev.notifications, email: e.target.checked } }))} />}
                  label="Email notifications"
                />
                <FormControlLabel
                  control={<Switch checked={settings.notifications.sms} onChange={(e) => setSettings((prev) => ({ ...prev, notifications: { ...prev.notifications, sms: e.target.checked } }))} />}
                  label="SMS notifications"
                />
                <FormControlLabel
                  control={<Switch checked={settings.notifications.inApp} onChange={(e) => setSettings((prev) => ({ ...prev, notifications: { ...prev.notifications, inApp: e.target.checked } }))} />}
                  label="In-app notifications"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Save Status</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {saving
                      ? 'Saving your preferences...'
                      : hasUnsavedChanges
                        ? 'Pending changes'
                        : 'All changes saved'}
                  </Typography>
                  {lastSavedAt && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Last saved: {lastSavedAt.toLocaleString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Quick Actions</Typography>
                  <Stack spacing={1}>
                    <Button variant="outlined" onClick={resetToDefaults} disabled={loading || saving}>
                      Apply Default Settings
                    </Button>
                    <Button variant="outlined" onClick={resetToLoaded} disabled={loading || saving || !hasUnsavedChanges}>
                      Discard Unsaved Changes
                    </Button>
                    <Button variant="contained" onClick={saveAll} disabled={saving || loading || !hasUnsavedChanges}>
                      {saving ? 'Saving...' : 'Save Now'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </DashboardLayout>
    </ProtectedPage>
  );
}
