import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MuseumIcon from '@mui/icons-material/AccountBalance';
import MonumentIcon from '@mui/icons-material/AccountBalanceOutlined';
import CastleIcon from '@mui/icons-material/Fort';
import TempleIcon from '@mui/icons-material/TempleHindu';
import ParkIcon from '@mui/icons-material/Park';
import ViewIcon from '@mui/icons-material/Visibility';
import HistoricIcon from '@mui/icons-material/HistoryEdu';
import AttractionsIcon from '@mui/icons-material/Explore';

const CATEGORIES = [
  { key: 'all', label: 'All Sights', icon: <AttractionsIcon sx={{ fontSize: 16 }} /> },
  { key: 'museums', label: 'Museums', icon: <MuseumIcon sx={{ fontSize: 16 }} /> },
  { key: 'monuments', label: 'Monuments', icon: <MonumentIcon sx={{ fontSize: 16 }} /> },
  { key: 'temples', label: 'Temples & Holy', icon: <TempleIcon sx={{ fontSize: 16 }} /> },
  { key: 'forts', label: 'Forts & Castles', icon: <CastleIcon sx={{ fontSize: 16 }} /> },
  { key: 'parks', label: 'Parks & Nature', icon: <ParkIcon sx={{ fontSize: 16 }} /> },
  { key: 'viewpoints', label: 'Viewpoints', icon: <ViewIcon sx={{ fontSize: 16 }} /> },
  { key: 'historic', label: 'Historic Sites', icon: <HistoricIcon sx={{ fontSize: 16 }} /> }
];

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  counts = {},
  detectedFromQuery,
  query,
  isDark
}) {
  const isIntentMatched = detectedFromQuery && detectedFromQuery !== 'all';

  return (
    <Box sx={{ mb: 2 }}>
      {isIntentMatched && (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.8,
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
            border: `1px solid ${isDark ? '#1e3a8a' : '#bfdbfe'}`,
            borderRadius: '20px',
            px: 1.5,
            py: 0.4,
            mb: 1.2
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 14, color: isDark ? '#60a5fa' : '#2563eb' }} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: isDark ? '#93c5fd' : '#1d4ed8',
              fontSize: '0.75rem'
            }}
          >
            Resolved category from query: &ldquo;{detectedFromQuery}&rdquo;
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 0.5,
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: isDark ? '#334155' : '#cbd5e1',
            borderRadius: 4
          }
        }}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          const count = counts[cat.key] || 0;

          // Only display pills that have places or are 'all' or are currently selected
          if (cat.key !== 'all' && count === 0 && !isSelected) {
            return null;
          }

          return (
            <Chip
              key={cat.key}
              icon={cat.icon}
              label={
                <span>
                  {cat.label} {count > 0 && <span style={{ opacity: 0.8, fontSize: '0.75rem' }}>({count})</span>}
                </span>
              }
              clickable
              onClick={() => onSelectCategory(cat.key)}
              sx={{
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.8rem',
                backgroundColor: isSelected
                  ? isDark
                    ? '#2563eb'
                    : '#1d4ed8'
                  : isDark
                  ? '#1e293b'
                  : '#f1f5f9',
                color: isSelected
                  ? '#ffffff'
                  : isDark
                  ? '#cbd5e1'
                  : '#475569',
                border: isSelected
                  ? `1px solid ${isDark ? '#3b82f6' : '#1d4ed8'}`
                  : `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                '&:hover': {
                  backgroundColor: isSelected
                    ? isDark
                      ? '#1d4ed8'
                      : '#1e40af'
                    : isDark
                    ? '#334155'
                    : '#e2e8f0'
                },
                '& .MuiChip-icon': {
                  color: isSelected ? '#ffffff' : 'inherit'
                }
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
