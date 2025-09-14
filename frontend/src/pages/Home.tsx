import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
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

  const features = [
    {
      icon: <Restaurant sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Meal Exchange',
      description: 'Share and discover meals with fellow students. Find meals near you based on dietary preferences and location.',
      action: 'Browse Meals',
      path: '/meals',
    },
    {
      icon: <Article sx={{ fontSize: 40, color: '#dc004e' }} />,
      title: '#MeToo Stories',
      description: 'Share your experiences and support others in a safe, anonymous environment. Build a community of understanding.',
      action: 'Read Stories',
      path: '/stories',
    },
    {
      icon: <People sx={{ fontSize: 40, color: '#2e7d32' }} />,
      title: 'Community',
      description: 'Connect with other university students. Build meaningful relationships through shared experiences.',
      action: 'Join Community',
      path: user ? '/profile' : '/register',
    },
    {
      icon: <Security sx={{ fontSize: 40, color: '#ed6c02' }} />,
      title: 'Safe Space',
      description: 'Anonymous posting, user blocking, and content moderation ensure a safe environment for everyone.',
      action: 'Learn More',
      path: '/stories',
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
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="h2" component="h1" gutterBottom>
              Welcome to MeToo
            </Typography>
            <Typography variant="h5" component="p" sx={{ mb: 4, opacity: 0.9 }}>
              University Meal Exchange & Story Sharing Platform
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              Connect with fellow students through meal sharing and supportive storytelling. 
              Build a stronger university community together.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                sx={{ 
                  backgroundColor: 'white', 
                  color: '#1976d2',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
                onClick={() => navigate('/meals')}
              >
                Browse Meals
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{ 
                  borderColor: 'white', 
                  color: 'white',
                  '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
                onClick={() => navigate('/stories')}
              >
                Read Stories
              </Button>
            </Box>
          </Box>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Features
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Everything you need to connect with your university community
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box textAlign="center" mb={2}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom textAlign="center">
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" textAlign="center">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate(feature.path)}
                    fullWidth
                    sx={{ mx: 2 }}
                  >
                    {feature.action}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      {!user && (
        <Paper sx={{ py: 6, mt: 4, backgroundColor: '#f5f5f5' }}>
          <Container maxWidth="md">
            <Box textAlign="center">
              <Typography variant="h4" component="h2" gutterBottom>
                Ready to Join Our Community?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Sign up today to start sharing meals and stories with fellow students.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ mr: 2 }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </Box>
          </Container>
        </Paper>
      )}
    </Box>
  );
};

export default Home;

