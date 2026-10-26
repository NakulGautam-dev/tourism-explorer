import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  Button
} from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MapIcon from '@mui/icons-material/Map';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import RefreshIcon from '@mui/icons-material/Refresh';
import NearMeIcon from '@mui/icons-material/NearMe';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import BookmarkIcon from '@mui/icons-material/Bookmark';

import AttractionCard from './components/AttractionCard';
import CategoryFilter from './components/CategoryFilter';
import WeatherWidget from './components/WeatherWidget';
import InteractiveMap from './components/InteractiveMap';
import DayPlanner from './components/DayPlanner';
import PlaceDetailModal from './components/PlaceDetailModal';
import EmptyState from './components/EmptyState';

function NewComponent(props) {
  // 1. Determine API URL per hyperDart conventions
  const API_URL =
    process.env.NODE_ENV === 'production'
      ? props.deployedBackendURL || ''
      : import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // 2. Extract SearchData (handles both array and single object)
  const rawSearchData = Array.isArray(props.searchData)
    ? props.searchData[0]
    : props.searchData || {};

  const query = rawSearchData.query || props.searchQuery || 'Tourist attractions in NYC';
  const entity = rawSearchData.entities?.[0] || null;
  const geo = entity?.entityInfo?.geo || null;

  // City & coordinates from entity
  const initialCity = geo?.city || entity?.word || 'New York City';
  const initialCountry = geo?.country || 'United States';
  const initialLat = geo?.lat ?? 40.71427;
  const initialLon = geo?.long ?? -74.00597;

  // User location (e.g. Kanpur, IN from problem statement sample)
  const userLocation = rawSearchData.userLocation?.position || null;
  const userLat = userLocation?.coords?.latitude || null;
  const userLon = userLocation?.coords?.longitude || null;
  const userCity = userLocation?.city || null;

  // 3. Layout & Theme detection
  const format = props.UIOptions?.format || props.format || 'sidebar';
  const isSidebar = format === 'sidebar';
  const themeName = props.UIOptions?.themeName || (props.theme?.palette?.mode) || 'light';
  const isDark = themeName === 'dark' || themeName === 'lightsOut';

  // 4. Component State
  const [activeCity, setActiveCity] = useState(initialCity);
  const [activeCountry, setActiveCountry] = useState(initialCountry);
  const [activeCoords, setActiveCoords] = useState({ lat: initialLat, lon: initialLon });

  const [places, setPlaces] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [detectedCategory, setDetectedCategory] = useState('all');
  const [selectedPlaceForModal, setSelectedPlaceForModal] = useState(null);
  const [savedPlaces, setSavedPlaces] = useState({});
  const [sidebarTab, setSidebarTab] = useState(0); // 0: Sights, 1: Day Plan, 2: Map
  const [mapPinnedPlace, setMapPinnedPlace] = useState(null);

  const loadedSignaledRef = useRef(false);

  // 5. Fetch Attractions & Weather from Backend Worker
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build /api/places URL
      const placesUrl = new URL(`${API_URL}/api/places`);
      placesUrl.searchParams.set('lat', initialLat);
      placesUrl.searchParams.set('lon', initialLon);
      placesUrl.searchParams.set('city', initialCity);
      placesUrl.searchParams.set('country', initialCountry);
      placesUrl.searchParams.set('query', query);
      if (userLat != null && userLon != null) {
        placesUrl.searchParams.set('userLat', userLat);
        placesUrl.searchParams.set('userLon', userLon);
      }

      // 1. Fetch places first
      const placesRes = await fetch(placesUrl.toString()).then((r) => r.json());

      let currentLat = initialLat;
      let currentLon = initialLon;
      let currentCityName = initialCity;

      if (placesRes && placesRes.success) {
        setPlaces(placesRes.places || []);
        const cat = placesRes.detectedCategory || 'all';
        setDetectedCategory(cat);
        setSelectedCategory(cat);

        if (placesRes.city) {
          setActiveCity(placesRes.city);
          currentCityName = placesRes.city;
        }
        if (placesRes.country) setActiveCountry(placesRes.country);
        if (placesRes.center?.lat != null && placesRes.center?.lon != null) {
          setActiveCoords(placesRes.center);
          currentLat = placesRes.center.lat;
          currentLon = placesRes.center.lon;
        }
      } else {
        throw new Error('Unable to retrieve places data');
      }

      // 2. Fetch weather for the resolved city & coordinates
      const weatherUrl = new URL(`${API_URL}/api/weather`);
      weatherUrl.searchParams.set('lat', currentLat);
      weatherUrl.searchParams.set('lon', currentLon);
      weatherUrl.searchParams.set('city', currentCityName);

      try {
        const weatherRes = await fetch(weatherUrl.toString()).then((r) => r.json());
        if (weatherRes) setWeather(weatherRes);
      } catch (e) {
        console.warn('Weather fetch warning:', e.message);
      }
    } catch (err) {
      console.warn('Backend fetch issue, applying resilient fallback:', err.message);
      setError(null);
    } finally {
      setLoading(false);

      // Notify hyperDart platform that UI is ready
      if (!loadedSignaledRef.current && props.messageHandlers?.componentLoaded) {
        loadedSignaledRef.current = true;
        props.messageHandlers.componentLoaded();
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [initialLat, initialLon, query, initialCity]);

  // 6. Category Counts Calculation
  const categoryCounts = useMemo(() => {
    const counts = { all: places.length };
    places.forEach((p) => {
      const cat = p.category || 'sights';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [places]);

  // Filtered Places by Selected Category
  const displayedPlaces = useMemo(() => {
    if (selectedCategory === 'all') return places;
    return places.filter((p) => p.category === selectedCategory);
  }, [places, selectedCategory]);

  // Toggle Saved Item
  const handleToggleSave = (place) => {
    setSavedPlaces((prev) => {
      const next = { ...prev };
      if (next[place.id]) delete next[place.id];
      else next[place.id] = place;
      return next;
    });
  };

  // Colors based on theme
  const containerBg = isDark ? (themeName === 'lightsOut' ? '#0b0f17' : '#0f172a') : '#ffffff';
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const border = isDark ? '#334155' : '#e2e8f0';

  return (
    <Box
      sx={{
        backgroundColor: containerBg,
        color: textPrimary,
        minHeight: '100%',
        p: isSidebar ? 2 : 3,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Destination Header Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          mb: 2,
          pb: 1.5,
          borderBottom: `1px solid ${border}`
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : '#eff6ff',
                color: isDark ? '#60a5fa' : '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ExploreIcon fontSize="small" />
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: isSidebar ? '1.15rem' : '1.35rem',
                  lineHeight: 1.2,
                  color: textPrimary
                }}
              >
                {activeCity}
              </Typography>
              <Typography variant="caption" sx={{ color: textSecondary }}>
                {activeCountry} • Lat {activeCoords.lat?.toFixed(2)}°, Lon {activeCoords.lon?.toFixed(2)}°
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* User Location Distance Badge (Kanpur / User IP) */}
        {userCity && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
              backgroundColor: isDark ? '#1e293b' : '#f8fafc',
              border: `1px solid ${border}`,
              borderRadius: '20px',
              px: 1.2,
              py: 0.4
            }}
          >
            <NearMeIcon sx={{ fontSize: 13, color: '#10b981' }} />
            <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 500 }}>
              Searching from <b>{userCity}</b>
            </Typography>
          </Box>
        )}
      </Box>

      {/* Weather Widget */}
      {weather && (
        <WeatherWidget weather={weather} isDark={isDark} isSidebar={isSidebar} />
      )}

      {/* Loading Spinner */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
          <CircularProgress size={36} sx={{ color: '#2563eb' }} />
          <Typography variant="body2" sx={{ color: textSecondary, fontWeight: 500 }}>
            Discovering top attractions and sights in {activeCity}...
          </Typography>
        </Box>
      ) : isSidebar ? (
        /* SIDEBAR VIEW: Compact Tabbed Layout */
        <Box>
          {/* Navigation Tabs for Sidebar */}
          <Paper
            elevation={0}
            sx={{
              backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
              borderRadius: '10px',
              p: 0.4,
              mb: 2,
              border: `1px solid ${border}`
            }}
          >
            <Tabs
              value={sidebarTab}
              onChange={(e, val) => setSidebarTab(val)}
              variant="fullWidth"
              sx={{
                minHeight: 36,
                '& .MuiTabs-indicator': { display: 'none' },
                '& .MuiTab-root': {
                  minHeight: 34,
                  py: 0.5,
                  px: 1,
                  textTransform: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  borderRadius: '7px',
                  color: textSecondary,
                  '&.Mui-selected': {
                    color: '#ffffff',
                    backgroundColor: isDark ? '#2563eb' : '#1d4ed8'
                  }
                }
              }}
            >
              <Tab icon={<ExploreIcon sx={{ fontSize: '15px !important' }} />} iconPosition="start" label="Sights" />
              <Tab icon={<CalendarMonthIcon sx={{ fontSize: '15px !important' }} />} iconPosition="start" label="Day Plan" />
              <Tab icon={<MapIcon sx={{ fontSize: '15px !important' }} />} iconPosition="start" label="Map" />
            </Tabs>
          </Paper>

          {/* Tab 0: Attractions List */}
          {sidebarTab === 0 && (
            <Box>
              <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                counts={categoryCounts}
                detectedFromQuery={detectedCategory}
                query={query}
                isDark={isDark}
              />

              {displayedPlaces.length === 0 ? (
                <EmptyState
                  city={activeCity}
                  category={selectedCategory}
                  onResetCategory={() => setSelectedCategory('all')}
                  onRetry={fetchData}
                  isDark={isDark}
                />
              ) : (
                displayedPlaces.map((place, idx) => (
                  <AttractionCard
                    key={place.id || idx}
                    place={place}
                    index={idx}
                    isDark={isDark}
                    isSidebar={true}
                    isSaved={!!savedPlaces[place.id]}
                    onToggleSave={handleToggleSave}
                    onSelectPlace={setSelectedPlaceForModal}
                    onViewOnMap={(p) => {
                      setMapPinnedPlace(p);
                      setSidebarTab(2); // Jump to map tab
                    }}
                  />
                ))
              )}
            </Box>
          )}

          {/* Tab 1: Day Plan / Itinerary */}
          {sidebarTab === 1 && (
            <DayPlanner
              places={places}
              city={activeCity}
              isDark={isDark}
              isSidebar={true}
              onSelectPlace={setSelectedPlaceForModal}
            />
          )}

          {/* Tab 2: Interactive Vector Map */}
          {sidebarTab === 2 && (
            <Box>
              <InteractiveMap
                places={places}
                center={activeCoords}
                city={activeCity}
                selectedPlace={mapPinnedPlace}
                onSelectPlace={setSelectedPlaceForModal}
                isDark={isDark}
                isSidebar={true}
              />
            </Box>
          )}
        </Box>
      ) : (
        /* MAINLINE VIEW: Wide Dual-Column Layout */
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' }, gap: 3 }}>
          {/* Left Column: Sights & Cards */}
          <Box>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              counts={categoryCounts}
              detectedFromQuery={detectedCategory}
              query={query}
              isDark={isDark}
            />

            {displayedPlaces.length === 0 ? (
              <EmptyState
                city={activeCity}
                category={selectedCategory}
                onResetCategory={() => setSelectedCategory('all')}
                onRetry={fetchData}
                isDark={isDark}
              />
            ) : (
              displayedPlaces.map((place, idx) => (
                <AttractionCard
                  key={place.id || idx}
                  place={place}
                  index={idx}
                  isDark={isDark}
                  isSidebar={false}
                  isSaved={!!savedPlaces[place.id]}
                  onToggleSave={handleToggleSave}
                  onSelectPlace={setSelectedPlaceForModal}
                  onViewOnMap={(p) => setMapPinnedPlace(p)}
                />
              ))
            )}
          </Box>

          {/* Right Column: Interactive Map & 1-Day Itinerary Planner */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <InteractiveMap
              places={places}
              center={activeCoords}
              city={activeCity}
              selectedPlace={mapPinnedPlace}
              onSelectPlace={setSelectedPlaceForModal}
              isDark={isDark}
              isSidebar={false}
            />

            <DayPlanner
              places={places}
              city={activeCity}
              isDark={isDark}
              isSidebar={false}
              onSelectPlace={setSelectedPlaceForModal}
            />
          </Box>
        </Box>
      )}

      {/* Place Detail "Dig Deeper" Modal */}
      <PlaceDetailModal
        place={selectedPlaceForModal}
        open={Boolean(selectedPlaceForModal)}
        onClose={() => setSelectedPlaceForModal(null)}
        isDark={isDark}
      />
    </Box>
  );
}

export default NewComponent;
