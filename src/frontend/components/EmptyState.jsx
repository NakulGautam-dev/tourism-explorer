import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function EmptyState({
  city,
  category,
  onResetCategory,
  onRetry,
  isDark
}) {
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 5,
        px: 2,
        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
        borderRadius: '16px',
        border: `1px dashed ${isDark ? '#334155' : '#cbd5e1'}`
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff',
          color: isDark ? '#60a5fa' : '#2563eb',
          mb: 2
        }}
      >
        <SearchOffIcon sx={{ fontSize: 30 }} />
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 700, color: textPrimary, mb: 0.5 }}>
        No attractions found
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: textSecondary, maxWidth: 360, mx: 'auto', mb: 2.5, fontSize: '0.88rem' }}
      >
        We couldn&rsquo;t find {category && category !== 'all' ? `&ldquo;${category}&rdquo;` : 'matching attractions'} in{' '}
        <b>{city || 'this location'}</b>. Try viewing all sights or exploring nearby landmarks.
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
        {category && category !== 'all' && (
          <Button
            variant="contained"
            size="small"
            onClick={onResetCategory}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: isDark ? '#3b82f6' : '#2563eb'
            }}
          >
            Show All Sights in {city || 'City'}
          </Button>
        )}

        {onRetry && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
            sx={{
              textTransform: 'none',
              borderColor: isDark ? '#475569' : '#cbd5e1',
              color: textPrimary
            }}
          >
            Retry Search
          </Button>
        )}
      </Box>
    </Box>
  );
}
