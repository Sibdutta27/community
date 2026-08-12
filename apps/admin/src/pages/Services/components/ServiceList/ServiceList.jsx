import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import useDebounceState from "@/hooks/useDebounceState";

import Panel from "@/components/Panel/Panel";

import { useServices, useServiceCategory } from "./hooks.js";

import {
  Alert,
  Box,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  Skeleton,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import GroupsIcon from "@mui/icons-material/Groups";

import {
  SERVICE_STATUSES,
  serviceStatusColor,
  serviceStatusLabel,
} from "../../serviceStatus.util.js";

/**
 * Programs, as a vertical list rather than a seven-column table.
 *
 * A program is a small record with a long name and a description — exactly the
 * shape a wide table handles worst. Spread across Program / Category / Status /
 * Registrants / Contact / Featured / Edit, the name had 280px, the description
 * clamped to two lines, and "Featured" was a column of em dashes because almost
 * nothing is ever featured.
 *
 * Read down instead: name and status first, then the details that qualify it,
 * then the two actions. The whole record is on one line of sight, the list
 * starts immediately under the filters, and nothing scrolls sideways.
 */
const ServiceList = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    categoryId: "",
  });

  const debouncedSearch = useDebounceState(filters.search, 500);

  const queryFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const {
    data: serviceData,
    isFetching: serviceFetching,
    error: serviceError,
    refetch: refetchService,
  } = useServices(queryFilters);

  const { data: categoryData } = useServiceCategory({});

  const update = (patch) =>
    setFilters((prev) => ({ ...prev, page: 1, ...patch }));

  const rows = serviceData?.data ?? [];

  if (serviceError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => refetchService()}>
            Retry
          </Button>
        }
      >
        Could not load programs.
      </Alert>
    );
  }

  return (
    <Panel padding="none">
      {/* Filters sit inside the same surface as the list so the programs
          themselves start as close to the top as the controls allow. */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          p: 1.25,
          borderBottom: "1px solid var(--admin-border)",
        }}
      >
        <TextField
          size="small"
          placeholder="Search programs…"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          sx={{ flex: "1 1 220px" }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        <TextField
          select
          size="small"
          label="Category"
          value={filters.categoryId}
          onChange={(e) => update({ categoryId: e.target.value })}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="">All categories</MenuItem>
          {(categoryData?.data ?? []).map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Status"
          value={filters.status}
          onChange={(e) => update({ status: e.target.value })}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          {SERVICE_STATUSES.map((status) => (
            <MenuItem key={status.value} value={status.value}>
              {status.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {serviceFetching ? (
        <Box sx={{ p: 1.25 }}>
          {[0, 1, 2, 3].map((n) => (
            <Skeleton key={n} variant="rounded" height={56} sx={{ mb: 1 }} />
          ))}
        </Box>
      ) : rows.length === 0 ? (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No programs match these filters.
          </Typography>
        </Box>
      ) : (
        rows.map((row, index) => (
          <Box
            key={row.id}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              px: 1.5,
              py: 1.25,
              borderTop: index === 0 ? "none" : "1px solid var(--admin-border)",
              "&:hover": { bgcolor: "var(--admin-surface-muted)" },
            }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  component={Link}
                  to={`/services/edit/${row.id}`}
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    textDecoration: "none",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  {row.name}
                </Typography>

                <Chip
                  size="small"
                  variant="outlined"
                  color={serviceStatusColor(row.status)}
                  label={serviceStatusLabel(row.status)}
                />

                {/* Only ever shown when true — as a column it was a stack of
                    em dashes taking 140px of every row. */}
                {row.isFeatured ? (
                  <Chip
                    size="small"
                    variant="outlined"
                    color="secondary"
                    label="Featured"
                  />
                ) : null}
              </Box>

              <Typography
                variant="caption"
                sx={{ display: "block", color: "text.secondary" }}
                noWrap
              >
                {[
                  row.category?.name,
                  row.location,
                  [row.phone, row.email].filter(Boolean).join(" · "),
                ]
                  .filter(Boolean)
                  .join("  ·  ") || "No details recorded"}
              </Typography>
            </Box>

            <Button
              component={Link}
              to={`/services/${row.id}/registrations`}
              size="small"
              variant="outlined"
              startIcon={<GroupsIcon />}
              sx={{ flexShrink: 0 }}
            >
              {row._count?.registrations ?? 0}
            </Button>

            <Button
              component={Link}
              to={`/services/edit/${row.id}`}
              size="small"
              variant="text"
              sx={{ flexShrink: 0 }}
            >
              Edit
            </Button>
          </Box>
        ))
      )}

      <TablePagination
        component="div"
        count={serviceData?.count ?? 0}
        page={Math.max(0, filters.page - 1)}
        onPageChange={(_, page) =>
          setFilters((prev) => ({ ...prev, page: page + 1 }))
        }
        rowsPerPage={filters.limit}
        rowsPerPageOptions={[10, 20, 50]}
        onRowsPerPageChange={(e) => update({ limit: Number(e.target.value) })}
        sx={{ borderTop: "1px solid var(--admin-border)" }}
      />
    </Panel>
  );
};

export default ServiceList;
