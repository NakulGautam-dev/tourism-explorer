import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Rating,
  IconButton,
  Tooltip
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NearMeIcon from '@mui/icons-material/NearMe';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import InfoIcon from '@mui/icons-material/InfoOutlined';

export default function AttractionCard({
  place,
  index,
  isDark,
  isSidebar,
  isSaved,
  onToggleSave,
  onSelectPlace,
  onViewOnMap
}) {
  const bg = isDark ? '#1e293b' : '#ffffff';
  const border = isDark ? '#334155' : '#e2e8f0';
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  const categoryColorMap = {
    museums: { bg: 'rgba(147, 51, 234, 0.12)', text: '#a855f7' },
    monuments: { bg: 'rgba(239, 68, 68, 0.12)', text: '#f87171' },
    temples: { bg: 'rgba(245, 158, 11, 0.12)', text: '#fbbf24' },
    forts: { bg: 'rgba(217, 119, 6, 0.12)', text: '#f59e0b' },
    parks: { bg: 'rgba(16, 185, 129, 0.12)', text: '#34d399' },
    viewpoints: { bg: 'rgba(59, 130, 246, 0.12)', text: '#60a5fa' },
    historic: { bg: 'rgba(202, 138, 4, 0.12)', text: '#facc15' },
    landmarks: { bg: 'rgba(99, 102, 241, 0.12)', text: '#818cf8' },
    sights: { bg: 'rgba(59, 130, 246, 0.12)', text: '#60a5fa' }
  };

  const badgeTheme = categoryColorMap[place.category] || categoryColorMap.sights;

  // Google Maps URL with lat/lon
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    place.name + ' ' + (place.address || '')
  )}&query_place_id=${place.id || ''}`;

  return (
    <Box
      sx={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: '14px',
        p: isSidebar ? 1.8 : 2.2,
        mb: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: isDark ? '#60a5fa' : '#3b82f6',
          boxShadow: isDark
            ? '0 6px 20px rgba(0,0,0,0.45)'
            : '0 6px 20px rgba(37,99,235,0.08)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      {/* Top Bar: Pin Number + Category Badge + Save Toggle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1.2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              backgroundColor: isDark ? '#3b82f6' : '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
              flexShrink: 0
            }}
          >
            {index + 1}
          </Box>
          <Chip
            size="small"
            label={place.categoryLabel || place.category}
            sx={{
              backgroundColor: badgeTheme.bg,
              color: badgeTheme.text,
              fontWeight: 600,
              fontSize: '0.72rem',
              height: 22
            }}
          />
          {place.recommendedTime && (
            <Chip
              size="small"
              icon={<AccessTimeIcon sx={{ fontSize: '12px !important' }} />}
              label={place.recommendedTime}
              variant="outlined"
              sx={{
                fontSize: '0.7rem',
                height: 22,
                borderColor: border,
                color: textSecondary
              }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={isSaved ? 'Remove from saved' : 'Save for itinerary'}>
            <IconButton
              size="small"
              onClick={() => onToggleSave(place)}
              sx={{ color: isSaved ? '#f59e0b' : textSecondary }}
            >
              {isSaved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Place Title + Rating */}
      <Box sx={{ mb: 1 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: textPrimary,
            fontSize: isSidebar ? '1rem' : '1.1rem',
            lineHeight: 1.3
          }}
        >
          {place.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.4 }}>
          <Rating
            value={place.rating ? place.rating - 0.5 : 4.5}
            precision={0.1}
            size="small"
            readOnly
            sx={{ fontSize: '0.9rem' }}
          />
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: textPrimary, fontSize: '0.78rem' }}
          >
            {place.rating || 4.7}
          </Typography>
          {place.suggestedHours && (
            <Typography variant="caption" sx={{ color: textSecondary }}>
              • {place.suggestedHours} visit
            </Typography>
          )}
        </Box>
      </Box>

      {/* Short Description */}
      <Typography
        variant="body2"
        sx={{
          color: textSecondary,
          fontSize: '0.85rem',
          lineHeight: 1.45,
          mb: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: isSidebar ? 2 : 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
      >
        {place.description}
      </Typography>

      {/* Distance and Location Details */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1.5,
          mb: 1.5,
          fontSize: '0.75rem',
          color: textSecondary
        }}
      >
        {place.distanceKm != null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <NearMeIcon sx={{ fontSize: 14, color: isDark ? '#60a5fa' : '#2563eb' }} />
            <span>{place.distanceKm} km from center</span>
          </Box>
        )}

        {place.distanceFromUserKm != null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <LocationOnIcon sx={{ fontSize: 14, color: '#10b981' }} />
            <span>{Math.round(place.distanceFromUserKm)} km from your location</span>
          </Box>
        )}
      </Box>

      {/* Highlights / Features Tags */}
      {Array.isArray(place.highlights) && place.highlights.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1.5 }}>
          {place.highlights.map((h, i) => (
            <Chip
              key={i}
              label={h}
              size="small"
              sx={{
                fontSize: '0.68rem',
                height: 20,
                backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                border: `1px solid ${border}`,
                color: textSecondary
              }}
            />
          ))}
        </Box>
      )}

      {/* Bottom Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: 1,
          borderTop: `1px dashed ${border}`
        }}
      >
        <Button
          size="small"
          startIcon={<InfoIcon sx={{ fontSize: '15px !important' }} />}
          onClick={() => onSelectPlace(place)}
          sx={{
            textTransform: 'none',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: isDark ? '#60a5fa' : '#2563eb'
          }}
        >
          Dig Deeper
        </Button>

        <Box sx={{ display: 'flex', gap: 0.8 }}>
          {onViewOnMap && (
            <Button
              size="small"
              variant="text"
              startIcon={<LocationOnIcon sx={{ fontSize: '15px !important' }} />}
              onClick={() => onViewOnMap(place)}
              sx={{
                textTransform: 'none',
                fontSize: '0.75rem',
                color: textSecondary
              }}
            >
              Pin
            </Button>
          )}

          <Button
            size="small"
            variant="outlined"
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
            sx={{
              textTransform: 'none',
              fontSize: '0.75rem',
              fontWeight: 500,
              borderColor: border,
              color: textSecondary,
              '&:hover': {
                borderColor: isDark ? '#94a3b8' : '#64748b',
                color: textPrimary
              }
            }}
          >
            Directions
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
