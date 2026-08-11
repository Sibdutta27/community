import styles from "./Sidebar.module.css";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

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
} from "@mui/material";

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
  Event,
  Feedback as FeedbackIcon,
} from "@mui/icons-material";

const drawerWidth = 260;
const collapsedWidth = 85;

const menuItems = [
  {
    label: "Users",
    icon: <People />,
    path: "/users",
  },
  {
    label: "Enrollments",
    icon: <Assignment sx={{ color: "#facc15" }} />,
    children: [
      {
        label: "All Enrollments",
        icon: <Assignment sx={{ color: "#4ea6dc" }} />,
        path: "/enrollments/all",
      },

      {
        label: "Submitted",
        icon: <PendingActions sx={{ color: "#f59e0b" }} />,
        path: "/enrollments/submitted",
      },

      {
        label: "Confirmed",
        icon: <Assignment sx={{ color: "#22c55e" }} />,
        path: "/enrollments/approved",
      },

      {
        label: "Rejected",
        icon: <Assignment sx={{ color: "#c42032" }} />,
        path: "/enrollments/rejected",
      },
    ],
  },
  {
    label: "Cultural Connection",
    icon: <Diversity3 />,
    path: "/cultural-connections",
  },
  {
    label: "Consents",
    icon: <FactCheck />,
    path: "/consents",
  },
  // Programs and Events are flat: each surface carries its own section bar
  // (Programs | Categories), so the sidebar no longer duplicates the split.
  // Programs and Events are flat: each surface carries its own section bar
  // (Programs | Categories), so the sidebar no longer duplicates the split.
  // `alsoActiveOn` keeps the rail lit while staff are on the categories tab —
  // they have not left the section, only moved within it.
  {
    label: "Programs",
    icon: <Construction />,
    path: "/services",
    alsoActiveOn: ["/service-categories"],
  },
  {
    label: "Events",
    icon: <Event />,
    path: "/events",
    alsoActiveOn: ["/event-categories"],
  },
  {
    label: "Feedback",
    icon: <FeedbackIcon />,
    path: "/feedback",
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  const { pathname } = useLocation();

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

        "& .MuiDrawer-paper": {
          width: collapsed ? collapsedWidth : drawerWidth,
          transition: "0.3s",
          overflowX: "hidden",

          background: "var(--admin-chrome-surface)",
          color: "var(--admin-ink)",

          borderRight: "1px solid var(--admin-chrome-border)",
          boxShadow: "2px 0 24px -20px rgba(20,26,34,0.25)",
          boxSizing: "border-box",
        },
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",

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
            color: "var(--admin-muted)",
            background: "var(--admin-surface-muted)",

            "&:hover": {
              background: "#e4e9ef",
            },
          }}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>

      <Divider
        sx={{
          borderColor: "var(--admin-border)",
        }}
      />

      {/* MENU */}
      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <Box key={item.label}>
            {/* NORMAL MENU */}
            {!item.children && (
              <Tooltip title={collapsed ? item.label : ""} placement="right">
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  className={
                    item.alsoActiveOn?.some((prefix) =>
                      pathname.startsWith(prefix),
                    )
                      ? "active"
                      : undefined
                  }
                  sx={{
                    borderRadius: 3,
                    mb: 1,
                    minHeight: 50,

                    "&:hover": {
                      background: "var(--admin-hover-bg)",
                    },

                    "&.active": {
                      background: "var(--admin-active-bg)",
                      color: "var(--admin-active-fg)",
                      "& .MuiListItemIcon-root": {
                        color: "var(--admin-active-fg)",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: "var(--admin-muted)",
                      minWidth: 0,
                      mr: collapsed ? 0 : 2,
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  {!collapsed && <ListItemText primary={item.label} />}
                </ListItemButton>
              </Tooltip>
            )}

            {/* COLLAPSIBLE MENU */}
            {item.children && (
              <>
                <Tooltip title={collapsed ? item.label : ""} placement="right">
                  <ListItemButton
                    onClick={() => toggleMenu(item.label)}
                    sx={{
                      borderRadius: 3,
                      minHeight: 50,
                      mb: 1,

                      "&:hover": {
                        background: "var(--admin-hover-bg)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: "var(--admin-muted)",
                        minWidth: 0,
                        mr: collapsed ? 0 : 2,
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    {!collapsed && (
                      <>
                        <ListItemText primary={item.label} />

                        {openMenus[item.label] ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>

                {
                  <Collapse
                    in={openMenus[item.label]}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List
                      component="div"
                      disablePadding
                      sx={{
                        borderLeft: "1px solid var(--admin-border)",
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

                            "&:hover": {
                              background: "var(--admin-hover-bg)",
                            },

                            "&.active": {
                              background: "var(--admin-active-bg)",
                              color: "var(--admin-active-fg)",
                              "& .MuiListItemIcon-root": {
                                color: "var(--admin-active-fg)",
                              },
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              color: "var(--admin-muted)",
                              minWidth: 35,
                            }}
                          >
                            {child.icon}
                          </ListItemIcon>

                          {!collapsed && <ListItemText primary={child.label} />}
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                }
              </>
            )}
          </Box>
        ))}
      </List>
    </Drawer>
  );
}
