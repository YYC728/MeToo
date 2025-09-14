import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
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
} from '@mui/material';
import {
  Add,
  Search,
  LocationOn,
  AccessTime,
  Restaurant,
  FilterList,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface Meal {
  _id: string;
  dish_name: string;
  dietary_group: string;
  portion_size: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  pickup_time_window: {
    start: string;
    end: string;
  };
  allergens: string[];
  user_id: {
    stage_name: string;
    disclosure_preferences: {
      university_visibility: boolean;
    };
  };
  availability_dates: string[];
  created_at: string;
}

const Meals: React.FC = () => {
  // Removed unused useAuth import and variable
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      // This would call your actual API
      // const response = await api.get('/meals');
      // setMeals(response.data);
      
      // Mock data for now
      setMeals([
        {
          _id: '1',
          dish_name: 'Homemade Pasta',
          dietary_group: 'Vegetarian',
          portion_size: 'Large',
          location: {
            type: 'Point',
            coordinates: [-74.0059, 40.7128]
          },
          pickup_time_window: {
            start: '18:00',
            end: '20:00'
          },
          allergens: ['Gluten'],
          user_id: {
            stage_name: 'Sarah M.',
            disclosure_preferences: {
              university_visibility: true
            }
          },
          availability_dates: ['2024-01-15', '2024-01-16'],
          created_at: '2024-01-14T10:00:00Z'
        },
        {
          _id: '2',
          dish_name: 'Chicken Curry',
          dietary_group: 'Non-Vegetarian',
          portion_size: 'Medium',
          location: {
            type: 'Point',
            coordinates: [-74.0059, 40.7128]
          },
          pickup_time_window: {
            start: '19:00',
            end: '21:00'
          },
          allergens: ['Dairy'],
          user_id: {
            stage_name: 'Alex K.',
            disclosure_preferences: {
              university_visibility: true
            }
          },
          availability_dates: ['2024-01-15'],
          created_at: '2024-01-14T11:00:00Z'
        }
      ]);
    } catch (err: any) {
      setError('Failed to fetch meals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.dish_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDietary = !dietaryFilter || meal.dietary_group === dietaryFilter;
    return matchesSearch && matchesDietary;
  });

  const getDietaryColor = (group: string) => {
    switch (group) {
      case 'Vegetarian': return 'success';
      case 'Vegan': return 'success';
      case 'Non-Vegetarian': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🍽️ Available Meals
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Discover meals shared by fellow students in your area
        </Typography>

        {/* Search and Filter */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search meals..."
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
            <InputLabel>Dietary Group</InputLabel>
            <Select
              value={dietaryFilter}
              onChange={(e) => setDietaryFilter(e.target.value)}
              startAdornment={<FilterList />}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Vegetarian">Vegetarian</MenuItem>
              <MenuItem value="Vegan">Vegan</MenuItem>
              <MenuItem value="Non-Vegetarian">Non-Vegetarian</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Meals Grid */}
        {loading ? (
          <Box textAlign="center" py={4}>
            <Typography>Loading meals...</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredMeals.map((meal) => (
              <Grid item xs={12} sm={6} md={4} key={meal._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Restaurant sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6" component="h3">
                        {meal.dish_name}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={meal.dietary_group}
                        color={getDietaryColor(meal.dietary_group) as any}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={meal.portion_size}
                        variant="outlined"
                        size="small"
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                        Near campus
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
                        {meal.pickup_time_window.start} - {meal.pickup_time_window.end}
                      </Typography>
                    </Box>

                    {meal.allergens.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Allergens: {meal.allergens.join(', ')}
                        </Typography>
                      </Box>
                    )}

                    <Typography variant="body2" color="text.secondary">
                      Shared by {meal.user_id.stage_name}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button size="small" variant="outlined">
                      View Details
                    </Button>
                    <Button size="small" variant="contained">
                      Request Meal
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {filteredMeals.length === 0 && !loading && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              No meals found matching your criteria
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Box>
        )}
      </Box>

      {/* Add Meal FAB */}
      <Fab
        color="primary"
        aria-label="add meal"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setOpenDialog(true)}
      >
        <Add />
      </Fab>

      {/* Add Meal Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share a Meal</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This feature will be available soon! You'll be able to share your extra meals with fellow students.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Meals;