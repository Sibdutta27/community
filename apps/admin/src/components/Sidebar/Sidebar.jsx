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
  SpaceDashboard,
  People,
  Language,
  ChevronLeft,
  ChevronRight,
  ExpandLess,
  ExpandMore,
  Assignment,
  Diversity3,
  Construction,
  Event,
  Feedback as FeedbackIcon,
} from "@mui/icons-material";

const drawerWidth = 216;
const collapsedWidth = 60;

/**
 * Icons here are wayfinding, not decoration — they all inherit the rail's ink
 * colour so the only coloured thing in the sidebar is the active item. The
 * enrollment children used to be four differently-tinted clipboards (yellow,
 * celeste, green, red), which read as status badges but were purely ornamental.
 */
const menuItems = [
  {
    label: "Overview",
    icon: <SpaceDashboard />,
    path: "/",
    end: true,
  },
  // The consent catalog is a page of this section (see Users/sections.js), so
  // the rail stays lit while staff are editing it.
  {
    label: "Users",
    icon: <People />,
    path: "/users",
    alsoActiveOn: ["/consents"],
  },
  // One entry, not five. The list itself carries All/Draft/Submitted/Approved/
  // Rejected tabs with live counts, so the four children were a second
  // navigation for the same filter — and the rail's version had no counts.
  // `alsoActiveOn` keeps the rail lit on the legacy status URLs and on an
  // open application.
  {
    label: "Enrollments",
    icon: <Assignment />,
    path: "/enrollments/all",
    alsoActiveOn: ["/enrollments"],
  },
  {
    label: "Cultural Connection",
    icon: <Diversity3 />,
    path: "/cultural-connections",
  },
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
  // The public website's copy. Sits with the other things staff maintain
  // rather than under a settings menu — editing the homepage is routine work,
  // not configuration.
  {
    label: "Website Studio",
    icon: <Language />,
    path: "/website",
  },
  {
    label: "Feedback",
    icon: <FeedbackIcon />,
    path: "/feedback",
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const { pathname } = useLocation();

  /**
   * A group starts open when you are already somewhere inside it. Previously
   * the Enrollments group defaulted shut on every load, so landing on
   * /enrollments/submitted showed a collapsed rail that gave no clue where you
   * were — you had to open the group to find your own current page.
   * `undefined` means "not touched yet", so an explicit toggle still wins.
   */
  const [openMenus, setOpenMenus] = useState({});

  const isGroupOpen = (item) => {
    if (openMenus[item.label] !== undefined) {
      return openMenus[item.label];
    }

    return item.children.some((child) => pathname.startsWith(child.path));
  };

  const toggleMenu = (item) => {
    setOpenMenus((prev) => ({
      ...prev,
      [item.label]: !isGroupOpen(item),
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
      {/* HEADER — same 44px as the top bar, so the two rules line up */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",

          px: 1,
          height: 44,
          flexShrink: 0,
        }}
      >
        {/* Same seal and same wordmark as the member app's navbar — staff and
            members should see one product, not two. "Admin" is the surface
            label underneath, mirroring the member mark's title/subtitle
            lockup rather than inventing a second name. */}
        {!collapsed && (
          <div className={styles.logoBox}>
            <img
              alt=""
              className={styles.logoMark}
              src="/logo.png"
              width={26}
              height={26}
            />
            <div className={styles.logoText}>
              <h1>Taíno Nation of Borikén</h1>
              <span>Admin</span>
            </div>
          </div>
        )}

        <IconButton
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed(!collapsed)}
          sx={{
            color: "var(--admin-muted)",

            "&:hover": {
              background: "var(--admin-surface-muted)",
            },
          }}
        >
          {collapsed ? (
            <ChevronRight fontSize="small" />
          ) : (
            <ChevronLeft fontSize="small" />
          )}
        </IconButton>
      </Box>

      <Divider
        sx={{
          borderColor: "var(--admin-border)",
        }}
      />

      {/* MENU */}
      <List sx={{ px: 0.75, py: 1 }}>
        {menuItems.map((item) => (
          <Box key={item.label}>
            {/* NORMAL MENU */}
            {!item.children && (
              <Tooltip title={collapsed ? item.label : ""} placement="right">
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  // Without `end`, `to="/"` matches every route and the
                  // Overview item would stay lit across the whole app.
                  end={item.end}
                  className={
                    item.alsoActiveOn?.some((prefix) =>
                      pathname.startsWith(prefix),
                    )
                      ? "active"
                      : undefined
                  }
                  sx={{
                    mb: 0.25,
                    minHeight: 32,
                    py: 0.5,
                    px: 1,

                    "&:hover": {
                      background: "var(--admin-hover-bg)",
                    },

                    "&.active": {
                      background: "var(--admin-active-bg)",
                      color: "var(--admin-active-fg)",
                      "& .MuiListItemIcon-root": {
                        color: "var(--admin-active-fg)",
                      },
                      "& .MuiListItemText-primary": { fontWeight: 600 },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: "var(--admin-muted)",
                      minWidth: 0,
                      mr: collapsed ? 0 : 1.25,
                      justifyContent: "center",
                      "& svg": { fontSize: "1.15rem" },
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
                    onClick={() => toggleMenu(item)}
                    sx={{
                      minHeight: 32,
                      py: 0.5,
                      px: 1,
                      mb: 0.25,

                      "&:hover": {
                        background: "var(--admin-hover-bg)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: "var(--admin-muted)",
                        minWidth: 0,
                        mr: collapsed ? 0 : 1.25,
                        justifyContent: "center",
                        "& svg": { fontSize: "1.15rem" },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    {!collapsed && (
                      <>
                        <ListItemText primary={item.label} />

                        {isGroupOpen(item) ? (
                          <ExpandLess sx={{ fontSize: "1.05rem" }} />
                        ) : (
                          <ExpandMore sx={{ fontSize: "1.05rem" }} />
                        )}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>

                {
                  <Collapse in={isGroupOpen(item)} timeout="auto" unmountOnExit>
                    <List
                      component="div"
                      disablePadding
                      sx={{
                        ml: 2,
                        borderLeft: "1px solid var(--admin-border)",
                      }}
                    >
                      {item.children.map((child) => (
                        <ListItemButton
                          key={child.label}
                          component={NavLink}
                          to={child.path}
                          sx={{
                            pl: 1.25,
                            minHeight: 28,
                            py: 0.25,
                            mb: 0.25,

                            "&:hover": {
                              background: "var(--admin-hover-bg)",
                            },

                            "&.active": {
                              background: "var(--admin-active-bg)",
                              color: "var(--admin-active-fg)",
                              "& .MuiListItemIcon-root": {
                                color: "var(--admin-active-fg)",
                              },
                              "& .MuiListItemText-primary": { fontWeight: 600 },
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              color: "var(--admin-muted)",
                              minWidth: 0,
                              mr: 1,
                              "& svg": { fontSize: "1rem" },
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
