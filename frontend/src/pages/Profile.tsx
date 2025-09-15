import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Tabs,
  Tab,
  Grid,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext.tsx';
import { User, UserProfile } from '../types/index.ts';
import api from '../services/api.ts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    experience: '',
    skills: '',
    education: '',
    resume: '',
  });

  useEffect(() => {
    if (user?.user_profile) {
      const profile = user.user_profile;
      setProfileData(prev => ({
        ...prev,
        phone: profile.phone || '',
        location: profile.location || '',
        experience: profile.experience || '',
        skills: profile.skills || '',
        education: profile.education || '',
        resume: profile.resume || '',
      }));
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update user profile
      await api.put('/profile', {
        name: profileData.name,
        phone: profileData.phone,
        location: profileData.location,
        experience: profileData.experience,
        skills: profileData.skills,
        education: profileData.education,
        resume: profileData.resume,
      });
      setSuccess('Профиль успешно обновлен');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка обновления профиля');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Alert severity="error">
        Необходимо войти в систему
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Мой профиль
      </Typography>

      <Paper>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          aria-label="profile tabs"
        >
          <Tab label="Основная информация" />
          <Tab label="Профессиональная информация" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Имя"
                value={profileData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={profileData.email}
                disabled
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Телефон"
                value={profileData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Местоположение"
                value={profileData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Опыт работы"
                value={profileData.experience}
                onChange={(e) => handleChange('experience', e.target.value)}
                placeholder="Опишите ваш опыт работы..."
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Навыки"
                value={profileData.skills}
                onChange={(e) => handleChange('skills', e.target.value)}
                placeholder="Перечислите ваши навыки..."
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Образование"
                value={profileData.education}
                onChange={(e) => handleChange('education', e.target.value)}
                placeholder="Опишите ваше образование..."
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Резюме"
                value={profileData.resume}
                onChange={(e) => handleChange('resume', e.target.value)}
                placeholder="Дополнительная информация о себе..."
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {error && (
          <Alert severity="error" sx={{ m: 3, mt: 0 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ m: 3, mt: 0 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ p: 3, pt: 0 }}>
          <Button
            variant="contained"
            onClick={handleSaveProfile}
            disabled={loading}
          >
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;

