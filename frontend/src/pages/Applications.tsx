import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
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
import { JobApplication } from '../types/index.ts';
import api from '../services/api.ts';

const Applications: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusDialog, setStatusDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        if (user?.role === 'job_seeker') {
          // Для соискателя - показываем его заявки
          const response = await api.get('/applications/my');
          setApplications(response.data.applications);
        } else if (user?.role === 'employer') {
          // Для работодателя - показываем отклики на его вакансии
          const response = await api.get('/applications/employer');
          setApplications(response.data.applications);
        }
      } catch (err: any) {
        setError('Ошибка загрузки заявок');
      } finally {
        setLoading(false);
      }
    };

    if (user && (user.role === 'job_seeker' || user.role === 'employer')) {
      fetchApplications();
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

  if (!user) {
    return (
      <Alert severity="error">
        Необходимо войти в систему
      </Alert>
    );
  }

  if (user.role === 'admin') {
    return (
      <Alert severity="error">
        У администратора нет доступа к заявкам
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
        {user?.role === 'job_seeker' ? 'Мои заявки' : 'Отклики на вакансии'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {user?.role === 'job_seeker' ? (
                <>
                  <TableCell>Вакансия</TableCell>
                  <TableCell>Компания</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Дата подачи</TableCell>
                </>
              ) : (
                <>
                  <TableCell>Вакансия</TableCell>
                  <TableCell>Соискатель</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Дата подачи</TableCell>
                  <TableCell>Действия</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell>
                  <Typography variant="subtitle2">
                    {application.job.title}
                  </Typography>
                </TableCell>
                {user?.role === 'job_seeker' ? (
                  <>
                    <TableCell>{application.job.company}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(application.status)}
                        color={getStatusColor(application.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(application.created_at)}</TableCell>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {applications.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            {user?.role === 'job_seeker' ? 'У вас пока нет заявок' : 'На ваши вакансии пока нет откликов'}
          </Typography>
        </Box>
      )}

      {/* Status Change Dialog - только для работодателей */}
      {user?.role === 'employer' && (
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
      )}
    </Box>
  );
};

export default Applications;

