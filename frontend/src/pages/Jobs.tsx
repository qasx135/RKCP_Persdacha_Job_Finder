import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Chip,
  Alert,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Job } from '../types/index.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import api from '../services/api.ts';

const Jobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    type: '',
  });
  
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      });

      const response = await api.get(`/jobs?${params}`);
      setJobs(response.data.jobs);
      setTotalPages(Math.ceil(response.data.total / 12));
    } catch (err: any) {
      setError('Ошибка загрузки вакансий');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, filters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  // Проверяем доступ - только соискатели могут просматривать вакансии
  if (user && user.role !== 'job_seeker') {
    return (
      <Alert severity="error">
        У вас нет доступа к просмотру вакансий
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
        Вакансии
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Поиск"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Название или описание"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Местоположение"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              placeholder="Город"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Категория</InputLabel>
              <Select
                value={filters.category}
                label="Категория"
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <MenuItem value="">Все категории</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="Marketing">Маркетинг</MenuItem>
                <MenuItem value="Sales">Продажи</MenuItem>
                <MenuItem value="Finance">Финансы</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="Other">Другое</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Тип работы</InputLabel>
              <Select
                value={filters.type}
                label="Тип работы"
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <MenuItem value="">Все типы</MenuItem>
                <MenuItem value="full-time">Полная занятость</MenuItem>
                <MenuItem value="part-time">Частичная занятость</MenuItem>
                <MenuItem value="contract">Контракт</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Jobs Grid */}
      <Grid container spacing={3}>
        {jobs.map((job) => (
          <Grid item xs={12} sm={6} md={4} key={job.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {job.title}
                </Typography>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  {job.company}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {job.description.length > 150
                    ? `${job.description.substring(0, 150)}...`
                    : job.description}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {job.location && (
                    <Chip label={job.location} size="small" variant="outlined" />
                  )}
                  {job.type && (
                    <Chip label={job.type} size="small" variant="outlined" />
                  )}
                  {job.category && (
                    <Chip label={job.category} size="small" variant="outlined" />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Опубликовано: {formatDate(job.created_at)}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  Подробнее
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {jobs.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Вакансии не найдены
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Jobs;

