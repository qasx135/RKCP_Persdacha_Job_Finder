import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import Navbar from './components/Navbar.tsx';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Jobs from './pages/Jobs.tsx';
import JobDetails from './pages/JobDetails.tsx';
import CreateJob from './pages/CreateJob.tsx';
import Profile from './pages/Profile.tsx';
import Applications from './pages/Applications.tsx';
import AdminPanel from './pages/AdminPanel.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/create-job" element={<CreateJob />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Container>
    </AuthProvider>
  );
}

export default App;

