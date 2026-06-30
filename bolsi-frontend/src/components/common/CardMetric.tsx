import { Paper, Box, Typography } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface CardMetricProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down';
  color?: string;
}

export default function CardMetric({ title, value, icon, trend, trendDirection, color = '#6366f1' }: CardMetricProps) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: '#1e293b',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 20px -10px rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      <Box>
        <Typography variant="body2" color="grey.400" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="h4" color="white" sx={{ my: 1, fontWeight: 800 }}>
          {value}
        </Typography>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {trendDirection === 'up' ? (
              <TrendingUp sx={{ color: '#22c55e', fontSize: 18 }} />
            ) : (
              <TrendingDown sx={{ color: '#ef4444', fontSize: 18 }} />
            )}
            <Typography
              variant="caption"
              color={trendDirection === 'up' ? '#22c55e' : '#ef4444'}
              sx={{ fontWeight: 700 }}
            >
              {trend}
            </Typography>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: 'rgba(255, 255, 255, 0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
        }}
      >
        {icon}
      </Box>
    </Paper>
  );
}
