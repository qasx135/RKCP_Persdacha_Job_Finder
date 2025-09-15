import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  AccountCircle,
  Work,
  Add,
  ExitToApp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Job Search
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Показываем "Вакансии" только соискателям и работодателям */}
          {(user?.role === 'job_seeker' || user?.role === 'employer') && (
            <Button
              color="inherit"
              startIcon={<Work />}
              onClick={() => navigate('/jobs')}
            >
              Вакансии
            </Button>
          )}

          {user ? (
            <>
              {user.role === 'employer' && (
                <Button
                  color="inherit"
                  startIcon={<Add />}
                  onClick={() => navigate('/create-job')}
                >
                  Создать вакансию
                </Button>
              )}
              
              {/* Показываем "Мои заявки" только соискателям и работодателям */}
              {(user.role === 'job_seeker' || user.role === 'employer') && (
                <Button
                  color="inherit"
                  onClick={() => navigate('/applications')}
                >
                  {user.role === 'job_seeker' ? 'Мои заявки' : 'Отклики на вакансии'}
                </Button>
              )}

              {/* Показываем "Панель администратора" только администраторам */}
              {user.role === 'admin' && (
                <Button
                  color="inherit"
                  onClick={() => navigate('/admin')}
                >
                  Панель администратора
                </Button>
              )}

              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                  Профиль
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ExitToApp sx={{ mr: 1 }} />
                  Выйти
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Войти
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
                Регистрация
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

