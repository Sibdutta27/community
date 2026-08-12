import { useEffect, useState } from "react";

import { AppBar, Box, Toolbar, Tooltip } from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import CommandPalette from "@components/CommandPalette/CommandPalette";

import UserSection from "./UserSection";

/**
 * The top bar.
 *
 * It used to be 80px tall and carry three things that were not doing any work:
 * the product name ("Community") next to a sidebar that already says who we
 * are, a notification bell hard-coded to "3" that led nowhere, and a global
 * search box that was never wired to anything. All three are gone — every list
 * screen has its own search that does work — so the bar now carries only the
 * signed-in account, at 44px. That is ~36px handed back to every page.
 */
export default function Navbar() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  /**
   * ⌘K / Ctrl-K from anywhere. Registered once here rather than per page so
   * the shortcut works on every screen, including ones with their own inputs.
   */
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--admin-border)",
        color: "var(--admin-ink)",
        boxShadow: "none",
      }}
    >
      <Toolbar
        variant="dense"
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
          minHeight: "44px !important",
          px: { xs: 1.5, sm: 2 },
        }}
      >
        {/* The trigger is a hint, not a field: ~110px that says the shortcut
            exists. The permanent search box this replaces was both wider and
            wired to nothing. */}
        <Tooltip title="Search (⌘K)">
          <Box
            component="button"
            type="button"
            onClick={() => setPaletteOpen(true)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              px: 1,
              py: 0.375,
              mr: "auto",
              border: "1px solid var(--admin-border)",
              borderRadius: "6px",
              background: "transparent",
              color: "var(--admin-muted)",
              cursor: "pointer",
              font: "inherit",
              fontSize: "0.78rem",
              "&:hover": { borderColor: "var(--admin-primary)" },
            }}
          >
            <SearchIcon sx={{ fontSize: 15 }} />
            Search
            <Box component="span" sx={{ opacity: 0.7, ml: 0.5 }}>
              ⌘K
            </Box>
          </Box>
        </Tooltip>

        <Box sx={{ flexShrink: 0 }}>
          <UserSection />
        </Box>
      </Toolbar>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
    </AppBar>
  );
}
