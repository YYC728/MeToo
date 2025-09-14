import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
} from '@mui/material';
import {
  Person,
  Email,
  Security,
  Restaurant,
  Article,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    stage_name: user?.stage_name || '',
    university_email: user?.university_email || '',
    university_visibility: user?.disclosure_preferences?.university_visibility || false,
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSwitchChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.checked,
    });
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      
      // This would call your actual API
      // await api.put('/auth/profile', formData);
      
      // Mock success for now
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err: any) {
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData({
      stage_name: user?.stage_name || '',
      university_email: user?.university_email || '',
      university_visibility: user?.disclosure_preferences?.university_visibility || false,
    });
    setEditing(false);
    setError('');
    setSuccess('');
  };

  const stats = [
    { label: 'Meals Shared', value: '12', icon: <Restaurant /> },
    { label: 'Stories Shared', value: '5', icon: <Article /> },
    { label: 'Meals Received', value: '8', icon: <Restaurant /> },
    { label: 'Stories Liked', value: '24', icon: <Article /> },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        👤 My Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main', fontSize: '2rem' }}>
                  {user?.stage_name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {editing ? (
                      <TextField
                        value={formData.stage_name}
                        onChange={handleInputChange('stage_name')}
                        variant="standard"
                        fullWidth
                      />
                    ) : (
                      user?.stage_name || 'User'
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {editing ? (
                      <TextField
                        value={formData.university_email}
                        onChange={handleInputChange('university_email')}
                        variant="standard"
                        fullWidth
                        disabled
                        helperText="Email cannot be changed"
                      />
                    ) : (
                      user?.university_email || 'user@university.edu'
                    )}
                  </Typography>
                  <Chip
                    label={user?.is_email_verified ? 'Verified' : 'Unverified'}
                    color={user?.is_email_verified ? 'success' : 'warning'}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Privacy Settings
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={editing ? formData.university_visibility : user?.disclosure_preferences?.university_visibility || false}
                    onChange={handleSwitchChange('university_visibility')}
                    disabled={!editing}
                  />
                }
                label="Show my university in my profile"
              />

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                {editing ? (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Activity
              </Typography>
              <List>
                {stats.map((stat, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {stat.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={stat.value}
                      secondary={stat.label}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="outlined" startIcon={<Restaurant />} fullWidth>
                  Share a Meal
                </Button>
                <Button variant="outlined" startIcon={<Article />} fullWidth>
                  Share a Story
                </Button>
                <Button variant="outlined" startIcon={<Security />} fullWidth>
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your recent meals and stories will appear here.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;