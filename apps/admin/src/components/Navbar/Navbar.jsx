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
        background: 'var(--admin-chrome)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
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
              color: '#ffffff',
              fontWeight: 500,
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
              color: '#4ea6dc',

              background:
                'rgba(255,255,255,0.04)',

              '&:hover': {
                background:
                  'rgba(255,255,255,0.08)',
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