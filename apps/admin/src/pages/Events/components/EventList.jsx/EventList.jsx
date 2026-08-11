import { useCallback, useState, useMemo } from "react";
import { Link } from "react-router-dom";

import useDebounceState from "@/hooks/useDebounceState";

import Table, { TableCell } from "@/components/ui/Table/Table";

import { useEvents, useEventCategory } from "./hooks.js";

import {
    Typography,
    Box,
    Button,
    Chip,
    TextField,
    InputAdornment,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import GroupsIcon from "@mui/icons-material/Groups";

import CategorySelect from "../CategorySelect/CategorySelect.jsx";
import { formatWords } from "@/utils/formatWord.util.js";

import styles from "./eventList.module.css";

/**
 * Event list — the alternate view to the calendar, kept for the jobs a
 * calendar is bad at: scanning, searching and comparing many events at once.
 *
 * Columns are typographic rather than a row of disabled textareas, so the
 * table reads as the same product as the rest of the panel.
 */
const EventList = () => {

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

    // Hooks for search events
    const {
        data: EventData,
        isFetching: EventFetching,
        error: EventFetchingError,
        refetch: refetchEvent,
    } = useEvents(queryFilters);

    // Hooks for search events category
    const {
        data: EventCategoryData,
        isFetching: EventCategoryFetching,
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
                categoryId: filter.categoryId,
            }));
        },
        []
    );

    /**
     * Define realtime filters
     */
    const realtimeFilter = [
        {
            name: "categories",
            render: (updateFilter) => (
                <Box key='categories'>
                    <CategorySelect
                        key="categories"
                        placeholder="Select Category..."
                        categorys={EventCategoryData?.data}
                        onChange={(id) => updateFilter('categoryId', id)}
                    />
                </Box>
            ),
        },
        {
            name: "search",
            render: (updateFilter, filterValue) => (
                <TextField
                    key="searchField"
                    name="search"
                    placeholder="Search Event..."
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
            name: "Event",
            minWidth: "280px",
            grow: 2,
            cell: (row) => (
                <TableCell title={row.title}>
                    <Box sx={{ minWidth: 0, py: 0.5 }}>
                        <Box
                            component={Link}
                            to={`/events/edit/${row.id}`}
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
                            {row.title}
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
                    <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                    >
                        {row?.category?.name || "—"}
                    </Typography>
                </TableCell>
            ),
        },
        {
            name: "When",
            minWidth: "200px",
            cell: (row) => (
                <TableCell title="When">
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "text.primary" }}
                        >
                            {row.startDateTime
                                ? new Date(row.startDateTime).toLocaleString()
                                : "—"}
                        </Typography>

                        {row.endDateTime && (
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "text.secondary",
                                    fontSize: "0.78rem",
                                }}
                            >
                                until {new Date(row.endDateTime).toLocaleString()}
                            </Typography>
                        )}
                    </Box>
                </TableCell>
            ),
        },
        {
            name: "Where",
            minWidth: "200px",
            cell: (row) => (
                <TableCell title="Where">
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.primary",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {row.locationType === 'VIRTUAL'
                                ? (row.meetingUrl || 'Online')
                                : (row.location || '—')}
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                                fontSize: "0.78rem",
                            }}
                        >
                            {formatWords(row.locationType)}
                        </Typography>
                    </Box>
                </TableCell>
            ),
        },
        {
            name: "Registrants",
            minWidth: "165px",
            cell: (row) => {
                const registrations = row._count?.registrations ?? 0;

                return (
                    <TableCell title="Registrants">
                        <Button
                            component={Link}
                            to={`/events/${row.id}/registrations`}
                            size="small"
                            variant="outlined"
                            startIcon={<GroupsIcon />}
                        >
                            {row.maxCapacity
                                ? `${registrations} / ${row.maxCapacity}`
                                : registrations}
                        </Button>
                    </TableCell>
                );
            },
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
                        <Typography
                            variant="body2"
                            sx={{ color: "text.secondary" }}
                        >
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
                        to={`/events/edit/${row.id}`}
                        size="small"
                        variant="contained"
                    >
                        Edit
                    </Button>
                </TableCell>
            ),
        },
    ];

    if (EventFetchingError) {
        return (
            <Box className={styles.errorContainer}>
                <Typography variant="h6" className={styles.errorText}>
                    Error fetching Event data.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        refetchEvent();
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
        <Table
            data={EventData?.data}
            columns={columns}
            loading={
                EventFetching ||
                EventCategoryFetching
            }
            defaultRowsParPage={10}
            perPageOption={[10, 20, 30, 50, 100]}
            totalRows={EventData?.count}
            realtimeFilter={realtimeFilter}
            bulkActionComponent={null}
            handleChange={handleFilter}
        />
    );
};

export default EventList;
