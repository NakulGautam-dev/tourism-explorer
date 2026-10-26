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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

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

  // Read query directly from top platform/sandbox search bar
  const platformQuery = props.searchQuery || rawSearchData.query || 'Tourist attractions in NYC';
  const entity = rawSearchData.entities?.[0] || null;
  const geo = entity?.entityInfo?.geo || null;

  // Initial city & coordinates from platform entity
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
  const themeName = props.UIOptions?.themeName || props.theme?.palette?.mode || 'light';
  const isDark = themeName === 'dark' || themeName === 'lightsOut';

  // 4. Quick Panel vs Fullscreen State
  const [isFullScreen, setIsFullScreen] = useState(
    props.UIOptions?.format === 'fullscreen'
  );

  // Sync when external UIOptions.format changes from sandbox toolbar
  useEffect(() => {
    if (props.UIOptions?.format === 'fullscreen') {
      setIsFullScreen(true);
    } else if (props.UIOptions?.format === 'sidebar' || props.UIOptions?.format === 'mainline') {
      setIsFullScreen(false);
    }
  }, [props.UIOptions?.format]);

  // Handlers for switching Full Screen mode
  const handleOpenFullScreen = () => {
    if (props.messageHandlers?.switchFullScreen) {
      props.messageHandlers.switchFullScreen(true);
    }
    setIsFullScreen(true);
  };

  const handleCloseFullScreen = () => {
    if (props.messageHandlers?.switchFullScreen) {
      props.messageHandlers.switchFullScreen(false);
    }
    setIsFullScreen(false);
  };

  // Keyboard shortcut: Press Escape to exit Full Screen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullScreen) {
        handleCloseFullScreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  // 5. Data State
  const [activeQuery, setActiveQuery] = useState(platformQuery);
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

  // Sync with incoming platform query changes from top search bar
  useEffect(() => {
    if (platformQuery && platformQuery !== activeQuery) {
      setActiveQuery(platformQuery);
    }
  }, [platformQuery]);

  // 6. Fetch Attractions & Weather from Backend Worker (Automatic Web Extraction)
  const fetchData = async (queryToSearch = activeQuery) => {
    setLoading(true);
    setError(null);

    try {
      // Build /api/places URL
      const placesUrl = new URL(`${API_URL}/api/places`);
      placesUrl.searchParams.set('query', queryToSearch);
      if (activeCoords.lat != null && activeCoords.lon != null) {
        placesUrl.searchParams.set('lat', activeCoords.lat);
        placesUrl.searchParams.set('lon', activeCoords.lon);
      }
      placesUrl.searchParams.set('city', activeCity);
      placesUrl.searchParams.set('country', activeCountry);
      if (userLat != null && userLon != null) {
        placesUrl.searchParams.set('userLat', userLat);
        placesUrl.searchParams.set('userLon', userLon);
      }

      // 1. Fetch live places from backend (Geoapify + Wikipedia Web Discovery)
      const placesRes = await fetch(placesUrl.toString()).then((r) => r.json());

      let currentLat = activeCoords.lat;
      let currentLon = activeCoords.lon;
      let currentCityName = activeCity;

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

      // 2. Fetch weather for the newly resolved city & coordinates
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
    fetchData(activeQuery);
  }, [activeQuery]);

  // 7. Category Counts Calculation
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
        p: isFullScreen ? { xs: 2, md: 3 } : 2,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box'
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          MODE A: FULL SCREEN VIEW (Activated when user clicks "See More" or "Full Screen")
         ───────────────────────────────────────────────────────────── */}
      {isFullScreen ? (
        <Box>
          {/* Top Header Bar with Back Button */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
              mb: 2.5,
              pb: 2,
              borderBottom: `1px solid ${border}`
            }}
          >
            {/* Left: Back Button & Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCloseFullScreen}
                startIcon={<ArrowBackIcon />}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: textPrimary,
                  borderColor: border,
                  px: 1.8,
                  py: 0.6,
                  '&:hover': {
                    borderColor: isDark ? '#60a5fa' : '#2563eb',
                    backgroundColor: isDark ? 'rgba(96,165,250,0.1)' : 'rgba(37,99,235,0.06)'
                  }
                }}
              >
                Back to Results
              </Button>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      color: textPrimary,
                      lineHeight: 1.2
                    }}
                  >
                    {activeCity}
                  </Typography>
                  <Chip
                    label="Full Guide"
                    size="small"
                    sx={{
                      fontSize: '0.72rem',
                      height: 22,
                      fontWeight: 700,
                      backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : '#eff6ff',
                      color: isDark ? '#60a5fa' : '#2563eb',
                      border: `1px solid ${isDark ? 'rgba(59,130,246,0.4)' : '#bfdbfe'}`
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: textSecondary }}>
                  {activeCountry} • Lat {activeCoords.lat?.toFixed(2)}°, Lon {activeCoords.lon?.toFixed(2)}°
                </Typography>
              </Box>
            </Box>

            {/* Right: Weather & Origin distance chip */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              {weather && (
                <Chip
                  icon={<WbSunnyIcon sx={{ fontSize: '15px !important', color: '#f59e0b' }} />}
                  label={`${weather.temperature}°C • ${weather.condition}`}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    border: `1px solid ${border}`,
                    color: textPrimary
                  }}
                />
              )}

              {userCity && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.6,
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    border: `1px solid ${border}`,
                    borderRadius: '20px',
                    px: 1.2,
                    py: 0.4
                  }}
                >
                  <NearMeIcon sx={{ fontSize: 13, color: '#10b981' }} />
                  <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 500 }}>
                    From <b>{userCity}</b>
                  </Typography>
                </Box>
              )}

              <Tooltip title="Exit Full Screen (Esc)">
                <IconButton
                  size="small"
                  onClick={handleCloseFullScreen}
                  sx={{
                    color: textSecondary,
                    border: `1px solid ${border}`,
                    borderRadius: '8px',
                    p: 0.6
                  }}
                >
                  <CloseFullscreenIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Weather Widget */}
          {weather && (
            <WeatherWidget weather={weather} isDark={isDark} isSidebar={false} />
          )}

          {/* Category Filter Chips */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            counts={categoryCounts}
            detectedFromQuery={detectedCategory}
            query={activeQuery}
            isDark={isDark}
          />

          {/* Full Screen Main Content: Dual-Column Wide Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' }, gap: 3 }}>
            {/* Left Column: All Sights & Attraction Cards */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: textPrimary }}>
                  All Attractions in {activeCity} ({displayedPlaces.length})
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary }}>
                  Click pins on map or cards for deep insights
                </Typography>
              </Box>

              {displayedPlaces.length === 0 ? (
                <EmptyState
                  city={activeCity}
                  category={selectedCategory}
                  onResetCategory={() => setSelectedCategory('all')}
                  onRetry={() => fetchData(activeQuery)}
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

            {/* Right Column: Sticky Vector Map & 1-Day Itinerary Planner */}
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

          {/* Bottom Back Button */}
          <Box sx={{ mt: 4, pt: 2, borderTop: `1px solid ${border}`, textAlign: 'center' }}>
            <Button
              variant="outlined"
              size="medium"
              onClick={handleCloseFullScreen}
              startIcon={<ArrowBackIcon />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                color: textPrimary,
                borderColor: border,
                px: 3,
                py: 0.8
              }}
            >
              Back to Quick View
            </Button>
          </Box>
        </Box>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            MODE B: QUICK PANEL VIEW (Concise, bite-sized preview with "See More ➔")
           ───────────────────────────────────────────────────────────── */
        <Box>
          {/* Destination Header Bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 1.5,
              mb: 1.5,
              pb: 1.5,
              borderBottom: `1px solid ${border}`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
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
                    fontSize: '1.2rem',
                    lineHeight: 1.2,
                    color: textPrimary
                  }}
                >
                  {activeCity}
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary }}>
                  {activeCountry}
                </Typography>
              </Box>
            </Box>

            {/* Quick Header Right: Weather badge + Fullscreen toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {weather && (
                <Chip
                  icon={<WbSunnyIcon sx={{ fontSize: '14px !important', color: '#f59e0b' }} />}
                  label={`${weather.temperature}°C`}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    border: `1px solid ${border}`,
                    color: textPrimary
                  }}
                />
              )}

              <Tooltip title="View in Full Screen Mode">
                <IconButton
                  size="small"
                  onClick={handleOpenFullScreen}
                  sx={{
                    color: textSecondary,
                    border: `1px solid ${border}`,
                    borderRadius: '8px',
                    p: 0.6,
                    '&:hover': {
                      color: isDark ? '#60a5fa' : '#2563eb',
                      borderColor: isDark ? '#60a5fa' : '#2563eb'
                    }
                  }}
                >
                  <OpenInFullIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* User Location Distance Badge (Kanpur / User IP) */}
          {userCity && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                border: `1px solid ${border}`,
                borderRadius: '20px',
                px: 1.2,
                py: 0.35,
                mb: 1.5
              }}
            >
              <NearMeIcon sx={{ fontSize: 12, color: '#10b981' }} />
              <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 500 }}>
                Searching from <b>{userCity}</b>
              </Typography>
            </Box>
          )}

          {/* Category Filter Chips for Quick Exploration */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            counts={categoryCounts}
            detectedFromQuery={detectedCategory}
            query={activeQuery}
            isDark={isDark}
          />

          {/* Loading Spinner */}
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 1.5 }}>
              <CircularProgress size={32} sx={{ color: '#2563eb' }} />
              <Typography variant="body2" sx={{ color: textSecondary, fontWeight: 500 }}>
                Finding top sights in {activeCity}...
              </Typography>
            </Box>
          ) : displayedPlaces.length === 0 ? (
            <EmptyState
              city={activeCity}
              category={selectedCategory}
              onResetCategory={() => setSelectedCategory('all')}
              onRetry={() => fetchData(activeQuery)}
              isDark={isDark}
            />
          ) : (
            /* Show ONLY Top 3 Sights on Quick Panel */
            <Box>
              {displayedPlaces.slice(0, 3).map((place, idx) => (
                <AttractionCard
                  key={place.id || idx}
                  place={place}
                  index={idx}
                  isDark={isDark}
                  isSidebar={true}
                  isSaved={!!savedPlaces[place.id]}
                  onToggleSave={handleToggleSave}
                  onSelectPlace={setSelectedPlaceForModal}
                  onViewOnMap={() => handleOpenFullScreen()}
                />
              ))}

              {/* Prominent "See More ➔" Action Banner */}
              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: `1px solid ${border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 600 }}>
                    Showing 3 of {places.length} top sights in {activeCity}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                    • Map & 1-Day Plan Ready
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleOpenFullScreen}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    py: 1.3,
                    px: 2,
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    textTransform: 'none',
                    letterSpacing: '0.01em',
                    background: isDark
                      ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                      : 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                    boxShadow: isDark
                      ? '0 4px 14px 0 rgba(37, 99, 235, 0.4)'
                      : '0 4px 14px 0 rgba(225, 29, 72, 0.35)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: isDark
                        ? '0 6px 20px 0 rgba(37, 99, 235, 0.5)'
                        : '0 6px 20px 0 rgba(225, 29, 72, 0.45)',
                      background: isDark
                        ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
                        : 'linear-gradient(135deg, #be123c 0%, #9f1239 100%)'
                    }
                  }}
                >
                  See More ({places.length} Sights, Map & 1-Day Itinerary)
                </Button>
              </Box>
            </Box>
          )}
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
