import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Stories: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        #MeToo Stories
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Share your experiences and support others in a safe, anonymous environment.
      </Typography>
      <Box sx={{ mt: 4, p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Features Coming Soon:
        </Typography>
        <ul>
          <li>Anonymous story posting</li>
          <li>Privacy level controls</li>
          <li>Comment system with anonymity</li>
          <li>Tag-based organization</li>
          <li>Content moderation tools</li>
        </ul>
      </Box>
    </Container>
  );
};

export default Stories;

