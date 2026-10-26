import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Button
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import NavigationIcon from '@mui/icons-material/Navigation';

export default function InteractiveMap({
  places = [],
  center,
  city = 'City',
  selectedPlace,
  onSelectPlace,
  isDark,
  isSidebar
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activePin, setActivePin] = useState(null);

  // Compute bounding box
  const bounds = useMemo(() => {
    if (!places || places.length === 0) {
      const cLat = center?.lat || 40.7128;
      const cLon = center?.lon || -74.006;
      return {
        minLat: cLat - 0.04,
        maxLat: cLat + 0.04,
        minLon: cLon - 0.04,
        maxLon: cLon + 0.04
      };
    }

    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLon = Infinity;
    let maxLon = -Infinity;

    places.forEach((p) => {
      if (p.lat != null && p.lon != null) {
        if (p.lat < minLat) minLat = p.lat;
        if (p.lat > maxLat) maxLat = p.lat;
        if (p.lon < minLon) minLon = p.lon;
        if (p.lon > maxLon) maxLon = p.lon;
      }
    });

    // Add padding margin
    const latSpan = Math.max(maxLat - minLat, 0.02);
    const lonSpan = Math.max(maxLon - minLon, 0.02);
    const padding = 0.2;

    return {
      minLat: minLat - latSpan * padding,
      maxLat: maxLat + latSpan * padding,
      minLon: minLon - lonSpan * padding,
      maxLon: maxLon + lonSpan * padding
    };
  }, [places, center]);

  // Project lat/lon to percentage (0% - 100%)
  const project = (lat, lon) => {
    const latRange = bounds.maxLat - bounds.minLat || 1;
    const lonRange = bounds.maxLon - bounds.minLon || 1;
    // Y is inverted because higher latitude is North (top)
    const y = ((bounds.maxLat - lat) / latRange) * 100;
    const x = ((lon - bounds.minLon) / lonRange) * 100;
    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(8, Math.min(92, y))
    };
  };

  const mapBg = isDark ? '#0f172a' : '#f8fafc';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: isSidebar ? '300px' : '380px',
        backgroundColor: mapBg,
        borderRadius: '16px',
        border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
        overflow: 'hidden',
        boxShadow: isDark
          ? '0 4px 16px rgba(0,0,0,0.4)'
          : '0 4px 16px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Top Map Header Bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 12,
          zIndex: 10,
          backgroundColor: isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(6px)',
          borderRadius: '8px',
          px: 1.2,
          py: 0.5,
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}
        >
          📍 {city} Attraction Map ({places.length} Sights)
        </Typography>
      </Box>

      {/* Map Control Buttons */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 12,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          backgroundColor: isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(6px)',
          borderRadius: '8px',
          p: 0.4,
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
        }}
      >
        <Tooltip title="Zoom In">
          <IconButton
            size="small"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2))}
            sx={{ color: textColor, p: 0.4 }}
          >
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton
            size="small"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
            sx={{ color: textColor, p: 0.4 }}
          >
            <ZoomOutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset View">
          <IconButton
            size="small"
            onClick={() => {
              setZoomLevel(1);
              setActivePin(null);
            }}
            sx={{ color: textColor, p: 0.4 }}
          >
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* SVG Canvas Map Background */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease-out'
        }}
      >
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Subtle Coordinate Grid Lines */}
          <line x1="25%" y1="0%" x2="25%" y2="100%" stroke={gridColor} strokeDasharray="3 3" />
          <line x1="50%" y1="0%" x2="50%" y2="100%" stroke={gridColor} strokeDasharray="3 3" />
          <line x1="75%" y1="0%" x2="75%" y2="100%" stroke={gridColor} strokeDasharray="3 3" />
          <line x1="0%" y1="33%" x2="100%" y2="33%" stroke={gridColor} strokeDasharray="3 3" />
          <line x1="0%" y1="66%" x2="100%" y2="66%" stroke={gridColor} strokeDasharray="3 3" />

          {/* Suggested Walking / Itinerary Route Connecting Consecutive Sights */}
          {places.length > 1 && (
            <polyline
              fill="none"
              stroke={isDark ? '#3b82f6' : '#2563eb'}
              strokeWidth="2.5"
              strokeDasharray="6 4"
              opacity="0.6"
              points={places
                .map((p) => {
                  const pt = project(p.lat, p.lon);
                  return `${pt.x}%,${pt.y}%`;
                })
                .join(' ')}
            />
          )}

          {/* City Center Pulse Marker */}
          {center?.lat != null && center?.lon != null && (
            <g>
              {(() => {
                const c = project(center.lat, center.lon);
                return (
                  <>
                    <circle
                      cx={`${c.x}%`}
                      cy={`${c.y}%`}
                      r="16"
                      fill={isDark ? 'rgba(59,130,246,0.15)' : 'rgba(37,99,235,0.1)'}
                    />
                    <circle
                      cx={`${c.x}%`}
                      cy={`${c.y}%`}
                      r="5"
                      fill={isDark ? '#60a5fa' : '#2563eb'}
                    />
                  </>
                );
              })()}
            </g>
          )}
        </svg>

        {/* Numbered Attraction Pins */}
        {places.map((place, idx) => {
          const pt = project(place.lat, place.lon);
          const isSelected = selectedPlace?.id === place.id || activePin?.id === place.id;

          return (
            <Box
              key={place.id || idx}
              onClick={() => {
                setActivePin(place);
                if (onSelectPlace) onSelectPlace(place);
              }}
              sx={{
                position: 'absolute',
                left: `${pt.x}%`,
                top: `${pt.y}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                zIndex: isSelected ? 20 : 5,
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '&:hover': {
                  transform: 'translate(-50%, -50%) scale(1.25)',
                  zIndex: 25
                }
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: isSelected ? 32 : 26,
                  height: isSelected ? 32 : 26,
                  borderRadius: '50%',
                  backgroundColor: isSelected
                    ? '#f59e0b'
                    : isDark
                    ? '#2563eb'
                    : '#1d4ed8',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: isSelected ? '0.85rem' : '0.75rem',
                  border: '2px solid #ffffff',
                  boxShadow: isSelected
                    ? '0 0 16px rgba(245,158,11,0.8)'
                    : '0 2px 8px rgba(0,0,0,0.3)'
                }}
              >
                {idx + 1}
              </Box>

              {/* Pin Label on Hover or Active */}
              {isSelected && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '110%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                    borderRadius: '6px',
                    px: 1,
                    py: 0.3,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    pointerEvents: 'none'
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: isDark ? '#f8fafc' : '#0f172a',
                      fontSize: '0.72rem'
                    }}
                  >
                    {place.name}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Selected Pin Mini Popup Card at Bottom */}
      {activePin && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            right: 8,
            zIndex: 30,
            p: 1.2,
            borderRadius: '10px',
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1
          }}
        >
          <Box sx={{ overflow: 'hidden' }}>
            <Typography
              variant="subtitle2"
              noWrap
              sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.85rem' }}
            >
              {activePin.name}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{ color: isDark ? '#94a3b8' : '#64748b', display: 'block', fontSize: '0.72rem' }}
            >
              ⭐ {activePin.rating} • {activePin.categoryLabel || activePin.category} • {activePin.distanceKm || '1.2'} km from center
            </Typography>
          </Box>

          <Button
            size="small"
            variant="contained"
            onClick={() => onSelectPlace(activePin)}
            sx={{
              textTransform: 'none',
              fontSize: '0.72rem',
              fontWeight: 600,
              flexShrink: 0,
              backgroundColor: isDark ? '#3b82f6' : '#2563eb'
            }}
          >
            Details
          </Button>
        </Paper>
      )}

      {/* Legend Footer */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 6,
          right: 8,
          zIndex: 10,
          backgroundColor: isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(4px)',
          borderRadius: '6px',
          px: 1,
          py: 0.3,
          display: activePin ? 'none' : 'flex',
          alignItems: 'center',
          gap: 1.2,
          fontSize: '0.68rem',
          color: textColor
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2563eb' }} />
          <span>Numbered Pin = Sight</span>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
          <Box sx={{ width: 8, height: 2, backgroundColor: '#2563eb' }} />
          <span>Dashed Line = Suggested Route</span>
        </Box>
      </Box>
    </Box>
  );
}
