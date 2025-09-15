import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
} from '@mui/material';
import {
  Work,
  People,
  TrendingUp,
  Search,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <Search />,
      title: 'Поиск вакансий',
      description: 'Найдите подходящую работу по различным критериям',
    },
    {
      icon: <Work />,
      title: 'Размещение вакансий',
      description: 'Работодатели могут размещать свои вакансии',
    },
    {
      icon: <People />,
      title: 'Подача заявок',
      description: 'Подавайте заявки на интересующие вас позиции',
    },
    {
      icon: <TrendingUp />,
      title: 'Отслеживание',
      description: 'Отслеживайте статус ваших заявок',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            align="center"
            sx={{ fontWeight: 'bold' }}
          >
            Найдите работу мечты
          </Typography>
          <Typography
            variant="h5"
            component="p"
            align="center"
            sx={{ mb: 4, opacity: 0.9 }}
          >
            Современная платформа для поиска работы и найма сотрудников
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' },
              }}
              onClick={() => navigate('/jobs')}
            >
              Найти работу
            </Button>
            {!user && (
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                }}
                onClick={() => navigate('/register')}
              >
                Зарегистрироваться
              </Button>
            )}
          </Box>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Возможности платформы
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'center',
                  p: 2,
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 2,
                      color: 'primary.main',
                    }}
                  >
                    {React.cloneElement(feature.icon, { sx: { fontSize: 48 } })}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;

