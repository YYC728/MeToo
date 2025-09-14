import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  // CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Avatar,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add,
  Search,
  // Article,
  MoreVert,
  Favorite,
  Comment,
  Share,
  Visibility,
  VisibilityOff,
  FilterList,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface Story {
  _id: string;
  text_content: string;
  privacy_level: 'public' | 'university' | 'private';
  tags: string[];
  comment_enabled: boolean;
  user_id?: {
    stage_name: string;
  };
  created_at: string;
  likes_count?: number;
  comments_count?: number;
}

const Stories: React.FC = () => {
  // const { user } = useAuth(); // Removed unused variable
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      // This would call your actual API
      // const response = await api.get('/stories');
      // setStories(response.data);
      
      // Mock data for now
      setStories([
        {
          _id: '1',
          text_content: 'I want to share my experience with meal sharing in university. It\'s been amazing to connect with fellow students through food. The community here is so supportive and understanding.',
          privacy_level: 'public',
          tags: ['meal-sharing', 'community', 'support'],
          comment_enabled: true,
          user_id: {
            stage_name: 'Sarah M.'
          },
          created_at: '2024-01-14T10:00:00Z',
          likes_count: 12,
          comments_count: 3
        },
        {
          _id: '2',
          text_content: 'Sometimes it\'s hard to ask for help, but this platform has made it easier. I\'ve met so many kind people who are willing to share their meals and their stories.',
          privacy_level: 'university',
          tags: ['support', 'kindness', 'community'],
          comment_enabled: true,
          user_id: {
            stage_name: 'Alex K.'
          },
          created_at: '2024-01-14T11:00:00Z',
          likes_count: 8,
          comments_count: 1
        }
      ]);
    } catch (err: any) {
      setError('Failed to fetch stories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.text_content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPrivacy = !privacyFilter || story.privacy_level === privacyFilter;
    return matchesSearch && matchesPrivacy;
  });

  const getPrivacyIcon = (level: string) => {
    switch (level) {
      case 'public': return <Visibility />;
      case 'university': return <VisibilityOff />;
      case 'private': return <VisibilityOff />;
      default: return <Visibility />;
    }
  };

  const getPrivacyColor = (level: string) => {
    switch (level) {
      case 'public': return 'success';
      case 'university': return 'warning';
      case 'private': return 'default';
      default: return 'default';
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, story: Story) => {
    setAnchorEl(event.currentTarget);
    setSelectedStory(story);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedStory(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          📖 Community Stories
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Share your experiences and connect with others who understand
        </Typography>

        {/* Search and Filter */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Privacy Level</InputLabel>
            <Select
              value={privacyFilter}
              onChange={(e) => setPrivacyFilter(e.target.value)}
              startAdornment={<FilterList />}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="university">University Only</MenuItem>
              <MenuItem value="private">Private</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stories List */}
        {loading ? (
          <Box textAlign="center" py={4}>
            <Typography>Loading stories...</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {filteredStories.map((story) => (
              <Card key={story._id} sx={{ position: 'relative' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {story.user_id?.stage_name?.charAt(0) || 'A'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ mr: 1 }}>
                          {story.user_id?.stage_name || 'Anonymous'}
                        </Typography>
                        <Chip
                          icon={getPrivacyIcon(story.privacy_level)}
                          label={story.privacy_level}
                          color={getPrivacyColor(story.privacy_level) as any}
                          size="small"
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(story.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, story)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                    {story.text_content}
                  </Typography>

                  {story.tags.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      {story.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={`#${tag}`}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      size="small"
                      startIcon={<Favorite />}
                      color="inherit"
                    >
                      {story.likes_count || 0}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Comment />}
                      color="inherit"
                    >
                      {story.comments_count || 0}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Share />}
                      color="inherit"
                    >
                      Share
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {filteredStories.length === 0 && !loading && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              No stories found matching your criteria
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Box>
        )}
      </Box>

      {/* Add Story FAB */}
      <Fab
        color="primary"
        aria-label="add story"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setOpenDialog(true)}
      >
        <Add />
      </Fab>

      {/* Add Story Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Your Story</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This feature will be available soon! You'll be able to share your experiences in a safe, supportive environment.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Story Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Favorite />
          </ListItemIcon>
          <ListItemText>Like</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Comment />
          </ListItemIcon>
          <ListItemText>Comment</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Share />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Stories;