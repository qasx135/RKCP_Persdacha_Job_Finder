import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext.tsx';
import { JobApplication, Job } from '../types/index.ts';
import api from '../services/api.ts';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusDialog, setStatusDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Получаем все заявки
        const applicationsResponse = await api.get('/applications/all');
        setApplications(applicationsResponse.data.applications);
        
        // Получаем все вакансии
        const jobsResponse = await api.get('/jobs/all');
        setJobs(jobsResponse.data.jobs);
      } catch (err: any) {
        setError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const handleStatusChange = async () => {
    if (!selectedApplication) return;

    try {
      await api.put(`/applications/${selectedApplication.id}/status`, {
        status: newStatus,
      });
      
      setApplications(prev =>
        prev.map(app =>
          app.id === selectedApplication.id
            ? { ...app, status: newStatus as any }
            : app
        )
      );
      
      setStatusDialog(false);
      setSelectedApplication(null);
      setNewStatus('');
    } catch (err: any) {
      setError('Ошибка обновления статуса');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'На рассмотрении';
      case 'accepted':
        return 'Принята';
      case 'rejected':
        return 'Отклонена';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (!user || user.role !== 'admin') {
    return (
      <Alert severity="error">
        У вас нет прав администратора
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Загрузка...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Панель администратора
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Всего вакансий
              </Typography>
              <Typography variant="h4">
                {jobs.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Всего заявок
              </Typography>
              <Typography variant="h4">
                {applications.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                На рассмотрении
              </Typography>
              <Typography variant="h4">
                {applications.filter(app => app.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Принятые
              </Typography>
              <Typography variant="h4">
                {applications.filter(app => app.status === 'accepted').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Все заявки */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Все заявки
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Вакансия</TableCell>
                <TableCell>Соискатель</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата подачи</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {application.job.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {application.job.company}
                    </Typography>
                  </TableCell>
                  <TableCell>{application.user.name}</TableCell>
                  <TableCell>{application.user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(application.status)}
                      color={getStatusColor(application.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(application.created_at)}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedApplication(application);
                        setNewStatus(application.status);
                        setStatusDialog(true);
                      }}
                    >
                      Изменить статус
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Status Change Dialog */}
      <Dialog
        open={statusDialog}
        onClose={() => setStatusDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Изменить статус заявки</DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                Вакансия: {selectedApplication.job.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Соискатель: {selectedApplication.user.name}
              </Typography>
            </Box>
          )}
          <FormControl fullWidth>
            <InputLabel>Статус</InputLabel>
            <Select
              value={newStatus}
              label="Статус"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="pending">На рассмотрении</MenuItem>
              <MenuItem value="accepted">Принята</MenuItem>
              <MenuItem value="rejected">Отклонена</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleStatusChange}
            variant="contained"
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;


