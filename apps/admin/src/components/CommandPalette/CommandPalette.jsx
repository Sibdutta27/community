import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
  Box,
  Chip,
  Dialog,
  InputBase,
  List,
  ListItemButton,
  ListSubheader,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import useDebounceState from "@/hooks/useDebounceState";

import { getUsers } from "@/api/user.api";

/**
 * Global search as a command palette rather than a permanent search box.
 *
 * A box sitting in the top bar costs its width on every screen and, before
 * this, did nothing at all. A palette costs one small trigger, opens on ⌘K /
 * Ctrl-K from anywhere, and disappears again — which is what "elegant and out
 * of the way" has to mean in a bar we deliberately cut to 44px.
 *
 * It answers the two questions staff actually arrive with: "take me to X" and
 * "find this person". Members are searched server-side by the same endpoint
 * the user list uses; destinations are matched locally.
 */

const DESTINATIONS = [
  { label: "Overview", to: "/", keywords: "dashboard home" },
  { label: "Users", to: "/users", keywords: "members people accounts" },
  { label: "Consent catalog", to: "/consents", keywords: "consents legal" },
  {
    label: "Enrollments",
    to: "/enrollments/all",
    keywords: "applications review queue",
  },
  {
    label: "Cultural Connection",
    to: "/cultural-connections",
    keywords: "culture",
  },
  { label: "Programs", to: "/services", keywords: "services" },
  {
    label: "Program categories",
    to: "/service-categories",
    keywords: "services categories",
  },
  { label: "Events", to: "/events", keywords: "calendar gatherings" },
  {
    label: "Event categories",
    to: "/event-categories",
    keywords: "events categories",
  },
  { label: "Feedback", to: "/feedback", keywords: "reports issues" },
];

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const inputRef = useRef(null);

  const debounced = useDebounceState(query, 250);

  const term = debounced.trim();

  const { data: userData } = useQuery({
    queryKey: ["command-palette-users", term],
    queryFn: () => getUsers({ page: 1, limit: 5, search: term }),
    // Below two characters every member matches, which is not a search.
    enabled: open && term.length >= 2,
  });

  const destinations = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) return DESTINATIONS;

    return DESTINATIONS.filter(
      (item) =>
        item.label.toLowerCase().includes(needle) ||
        item.keywords.includes(needle),
    );
  }, [query]);

  // Memoised so the fallback `[]` is not a fresh array on every render, which
  // would make the results memo below recompute constantly.
  const members = useMemo(() => userData?.data ?? [], [userData]);

  // One flat list underneath the grouped rendering, so ↑/↓ and Enter can move
  // across group boundaries the way a palette is expected to.
  const results = useMemo(
    () => [
      ...destinations.map((item) => ({
        kind: "destination",
        key: `d:${item.to}`,
        label: item.label,
        to: item.to,
      })),
      ...members.map((user) => ({
        kind: "member",
        key: `u:${user.id}`,
        label: user.name || user.email,
        detail: user.publicId || user.email,
        to: `/users/edit/${user.id}`,
      })),
    ],
    [destinations, members],
  );

  useEffect(() => {
    setCursor(0);
  }, [query, members.length]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setCursor(0);
    }
  }, [open]);

  const go = (item) => {
    if (!item) return;
    navigate(item.to);
    onClose();
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((prev) => (results.length ? (prev + 1) % results.length : 0));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((prev) =>
        results.length ? (prev - 1 + results.length) % results.length : 0,
      );
    }

    if (event.key === "Enter") {
      event.preventDefault();
      go(results[cursor]);
    }
  };

  const destinationCount = destinations.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      // Sits high in the viewport the way a palette should, but anchored with
      // a positive offset — a negative margin pushed it off the top edge and
      // clipped its own input.
      slotProps={{
        paper: {
          sx: {
            borderRadius: "10px",
            alignSelf: "flex-start",
            mt: 10,
          },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 1,
          borderBottom: "1px solid var(--admin-border)",
        }}
      >
        <SearchIcon fontSize="small" sx={{ color: "var(--admin-muted)" }} />

        <InputBase
          autoFocus
          inputRef={inputRef}
          fullWidth
          placeholder="Jump to a page, or find a member…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ fontSize: "0.9rem" }}
        />

        <Chip size="small" variant="outlined" label="esc" />
      </Box>

      <List dense sx={{ maxHeight: 360, overflowY: "auto", py: 0 }}>
        {results.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {term.length >= 2
                ? "Nothing matched."
                : "Type at least two characters to search members."}
            </Typography>
          </Box>
        ) : (
          results.map((item, index) => (
            <Box key={item.key}>
              {index === 0 && destinationCount > 0 ? (
                <ListSubheader sx={{ lineHeight: "28px", fontSize: "0.68rem" }}>
                  GO TO
                </ListSubheader>
              ) : null}

              {index === destinationCount ? (
                <ListSubheader sx={{ lineHeight: "28px", fontSize: "0.68rem" }}>
                  MEMBERS
                </ListSubheader>
              ) : null}

              <ListItemButton
                selected={index === cursor}
                onMouseEnter={() => setCursor(index)}
                onClick={() => go(item)}
                sx={{ py: 0.75 }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {item.label}
                  </Typography>

                  {item.detail ? (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {item.detail}
                    </Typography>
                  ) : null}
                </Box>
              </ListItemButton>
            </Box>
          ))
        )}
      </List>
    </Dialog>
  );
}
