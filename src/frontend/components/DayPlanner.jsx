import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Divider
} from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

export default function DayPlanner({
  places = [],
  city = 'City',
  isDark,
  isSidebar,
  onSelectPlace
}) {
  const [completedStops, setCompletedStops] = useState({});

  const toggleStop = (id) => {
    setCompletedStops((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Group places into Morning, Afternoon, Evening
  const morningPlaces = places.filter((p) => p.recommendedTime === 'Morning');
  const afternoonPlaces = places.filter((p) => p.recommendedTime === 'Afternoon');
  const eveningPlaces = places.filter((p) => p.recommendedTime === 'Evening');

  // Fill fallbacks if some buckets are empty
  const morning = morningPlaces.length > 0 ? morningPlaces : places.slice(0, 1);
  const afternoon = afternoonPlaces.length > 0 ? afternoonPlaces : places.slice(1, 3);
  const evening = eveningPlaces.length > 0 ? eveningPlaces : places.slice(3, 5);

  const sections = [
    {
      time: 'Morning (09:00 - 12:30)',
      icon: <WbSunnyIcon sx={{ color: '#f59e0b', fontSize: 18 }} />,
      themeColor: '#f59e0b',
      themeBg: isDark ? 'rgba(245,158,11,0.1)' : '#fffbeb',
      themeBorder: isDark ? 'rgba(245,158,11,0.3)' : '#fde68a',
      title: 'Morning Cultural Kickoff',
      advice: 'Arrive at the opening hour to explore top highlights before midday crowds arrive.',
      stops: morning
    },
    {
      time: 'Afternoon (13:30 - 17:00)',
      icon: <WbTwilightIcon sx={{ color: '#10b981', fontSize: 18 }} />,
      themeColor: '#10b981',
      themeBg: isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5',
      themeBorder: isDark ? 'rgba(16,185,129,0.3)' : '#a7f3d0',
      title: 'Heritage Walk & Scenic Parks',
      advice: 'Combine adjacent sights on foot with a stroll through iconic avenues or gardens.',
      stops: afternoon
    },
    {
      time: 'Evening (18:00 - 20:30)',
      icon: <NightsStayIcon sx={{ color: '#8b5cf6', fontSize: 18 }} />,
      themeColor: '#8b5cf6',
      themeBg: isDark ? 'rgba(139,92,246,0.1)' : '#f5f3ff',
      themeBorder: isDark ? 'rgba(139,92,246,0.3)' : '#ddd6fe',
      title: 'Sunset Panorama & Night Lights',
      advice: 'Head to the observation deck or bridge for golden hour sunset and illuminated landmarks.',
      stops: evening
    }
  ];

  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const border = isDark ? '#334155' : '#e2e8f0';
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  return (
    <Box>
      {/* Header Plan Summary */}
      <Box
        sx={{
          backgroundColor: isDark ? '#1e293b' : '#f8fafc',
          border: `1px solid ${border}`,
          borderRadius: '12px',
          p: 1.8,
          mb: 2.5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: textPrimary }}>
            🗓️ Optimized 1-Day Itinerary for {city}
          </Typography>
          <Chip
            size="small"
            label="Proximity Ordered"
            sx={{
              backgroundColor: isDark ? 'rgba(37,99,235,0.2)' : '#dbeafe',
              color: isDark ? '#93c5fd' : '#1e40af',
              fontWeight: 600,
              fontSize: '0.7rem'
            }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: textSecondary, fontSize: '0.82rem' }}>
          Sensibly grouped by geographic proximity and optimal lighting conditions so you see what is truly worth visiting without backtracking.
        </Typography>
      </Box>

      {/* 3 Day Slots */}
      {sections.map((sec, idx) => (
        <Box
          key={idx}
          sx={{
            backgroundColor: cardBg,
            border: `1px solid ${border}`,
            borderRadius: '14px',
            p: isSidebar ? 1.5 : 2,
            mb: 2,
            boxShadow: isDark
              ? '0 2px 8px rgba(0,0,0,0.3)'
              : '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          {/* Time Slot Bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: sec.themeBg,
              border: `1px solid ${sec.themeBorder}`,
              borderRadius: '8px',
              px: 1.2,
              py: 0.6,
              mb: 1.5
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {sec.icon}
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: sec.themeColor, fontSize: '0.85rem' }}
              >
                {sec.time}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: sec.themeColor, fontWeight: 600 }}>
              {sec.stops.length} Stops
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{ color: textSecondary, fontSize: '0.8rem', fontStyle: 'italic', mb: 1.5 }}
          >
            💡 {sec.advice}
          </Typography>

          {/* Attraction Stops inside this Slot */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {sec.stops.map((stop, sIdx) => {
              const isChecked = !!completedStops[stop.id];

              return (
                <Paper
                  key={stop.id || sIdx}
                  elevation={0}
                  onClick={() => onSelectPlace(stop)}
                  sx={{
                    p: 1.2,
                    borderRadius: '10px',
                    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                    border: `1px solid ${border}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '&:hover': {
                      borderColor: sec.themeColor,
                      backgroundColor: isDark ? '#1e293b' : '#f1f5f9'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStop(stop.id);
                      }}
                      sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      {isChecked ? (
                        <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981' }} />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: textSecondary }} />
                      )}
                    </Box>

                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: textPrimary,
                          fontSize: '0.88rem',
                          textDecoration: isChecked ? 'line-through' : 'none',
                          opacity: isChecked ? 0.6 : 1
                        }}
                      >
                        {stop.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: textSecondary, fontSize: '0.72rem', display: 'block' }}
                      >
                        ⭐ {stop.rating} • {stop.categoryLabel || stop.category} • {stop.suggestedHours || '1.5 hrs'}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    size="small"
                    icon={<DirectionsWalkIcon sx={{ fontSize: '12px !important' }} />}
                    label={stop.distanceKm != null ? `${stop.distanceKm} km` : 'Near'}
                    variant="outlined"
                    sx={{
                      fontSize: '0.7rem',
                      height: 22,
                      borderColor: border,
                      color: textSecondary
                    }}
                  />
                </Paper>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
