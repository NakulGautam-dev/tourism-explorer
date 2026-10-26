import React from 'react';
import { Box, Typography, Chip, Tooltip } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import GrainIcon from '@mui/icons-material/Grain';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AirIcon from '@mui/icons-material/Air';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function WeatherWidget({ weather, isDark, isSidebar }) {
  if (!weather) return null;

  const getWeatherIcon = (condition = '') => {
    const c = condition.toLowerCase();
    if (c.includes('sun') || c.includes('clear')) return <WbSunnyIcon sx={{ color: '#f59e0b', fontSize: 24 }} />;
    if (c.includes('cloud')) return <CloudIcon sx={{ color: '#64748b', fontSize: 24 }} />;
    if (c.includes('rain') || c.includes('shower')) return <GrainIcon sx={{ color: '#38bdf8', fontSize: 24 }} />;
    if (c.includes('snow')) return <AcUnitIcon sx={{ color: '#93c5fd', fontSize: 24 }} />;
    if (c.includes('thunder')) return <ThunderstormIcon sx={{ color: '#a855f7', fontSize: 24 }} />;
    return <WbSunnyIcon sx={{ color: '#f59e0b', fontSize: 24 }} />;
  };

  const bg = isDark ? '#1e293b' : '#f0fdf4';
  const border = isDark ? '#334155' : '#bbf7d0';
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#475569';

  return (
    <Box
      sx={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: '12px',
        p: isSidebar ? 1.5 : 2,
        mb: 2,
        display: 'flex',
        flexDirection: isSidebar ? 'column' : 'row',
        alignItems: isSidebar ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(16,185,129,0.06)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: '10px',
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            border: `1px solid ${border}`,
            flexShrink: 0
          }}
        >
          {getWeatherIcon(weather.condition)}
        </Box>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: textPrimary, lineHeight: 1 }}>
              {Math.round(weather.temperature)}°C
            </Typography>
            <Typography variant="body2" sx={{ color: textSecondary, fontWeight: 500 }}>
              {weather.condition}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: textSecondary, display: 'block', mt: 0.3 }}>
            High: {Math.round(weather.highTemp)}°C • Low: {Math.round(weather.lowTemp)}°C • Rain: {weather.precipitationProb}%
          </Typography>
        </Box>
      </Box>

      {weather.sightseeingTip && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.8,
            backgroundColor: isDark ? 'rgba(56,189,248,0.1)' : 'rgba(16,185,129,0.12)',
            borderRadius: '8px',
            px: 1.5,
            py: 0.7,
            maxWidth: isSidebar ? '100%' : '380px'
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 16, color: isDark ? '#38bdf8' : '#059669', flexShrink: 0 }} />
          <Typography
            variant="caption"
            sx={{
              color: isDark ? '#bae6fd' : '#065f46',
              fontWeight: 500,
              fontSize: '0.75rem',
              lineHeight: 1.3
            }}
          >
            {weather.sightseeingTip}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
