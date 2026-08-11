import { useCallback, useState, useMemo } from "react";
import { Link } from "react-router-dom";

import useDebounceState from "@/hooks/useDebounceState";

import Table, { TableCell } from "@/components/ui/Table/Table";

import { useServices, useServiceCategory } from "./hooks.js";

import {
  Typography,
  Box,
  Button,
  Chip,
  MenuItem,
  TextField,
  InputAdornment,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import GroupsIcon from "@mui/icons-material/Groups";

import CategorySelect from "../CategorySelect/CategorySelect.jsx";

import {
  SERVICE_STATUSES,
  serviceStatusColor,
  serviceStatusLabel,
} from "../../serviceStatus.util.js";

import styles from "./serviceList.module.css";

/**
 * Program list.
 *
 * Columns are typographic rather than a row of disabled textareas, and the two
 * things staff actually scan for lead: whether the program is live, and how
 * many people signed up.
 */
const ServiceList = () => {
  /**
   * Table filters
   */
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
  });

  /**
   * Debounced search only
   */
  const debouncedSearch = useDebounceState(filters.search, 1000);

  /**
   * Prepared query filters
   */
  const queryFilters = useMemo(() => {
    return {
      ...filters,
      search: debouncedSearch,
    };
  }, [filters, debouncedSearch]);

  // Hooks for search services
  const {
    data: ServiceData,
    isFetching: ServiceFetching,
    error: ServiceFetchingError,
    refetch: refetchService,
  } = useServices(queryFilters);

  // Hooks for search services category
  const {
    data: ServiceCategoryData,
    isFetching: ServiceCategoryFetching,
    refetch: refetchServiceCategory,
  } = useServiceCategory({});

  /**
   * Handle realtime filter updates
   */
  const handleFilter = useCallback((rowsPerPage, page, filter) => {
    setFilters((prev) => ({
      ...prev,
      page,
      limit: rowsPerPage,
      search: filter.search || "",
      status: filter.status || "",
      categoryId: filter.categoryId,
    }));
  }, []);

  /**
   * Define realtime filters
   */
  const realtimeFilter = [
    {
      name: "categories",
      render: (updateFilter) => (
        <Box key="categories">
          <CategorySelect
            key="categories"
            placeholder="Select Category..."
            categorys={ServiceCategoryData?.data}
            onChange={(id) => updateFilter("categoryId", id)}
          />
        </Box>
      ),
    },
    {
      name: "status",
      render: (updateFilter, filterValue) => (
        <TextField
          key="statusFilter"
          name="status"
          select
          size="small"
          label="Status"
          value={filterValue || ""}
          onChange={(e) => updateFilter(e.target.name, e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All statuses</MenuItem>

          {SERVICE_STATUSES.map((status) => (
            <MenuItem key={status.value} value={status.value}>
              {status.label}
            </MenuItem>
          ))}
        </TextField>
      ),
    },
    {
      name: "search",
      render: (updateFilter, filterValue) => (
        <TextField
          key="searchField"
          name="search"
          placeholder="Search Program..."
          size="small"
          value={filterValue || ""}
          onChange={(e) => updateFilter(e.target.name, e.target.value)}
          className={styles.searchInput}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className={styles.searchIcon} />
                </InputAdornment>
              ),
            },
          }}
        />
      ),
    },
  ];

  /**
   * Columns for the data table
   */
  const columns = [
    {
      name: "Program",
      minWidth: "280px",
      grow: 2,
      cell: (row) => (
        <TableCell title={row.name}>
          <Box sx={{ minWidth: 0, py: 0.5 }}>
            <Box
              component={Link}
              to={`/services/edit/${row.id}`}
              sx={{
                display: "block",
                fontWeight: 600,
                fontSize: "0.88rem",
                color: "text.primary",
                textDecoration: "none",
                overflow: "hidden",
                textOverflow: "ellipsis",
                "&:hover": { color: "primary.main" },
              }}
            >
              {row.name}
            </Box>

            <Typography
              variant="body2"
              sx={{
                mt: 0.25,
                color: "text.secondary",
                fontSize: "0.78rem",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {row.description || "No description"}
            </Typography>
          </Box>
        </TableCell>
      ),
    },
    {
      name: "Category",
      minWidth: "150px",
      cell: (row) => (
        <TableCell title="Category">
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {row?.category?.name || "—"}
          </Typography>
        </TableCell>
      ),
    },
    {
      name: "Status",
      width: "150px",
      cell: (row) => (
        <TableCell title="Status">
          <Chip
            size="small"
            variant="outlined"
            color={serviceStatusColor(row.status)}
            label={serviceStatusLabel(row.status)}
          />
        </TableCell>
      ),
    },
    {
      name: "Registrants",
      minWidth: "150px",
      cell: (row) => (
        <TableCell title="Registrants">
          <Button
            component={Link}
            to={`/services/${row.id}/registrations`}
            size="small"
            variant="outlined"
            startIcon={<GroupsIcon />}
          >
            {row._count?.registrations ?? 0}
          </Button>
        </TableCell>
      ),
    },
    {
      name: "Contact",
      minWidth: "220px",
      cell: (row) => (
        <TableCell title="Contact">
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                color: "text.primary",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {row.location || "—"}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: "0.78rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {[row.phone, row.email].filter(Boolean).join(" · ") ||
                "No contact details"}
            </Typography>
          </Box>
        </TableCell>
      ),
    },
    {
      name: "Featured",
      width: "140px",
      cell: (row) => (
        <TableCell title="Featured">
          {row.isFeatured ? (
            <Chip
              size="small"
              variant="outlined"
              color="secondary"
              label="Featured"
            />
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              —
            </Typography>
          )}
        </TableCell>
      ),
    },
    {
      name: "Edit",
      width: "110px",
      cell: (row) => (
        <TableCell title="Edit">
          <Button
            component={Link}
            to={`/services/edit/${row.id}`}
            size="small"
            variant="contained"
          >
            Edit
          </Button>
        </TableCell>
      ),
    },
  ];

  if (ServiceFetchingError) {
    return (
      <Box className={styles.errorContainer}>
        <Typography variant="h6" className={styles.errorText}>
          Error fetching Service data.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            refetchService();
            refetchServiceCategory();
          }}
          className={styles.retryButton}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Table
      data={ServiceData?.data}
      columns={columns}
      loading={ServiceFetching || ServiceCategoryFetching}
      defaultRowsParPage={10}
      perPageOption={[10, 20, 30, 50, 100]}
      totalRows={ServiceData?.count}
      realtimeFilter={realtimeFilter}
      bulkActionComponent={null}
      handleChange={handleFilter}
    />
  );
};

export default ServiceList;
