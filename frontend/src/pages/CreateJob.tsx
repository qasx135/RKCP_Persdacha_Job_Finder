import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import api from '../services/api.ts';

const CreateJob: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    salary: '',
    type: '',
    category: '',
    requirements: '',
    benefits: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/jobs', formData);
      navigate('/jobs');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка создания вакансии');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'employer') {
    return (
      <Alert severity="error">
        У вас нет прав для создания вакансий
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Создать вакансию
      </Typography>

      <Paper sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Название вакансии"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Описание"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Компания"
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Местоположение"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Зарплата"
            value={formData.salary}
            onChange={(e) => handleChange('salary', e.target.value)}
            placeholder="Например: 50000-80000 руб."
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Тип работы</InputLabel>
              <Select
                value={formData.type}
                label="Тип работы"
                onChange={(e) => handleChange('type', e.target.value)}
              >
                <MenuItem value="full-time">Полная занятость</MenuItem>
                <MenuItem value="part-time">Частичная занятость</MenuItem>
                <MenuItem value="contract">Контракт</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Категория</InputLabel>
              <Select
                value={formData.category}
                label="Категория"
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="Marketing">Маркетинг</MenuItem>
                <MenuItem value="Sales">Продажи</MenuItem>
                <MenuItem value="Finance">Финансы</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="Other">Другое</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Требования"
            value={formData.requirements}
            onChange={(e) => handleChange('requirements', e.target.value)}
            placeholder="Опишите требования к кандидату..."
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Условия и льготы"
            value={formData.benefits}
            onChange={(e) => handleChange('benefits', e.target.value)}
            placeholder="Опишите условия работы и льготы..."
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Создание...' : 'Создать вакансию'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/jobs')}
            >
              Отмена
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateJob;

