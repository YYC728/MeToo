import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Meals: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Meal Exchange
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Discover and share meals with fellow students. This feature is coming soon!
      </Typography>
      <Box sx={{ mt: 4, p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Features Coming Soon:
        </Typography>
        <ul>
          <li>Interactive map with meal locations</li>
          <li>Dietary preference filtering</li>
          <li>Real-time meal posting</li>
          <li>Location-based search</li>
          <li>User reviews and ratings</li>
        </ul>
      </Box>
    </Container>
  );
};

export default Meals;
