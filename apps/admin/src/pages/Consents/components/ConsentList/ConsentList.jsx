import { useCallback, useState, useMemo } from "react";
import useDebounceState from "@/hooks/useDebounceState";

import Table, { TableCell } from "@/components/ui/Table/Table";

import { Link } from "react-router-dom";

import { useConsents } from "./hooks.js";

import {
  Typography,
  Box,
  Button,
  Chip,
  TextField,
  InputAdornment,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import styles from "./consentList.module.css";

/**
 * Consents list components.
 * @returns
 */
const ConsentList = () => {
  /**
   * Table filters
   */
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
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

  // Hooks for search cultural connections
  const {
    data: consentData,
    isFetching: consentFetching,
    error: consentFetchingError,
    refetch: refetchConsent,
  } = useConsents(queryFilters);

  /**
   * Handle realtime filter updates
   */
  const handleFilter = useCallback((rowsPerPage, page, filter) => {
    setFilters((prev) => ({
      ...prev,
      page,
      limit: rowsPerPage,
      search: filter.search || "",
    }));
  }, []);

  /**
   * Define realtime filters
   */
  const realtimeFilter = [
    {
      name: "search",
      render: (updateFilter, filterValue) => (
        <TextField
          key="searchField"
          name="search"
          placeholder="Search Consent..."
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
    // Key/Title/Content are read-only values. They were rendered as
    // disabled <TextareaAutosize> controls — tinted boxes that look
    // editable, are not, and grew each row to the height of the longest
    // consent text. Plain clamped text instead; the full string is on the
    // cell's tooltip and on the edit screen.
    {
      name: "Key",
      minWidth: "180px",
      cell: (row) => (
        <TableCell title={row.key}>
          <Typography className={styles.keyText}>{row.key}</Typography>
        </TableCell>
      ),
    },
    {
      name: "Title",
      minWidth: "220px",
      cell: (row) => (
        <TableCell title={row.title}>
          <Typography className={styles.titleText}>{row.title}</Typography>
        </TableCell>
      ),
    },
    {
      name: "Content",
      minWidth: "320px",
      cell: (row) => (
        <TableCell title={row.content}>
          <Typography className={styles.contentText}>{row.content}</Typography>
        </TableCell>
      ),
    },
    {
      name: "Active",
      width: "110px",
      cell: (row) => (
        <TableCell title="Active">
          <Chip
            label={row.active ? "Active" : "Inactive"}
            color={row.active ? "success" : "default"}
            variant="outlined"
          />
        </TableCell>
      ),
    },
    {
      name: "Required",
      width: "120px",
      cell: (row) => (
        <TableCell title="Required">
          <Chip
            label={row.required ? "Required" : "Optional"}
            color={row.required ? "primary" : "default"}
            variant="outlined"
          />
        </TableCell>
      ),
    },
    {
      name: "Created At",
      minWidth: "190px",
      cell: (row) => (
        <TableCell title="Created At">
          <Box className={styles.lastActiveContainer}>
            <Box />

            <Typography variant="body2" className={styles.lastActiveText}>
              {row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}
            </Typography>
          </Box>
        </TableCell>
      ),
    },
    {
      name: "Edit",
      // minWidth: "300px",
      cell: (row) => (
        <TableCell title="Edit">
          <Button
            component={Link}
            to={`/consents/edit/${row.id}`}
            variant="contained"
            className={styles.editButton}
          >
            Edit
          </Button>
        </TableCell>
      ),
    },
  ];

  if (consentFetchingError) {
    return (
      <Box className={styles.errorContainer}>
        <Typography variant="h6" className={styles.errorText}>
          Error fetching consent data.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            refetchConsent();
          }}
          className={styles.retryButton}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Table
        data={consentData?.data}
        columns={columns}
        loading={consentFetching}
        defaultRowsParPage={10}
        perPageOption={[10, 20, 30, 50, 100]}
        totalRows={consentData?.count}
        realtimeFilter={realtimeFilter}
        bulkActionComponent={null}
        handleChange={handleFilter}
      />
    </>
  );
};

export default ConsentList;
