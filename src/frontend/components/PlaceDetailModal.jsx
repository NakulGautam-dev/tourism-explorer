import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  Button,
  Rating,
  IconButton,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NearMeIcon from '@mui/icons-material/NearMe';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PublicIcon from '@mui/icons-material/Public';
import StarIcon from '@mui/icons-material/Star';

export default function PlaceDetailModal({
  place,
  open,
  onClose,
  isDark
}) {
  if (!place) return null;

  const bg = isDark ? '#1e293b' : '#ffffff';
  const border = isDark ? '#334155' : '#e2e8f0';
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    place.name + ' ' + (place.address || '')
  )}`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: bg,
          borderRadius: '16px',
          border: `1px solid ${border}`,
          backgroundImage: 'none',
          boxShadow: isDark
            ? '0 12px 32px rgba(0,0,0,0.6)'
            : '0 12px 32px rgba(0,0,0,0.1)'
        }
      }}
    >
      {/* Modal Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          pb: 1,
          pt: 2.5
        }}
      >
        <Box sx={{ pr: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
            <Chip
              size="small"
              label={place.categoryLabel || place.category}
              sx={{
                backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : '#dbeafe',
                color: isDark ? '#93c5fd' : '#1e40af',
                fontWeight: 600,
                fontSize: '0.72rem'
              }}
            />
            {place.recommendedTime && (
              <Chip
                size="small"
                icon={<AccessTimeIcon sx={{ fontSize: '12px !important' }} />}
                label={place.recommendedTime}
                variant="outlined"
                sx={{
                  borderColor: border,
                  color: textSecondary,
                  fontSize: '0.72rem'
                }}
              />
            )}
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: textPrimary, lineHeight: 1.25 }}
          >
            {place.name}
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: textSecondary }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {/* Rating and Duration */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Rating
            value={place.rating ? place.rating - 0.5 : 4.5}
            precision={0.1}
            size="small"
            readOnly
          />
          <Typography variant="body2" sx={{ fontWeight: 700, color: textPrimary }}>
            {place.rating || 4.7} / 5.0
          </Typography>
          {place.suggestedHours && (
            <Typography variant="caption" sx={{ color: textSecondary }}>
              • Recommended duration: {place.suggestedHours}
            </Typography>
          )}
        </Box>

        {/* Full Description */}
        <Typography
          variant="body1"
          sx={{ color: textPrimary, lineHeight: 1.6, fontSize: '0.92rem', mb: 2 }}
        >
          {place.description}
        </Typography>

        {/* Location & Distance Information */}
        <Box
          sx={{
            backgroundColor: isDark ? '#0f172a' : '#f8fafc',
            border: `1px solid ${border}`,
            borderRadius: '10px',
            p: 1.5,
            mb: 2.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
            <LocationOnIcon sx={{ fontSize: 18, color: '#3b82f6', mt: 0.2 }} />
            <Box>
              <Typography variant="caption" sx={{ color: textSecondary, display: 'block' }}>
                Address & Coordinates
              </Typography>
              <Typography variant="body2" sx={{ color: textPrimary, fontWeight: 500 }}>
                {place.address}
              </Typography>
              {place.lat != null && place.lon != null && (
                <Typography variant="caption" sx={{ color: textSecondary, fontFamily: 'monospace' }}>
                  {place.lat.toFixed(5)}° N, {place.lon.toFixed(5)}° E
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 1, borderColor: border }} />

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {place.distanceKm != null && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <NearMeIcon sx={{ fontSize: 14, color: '#3b82f6' }} />
                <Typography variant="caption" sx={{ color: textSecondary }}>
                  <b>{place.distanceKm} km</b> from city center
                </Typography>
              </Box>
            )}

            {place.distanceFromUserKm != null && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: 14, color: '#10b981' }} />
                <Typography variant="caption" sx={{ color: textSecondary }}>
                  <b>{Math.round(place.distanceFromUserKm)} km</b> from your location
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Key Highlights */}
        {Array.isArray(place.highlights) && place.highlights.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: textSecondary, mb: 0.8, display: 'block' }}>
              KEY SIGHTSEEING HIGHLIGHTS
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
              {place.highlights.map((h, i) => (
                <Chip
                  key={i}
                  label={h}
                  size="small"
                  sx={{
                    backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5',
                    color: isDark ? '#6ee7b7' : '#065f46',
                    border: `1px solid ${isDark ? 'rgba(16,185,129,0.3)' : '#a7f3d0'}`,
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1, borderTop: `1px solid ${border}` }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: 'none',
            color: textSecondary,
            fontWeight: 500
          }}
        >
          Close
        </Button>

        <Button
          variant="contained"
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<OpenInNewIcon sx={{ fontSize: '15px !important' }} />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            backgroundColor: isDark ? '#3b82f6' : '#2563eb'
          }}
        >
          Open in Google Maps
        </Button>
      </DialogActions>
    </Dialog>
  );
}
