import { AppBar, Box, Toolbar } from "@mui/material";

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
        <Box sx={{ flexShrink: 0 }}>
          <UserSection />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
