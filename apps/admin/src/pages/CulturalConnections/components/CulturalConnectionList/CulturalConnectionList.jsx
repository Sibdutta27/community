import { useCallback, useState, useMemo } from "react";
import useDebounceState from "@/hooks/useDebounceState";

import Table, { TableCell } from "@/components/ui/Table/Table";

import { Link } from "react-router-dom";

import { useCulturalConnections } from "./hooks.js";

import {
    Avatar,
    Typography,
    Box,
    Button,
    TextField,
    InputAdornment,
    TextareaAutosize
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import styles from "./culturalConnectionList.module.css";

/**
 * Cultural Connection components.
 * @returns
 */
const CulturalConnectionList = () => {

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
        data: culturalConnectionData,
        isFetching: culturalConnectionFetching,
        error: culturalConnectionFetchingError,
        refetch: refetchCulturalConnection,
    } = useCulturalConnections(queryFilters);

    /**
     * Handle realtime filter updates
     */
    const handleFilter = useCallback(
        (rowsPerPage, page, filter) => {
            setFilters((prev) => ({
                ...prev,
                page,
                limit: rowsPerPage,
                search: filter.search || "",
            }));
        },
        []
    );

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
                    placeholder="Search Cultural Connection..."
                    size="small"
                    value={filterValue || ""}
                    onChange={(e) =>
                        updateFilter(
                            e.target.name,
                            e.target.value
                        )
                    }
                    className={styles.searchInput}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon
                                        className={styles.searchIcon}
                                    />
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
            name: "Key",
            minWidth: "300px",
            cell: (row) => (
                <TableCell title="Key">
                    {/* <Link
                        to={`/users/edit/${row.id}`}
                        className={styles.userLink}
                    > */}
                    <TextareaAutosize
                        value={row.key}
                        disabled
                        className={styles.keyTextarea}
                    />
                </TableCell>
            ),
        },
        {
            name: "Description",
            minWidth: "300px",
            cell: (row) => (
                <TableCell title="Description">
                    <TextareaAutosize
                        value={row.description}
                        disabled
                        minRows={2}
                        className={styles.keyTextarea}
                    />
                </TableCell>
            ),
        },
        {
            name: "Active",
            minWidth: "100px",
            cell: (row) => (
                <TableCell title="Active">
                    <Typography
                        variant="body2"
                        className={
                            row.active
                                ? styles.active
                                : styles.notActive
                        }
                    >
                        {row.active ? 'Active' : 'Not Active'}
                    </Typography>
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

                        <Typography
                            variant="body2"
                            className={styles.lastActiveText}
                        >
                            {row.createdAt
                                ? new Date(row.createdAt).toLocaleString()
                                : "-"}
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
                        to={`/cultural-connections/edit/${row.id}`}
                        variant="contained"
                        className={styles.editButton}
                    >
                        Edit
                    </Button>
                </TableCell>
            ),
        },
    ];

    if (culturalConnectionFetchingError) {
        return (
            <Box className={styles.errorContainer}>
                <Typography variant="h6" className={styles.errorText}>
                    Error fetching cultural connection data.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        refetchCulturalConnection();
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
                data={culturalConnectionData?.data}
                columns={columns}
                loading={
                    culturalConnectionFetching
                }
                defaultRowsParPage={10}
                perPageOption={[10, 20, 30, 50, 100]}
                totalRows={culturalConnectionData?.count}
                realtimeFilter={realtimeFilter}
                bulkActionComponent={null}
                handleChange={handleFilter}
            />
        </>
    );
};

export default CulturalConnectionList;