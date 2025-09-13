import React from 'react';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Profile
      </Typography>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          User Information
        </Typography>
        
        {user && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Stage Name:</strong> {user.stage_name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Email:</strong> {user.university_email}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Email Verified:</strong> {user.is_email_verified ? 'Yes' : 'No'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>University Visibility:</strong> {user.disclosure_preferences.university_visibility ? 'Public' : 'Private'}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ mt: 4 }}>
          <Button variant="contained" color="primary" sx={{ mr: 2 }}>
            Edit Profile
          </Button>
          <Button variant="outlined" color="secondary" onClick={logout}>
            Logout
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
