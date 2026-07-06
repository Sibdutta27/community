import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  InputBase,
  IconButton,
  Badge,
} from '@mui/material';

import {
  NotificationsNone,
} from '@mui/icons-material';

import UserSection from './UserSection';
import SearchSection from './SearchSection';

export default function Navbar() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--admin-border)',
        color: 'var(--admin-ink)',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: {
            xs: 'flex-end',
            md: 'space-between',
          },
          gap: 2,
          minHeight: '80px !important',
        }}
      >
        {/* LEFT */}
        <Box
          sx={{
            display: {
              xs: 'none',
              md: 'block',
            },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: 'var(--admin-primary)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              fontFamily: 'inherit'
            }}
          >
            Community
          </Typography>
        </Box>

        {/* RIGHT */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}
        >
          {/* SEARCH */}
          <SearchSection />

          {/* NOTIFICATION */}
          <IconButton
            sx={{
              color: 'var(--admin-muted)',

              background:
                'var(--admin-surface-muted)',

              '&:hover': {
                background: '#e4e9ef',
              },
            }}
          >
            <Badge
              badgeContent={3}
              color="error"
            >
              <NotificationsNone />
            </Badge>
          </IconButton>

          {/* USER */}
          <UserSection />
        </Box>
      </Toolbar>
    </AppBar>
  );
}