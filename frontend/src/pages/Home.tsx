import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
} from '@mui/material';
import {
  Restaurant,
  Article,
  People,
  Security,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [apiUrl, setApiUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Show API URL for debugging
    setApiUrl(process.env.REACT_APP_API_URL || 'undefined');
    // Simple API health check
    const url = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '') + '/health';
    if (url.length > 10) {
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error('API not reachable');
          return res.json();
        })
        .catch((err) => setApiError('Unable to connect to backend API. Some features may be unavailable. ' + err));
    } else {
      setApiError('REACT_APP_API_URL is not set. Please configure it in Netlify environment variables.');
    }
  }, []);

  const features = [
    {
      icon: <Restaurant sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Meal Exchange',
      description: 'Share and discover meals with fellow university students. Find food near you or offer your extra meals.',
      action: 'Browse Meals',
      path: '/meals',
    },
    {
      icon: <Article sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: 'Story Sharing',
      description: 'Share your experiences in a safe, supportive environment. Connect with others who understand.',
      action: 'Read Stories',
      path: '/stories',
    },
    {
      icon: <People sx={{ fontSize: 40, color: 'success.main' }} />,
      title: 'Community',
      description: 'Build meaningful connections with students who share similar experiences and values.',
      action: 'Join Community',
      path: user ? '/meals' : '/register',
    },
    {
      icon: <Security sx={{ fontSize: 40, color: 'warning.main' }} />,
      title: 'Safe Space',
      description: 'Privacy controls and moderation ensure a safe environment for sharing personal experiences.',
      action: 'Learn More',
      path: '/stories',
    },
  ];

  return (
    <Box>
      <Box sx={{ bgcolor: 'info.main', color: 'white', p: 2, mb: 2, textAlign: 'center' }}>
        <strong>API URL:</strong> {apiUrl}
      </Box>
      {apiError && (
        <Box sx={{ bgcolor: 'error.main', color: 'white', p: 2, mb: 2, textAlign: 'center' }}>
          {apiError}
        </Box>
      )}
      {/* Hero Section */}
      <Paper
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 8,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="h2" component="h1" gutterBottom>
              🍽️ MeToo Meal Exchange
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4 }}>
              Share Meals, Share Stories, Build Community
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              A safe space for university students to exchange meals and share experiences. 
              Connect with your community through food and support.
            </Typography>
            {!user && (
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ 
                    borderColor: 'white', 
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              </Box>
            )}
          </Box>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          How It Works
        </Typography>
        <Typography variant="body1" textAlign="center" sx={{ mb: 6, color: 'text.secondary' }}>
          Join thousands of students already using our platform
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button 
                    size="small" 
                    onClick={() => navigate(feature.path)}
                    variant="outlined"
                  >
                    {feature.action}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Paper sx={{ py: 6, mt: 4, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} textAlign="center">
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" component="div" color="primary.main" gutterBottom>
                500+
              </Typography>
              <Typography variant="h6" gutterBottom>
                Meals Shared
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" component="div" color="secondary.main" gutterBottom>
                200+
              </Typography>
              <Typography variant="h6" gutterBottom>
                Stories Shared
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" component="div" color="success.main" gutterBottom>
                1000+
              </Typography>
              <Typography variant="h6" gutterBottom>
                Students Connected
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Paper>
    </Box>
  );
};

export default Home;