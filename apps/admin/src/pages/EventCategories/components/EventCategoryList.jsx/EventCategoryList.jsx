import { useCallback, useState, useMemo } from "react";
import useDebounceState from "@/hooks/useDebounceState";

import Table, { TableCell } from "@/components/ui/Table/Table";

import { Link } from "react-router-dom";

import { useEventCategory } from "./hooks.js";

import {
    Typography,
    Box,
    Button,
    TextField,
    InputAdornment,
    TextareaAutosize
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import styles from "./eventCategoryList.module.css";

/**
 * Event Category list components.
 * @returns
 */
const EventCategoryList = () => {

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

    // Hooks for search events category
    const {
        data: EventCategoryData,
        isFetching: EventCategoryFetching,
        error: EventCategoryFetchingError,
        refetch: refetchEventCategory,
    } = useEventCategory({});

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
                    placeholder="Search Event Category..."
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
                // <TableCell title="Key">
                <TextareaAutosize
                    value={row.key}
                    disabled
                    className={styles.keyTextarea}
                />
                // </TableCell>
            ),
        },
        {
            name: "Name",
            minWidth: "300px",
            cell: (row) => (
                // <TableCell title="Key">
                <TextareaAutosize
                    value={row.name}
                    disabled
                    className={styles.keyTextarea}
                />
                // </TableCell>
            ),
        },
        {
            name: "Icon",
            minWidth: "300px",
            cell: (row) => (
                // <TableCell title="Key">
                <TextareaAutosize
                    value={row.icon || ''}
                    disabled
                    className={styles.keyTextarea}
                />
                // </TableCell>
            ),
        },
         {
            name: "Event Count",
            minWidth: "150px",
            cell: (row) => (
                <TableCell title="Registrations">
                    <Typography
                        variant="body2"
                        className={styles.name}
                        sx={{paddingLeft: 3}}
                    >
                        {row._count.events || '0'}
                    </Typography>
                </TableCell>
            ),
        },
        // {
        //     name: "Created At",
        //     minWidth: "190px",
        //     cell: (row) => (
        //         <TableCell title="Created At">
        //             <Box className={styles.lastActiveContainer}>
        //                 <Box />

        //                 <Typography
        //                     variant="body2"
        //                     className={styles.lastActiveText}
        //                 >
        //                     {row.createdAt
        //                         ? new Date(row.createdAt).toLocaleString()
        //                         : "-"}
        //                 </Typography>
        //             </Box>
        //         </TableCell>
        //     ),
        // },
        {
            name: "Edit",
            // minWidth: "300px",
            cell: (row) => (
                <TableCell title="Edit">
                    <Button
                        component={Link}
                        to={`/event-categories/edit/${row.id}`}
                        variant="contained"
                        className={styles.editButton}
                    >
                        Edit
                    </Button>
                </TableCell>
            ),
        },
    ];

    if ( EventCategoryFetchingError) {
        return (
            <Box className={styles.errorContainer}>
                <Typography variant="h6" className={styles.errorText}>
                    Error fetching Event Categories data.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        refetchEventCategory();
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
                data={EventCategoryData?.data}
                columns={columns}
                loading={
                    EventCategoryFetching
                }
                defaultRowsParPage={10}
                perPageOption={[10, 20, 30, 50, 100]}
                totalRows={EventCategoryData?.count}
                realtimeFilter={realtimeFilter}
                bulkActionComponent={null}
                handleChange={handleFilter}
            />
        </>
    );
};

export default EventCategoryList;