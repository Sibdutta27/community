import styles from './Sidebar.module.css';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Divider,
  Tooltip,
} from '@mui/material';

import {
  Dashboard,
  People,
  ChevronLeft,
  ChevronRight,
  ExpandLess,
  ExpandMore,
  Assignment,
  PendingActions,
  Diversity3,
  FactCheck,
  Construction,
  ViewList,
  Category,
  Event,
  EventNote
} from '@mui/icons-material';

const drawerWidth = 260;
const collapsedWidth = 85;

const menuItems = [
  {
    label: 'Users',
    icon: <People />,
    path: '/users',
  },
  {
    label: 'Enrollments',
    icon: <Assignment sx={{ color: '#facc15' }} />,
    children: [
      {
        label: 'All Enrollments',
        icon: <Assignment sx={{ color: '#4ea6dc' }} />,
        path: '/enrollments/all',
      },

      {
        label: 'Submitted',
        icon: <PendingActions sx={{ color: '#f59e0b' }} />,
        path: '/enrollments/submitted',
      },

      {
        label: 'Confirmed',
        icon: <Assignment sx={{ color: '#22c55e' }} />,
        path: '/enrollments/approved',
      },

      {
        label: 'Rejected',
        icon: <Assignment sx={{ color: '#c42032' }} />,
        path: '/enrollments/rejected',
      },
    ],
  },
  {
    label: 'Cultural Connection',
    icon: <Diversity3/>,
    path: '/cultural-connections',
  },
  {
    label: 'Consents',
    icon: <FactCheck/>,
    path: '/consents',
  },
  {
    label: 'Service Directory',
    icon: <Construction/>,
    children: [
      {
        label: 'Services',
        icon: <ViewList/>,
        path: '/services',
      },

      {
        label: 'Service Categories',
        icon: <Category />,
        path: '/service-categories',
      },
    ],
  },
  {
    label: 'Event Directory',
    icon: <Event/>,
    children: [
      {
        label: 'Events',
        icon: <EventNote/>,
        path: '/events',
      },

      {
        label: 'Event Categories',
        icon: <Category />,
        path: '/event-categories',
      },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,

        '& .MuiDrawer-paper': {
          width: collapsed ? collapsedWidth : drawerWidth,
          transition: '0.3s',
          overflowX: 'hidden',

          background: 'var(--admin-chrome)',
          color: '#fff',

          borderRight: '1px solid rgba(255,255,255,0.08)',
          boxSizing: 'border-box',
        },
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',

          px: 2,
          py: 2,
          height: 80,
        }}
      >
        {!collapsed && (
          <div className={styles.logoBox}>
            <div className={styles.logoMark}>A</div>
            <div>
              <h1>Admin</h1>
            </div>
          </div>
        )}

        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          sx={{
            color: '#fff',
            background: 'rgba(255,255,255,0.08)',

            '&:hover': {
              background: 'rgba(255,255,255,0.15)',
            },
          }}
        >
          {collapsed ? (
            <ChevronRight />
          ) : (
            <ChevronLeft />
          )}
        </IconButton>
      </Box>

      <Divider
        sx={{
          borderColor: 'rgba(255, 255, 255, 0.33)',
        }}
      />

      {/* MENU */}
      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <Box key={item.label}>
            {/* NORMAL MENU */}
            {!item.children && (
              <Tooltip
                title={collapsed ? item.label : ''}
                placement="right"
              >
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  sx={{
                    borderRadius: 3,
                    mb: 1,
                    minHeight: 50,

                    '&:hover': {
                      background:
                        'rgba(255,255,255,0.08)',
                    },

                    '&.active': {
                      background:
                        'linear-gradient(90deg,#0a56a8,#1d6fb8)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: '#fff',
                      minWidth: 0,
                      mr: collapsed ? 0 : 2,
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  {!collapsed && (
                    <ListItemText primary={item.label} />
                  )}
                </ListItemButton>
              </Tooltip>
            )}

            {/* COLLAPSIBLE MENU */}
            {item.children && (
              <>
                <Tooltip
                  title={collapsed ? item.label : ''}
                  placement="right"
                >
                  <ListItemButton
                    onClick={() =>
                      toggleMenu(item.label)
                    }
                    sx={{
                      borderRadius: 3,
                      minHeight: 50,
                      mb: 1,

                      '&:hover': {
                        background:
                          'rgba(255,255,255,0.08)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: '#fff',
                        minWidth: 0,
                        mr: collapsed ? 0 : 2,
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    {!collapsed && (
                      <>
                        <ListItemText
                          primary={item.label}
                        />

                        {openMenus[item.label] ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>

                {(
                  <Collapse
                    in={openMenus[item.label]}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List
                      component="div"
                      disablePadding
                      sx={{
                        borderLeft: "1px solid rgba(255, 255, 255, 0.63)"
                      }}
                    >
                      {item.children.map((child) => (
                        <ListItemButton
                          key={child.label}
                          component={NavLink}
                          to={child.path}
                          sx={{
                            pl: 3.5,
                            borderRadius: 3,
                            mb: 1,
                            minHeight: 45,

                            '&:hover': {
                              background:
                                'rgba(255,255,255,0.08)',
                            },

                            '&.active': {
                              background:
                                'rgba(78,166,220,0.2)',

                              color: '#4ea6dc',
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              color: '#fff',
                              minWidth: 35,
                            }}
                          >
                            {child.icon}
                          </ListItemIcon>

                          {
                            !collapsed && (
                              <ListItemText
                                primary={child.label}
                              />
                            )
                          }

                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}
              </>
            )}
          </Box>
        ))}
      </List>
    </Drawer>
  );
}
