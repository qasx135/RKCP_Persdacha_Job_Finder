import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Job } from '../types/index.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import api from '../services/api.ts';

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applicationDialog, setApplicationDialog] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${id}`);
        setJob(response.data.job);
      } catch (err: any) {
        setError('Ошибка загрузки вакансии');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id]);

  const handleApply = async () => {
    if (!job || !user) return;

    try {
      setApplying(true);
      await api.post('/applications', {
        job_id: job.id,
        message: applicationMessage,
      });
      setApplicationDialog(false);
      setApplicationMessage('');
      // Show success message or redirect
    } catch (err: any) {
      setError('Ошибка подачи заявки');
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Загрузка...</Typography>
      </Box>
    );
  }

  if (error || !job) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error || 'Вакансия не найдена'}
      </Alert>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {job.title}
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
              {job.company}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {job.location && (
                <Chip label={job.location} variant="outlined" />
              )}
              {job.type && (
                <Chip label={job.type} variant="outlined" />
              )}
              {job.category && (
                <Chip label={job.category} variant="outlined" />
              )}
              {job.salary && (
                <Chip label={job.salary} color="primary" variant="outlined" />
              )}
            </Box>
          </Box>
          {user && user.role === 'job_seeker' && (
            <Button
              variant="contained"
              size="large"
              onClick={() => setApplicationDialog(true)}
            >
              Подать заявку
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" gutterBottom>
          Описание
        </Typography>
        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
          {job.description}
        </Typography>

        {job.requirements && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Требования
            </Typography>
            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
              {job.requirements}
            </Typography>
          </>
        )}

        {job.benefits && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Условия и льготы
            </Typography>
            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
              {job.benefits}
            </Typography>
          </>
        )}

        <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Опубликовано: {formatDate(job.created_at)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Работодатель: {job.employer.name}
          </Typography>
        </Box>
      </Paper>

      {/* Application Dialog */}
      <Dialog
        open={applicationDialog}
        onClose={() => setApplicationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Подача заявки</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Вы подаете заявку на вакансию "{job.title}" в компании "{job.company}".
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Дополнительное сообщение (необязательно)"
            value={applicationMessage}
            onChange={(e) => setApplicationMessage(e.target.value)}
            placeholder="Расскажите о себе, почему вы подходите для этой позиции..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplicationDialog(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleApply}
            variant="contained"
            disabled={applying}
          >
            {applying ? 'Подача заявки...' : 'Подать заявку'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobDetails;

