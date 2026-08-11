import { useCallback, useMemo, useState } from "react";

import Table, { TableCell } from "@/components/ui/Table/Table";

import useDebounceState from "@/hooks/useDebounceState";

import {
  Box,
  Button,
  Chip,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";

/**
 * Who signed up — the half of programs and events staff could not see before.
 *
 * Shared by the program and event roster pages so the two read identically:
 * same columns, same pagination contract, same export. The caller owns the
 * data fetch (each surface has its own endpoint) and passes the rows in.
 *
 * Props:
 *   `useRegistrants` — a hook taking the query params, returning React Query
 *                      state. Passing the hook rather than the data keeps the
 *                      debounce and paging logic here instead of duplicated.
 *   `showStatus`     — programs carry a per-registration status; events don't.
 */
export default function RegistrantsTable({
  useRegistrants,
  id,
  showStatus = false,
  onExport,
  exporting = false,
}) {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  // Typing in the search box shouldn't fire a request per keystroke.
  const debouncedSearch = useDebounceState(filters.search, 500);

  const queryFilters = useMemo(
    () => ({ id, ...filters, search: debouncedSearch }),
    [id, filters, debouncedSearch],
  );

  const {
    data,
    isFetching,
    error,
    refetch,
  } = useRegistrants(queryFilters);

  const handleFilter = useCallback((rowsPerPage, page, filter) => {
    setFilters((prev) => ({
      ...prev,
      page,
      limit: rowsPerPage,
      search: filter.search || "",
    }));
  }, []);

  const realtimeFilter = [
    {
      name: "search",
      render: (updateFilter, filterValue) => (
        <TextField
          key="searchField"
          name="search"
          placeholder="Search name, email or member ID..."
          size="small"
          value={filterValue || ""}
          onChange={(e) => updateFilter(e.target.name, e.target.value)}
          sx={{ minWidth: { xs: "100%", sm: 300 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    fontSize="small"
                    sx={{ color: "var(--admin-muted)" }}
                  />
                </InputAdornment>
              ),
            },
          }}
        />
      ),
    },
  ];

  const columns = [
    {
      name: "Member",
      minWidth: "240px",
      grow: 2,
      cell: (row) => (
        <TableCell title="Member">
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {row.member?.name || "Unnamed member"}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: "0.8rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {row.member?.email || "—"}
            </Typography>
          </Box>
        </TableCell>
      ),
    },
    {
      name: "Member ID",
      minWidth: "150px",
      cell: (row) => (
        <TableCell title="Member ID">
          {row.member?.publicId ? (
            <Typography
              variant="body2"
              component="span"
              sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: "0.8rem",
                color: "var(--admin-primary)",
                bgcolor: "var(--admin-secondary-tint)",
                border: "1px solid rgba(10, 86, 168, 0.2)",
                borderRadius: "8px",
                px: 1.25,
                py: 0.5,
                whiteSpace: "nowrap",
              }}
            >
              {row.member.publicId}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Not issued
            </Typography>
          )}
        </TableCell>
      ),
    },
    ...(showStatus
      ? [
          {
            name: "Status",
            width: "150px",
            cell: (row) => (
              <TableCell title="Status">
                <Chip
                  size="small"
                  variant="outlined"
                  color={row.status === "REGISTERED" ? "primary" : "default"}
                  label={row.status || "—"}
                />
              </TableCell>
            ),
          },
        ]
      : []),
    {
      name: "Registered",
      minWidth: "190px",
      cell: (row) => (
        <TableCell title="Registered">
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {formatRegisteredAt(row.registeredAt)}
          </Typography>
        </TableCell>
      ),
    },
  ];

  if (error) {
    return (
      <Box
        sx={{
          minHeight: 260,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "16px",
          boxShadow: "var(--admin-shadow-soft)",
          p: 4,
        }}
      >
        <Typography variant="h6" sx={{ color: "text.primary" }}>
          Could not load the registrants.
        </Typography>

        <Button variant="contained" onClick={() => refetch()}>
          Retry
        </Button>
      </Box>
    );
  }

  const hasRegistrants = (data?.count ?? 0) > 0;

  return (
    <Table
      data={data?.data}
      columns={columns}
      loading={isFetching}
      selectable={false}
      defaultRowsParPage={10}
      perPageOption={[10, 20, 30, 50, 100]}
      totalRows={data?.count}
      realtimeFilter={realtimeFilter}
      handleChange={handleFilter}
      bulkActionComponent={() => (
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          disabled={exporting || !hasRegistrants}
          onClick={onExport}
        >
          {exporting ? "Preparing..." : "Export CSV"}
        </Button>
      )}
    />
  );
}

/**
 * When they signed up, in the reader's own locale. A dash beats an empty cell
 * that looks like a data bug.
 */
function formatRegisteredAt(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
