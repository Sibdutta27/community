import { useCallback, useState, useMemo } from "react";
import useDebounceState from "@/hooks/useDebounceState";

import Table, { TableCell } from "@/components/ui/Table/Table";

import { Link } from "react-router-dom";

import { useEvents, useEventCategory } from "./hooks.js";

import {
    Typography,
    Box,
    Button,
    TextField,
    InputAdornment,
    TextareaAutosize
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import CategorySelect from "../CategorySelect/CategorySelect.jsx";
import { formatWords } from "@/utils/formatWord.util.js";

import styles from "./eventList.module.css";

/**
 * Event list components.
 * @returns
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
            render: (updateFilter, filterValue) => (
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
            name: "Title",
            minWidth: "300px",
            cell: (row) => (
                // <TableCell title="Key">
                <TextareaAutosize
                    value={row.title}
                    disabled
                    className={styles.keyTextarea}
                />
                // </TableCell>
            ),
        },
        {
            name: "Category",
            minWidth: "300px",
            cell: (row) => (
                // <TableCell title="Key">
                <TextareaAutosize
                    value={row?.category?.name}
                    disabled
                    className={styles.keyTextarea}
                />
                // </TableCell>
            ),
        },
        {
            name: "Description",
            minWidth: "300px",
            cell: (row) => (
                // <TableCell title="Title">
                <TextareaAutosize
                    value={row.description || '-'}
                    disabled
                    minRows={1}
                    className={styles.keyTextarea}
                />
                // </TableCell>
            ),
        },
        {
            name: "Start Time",
            minWidth: "190px",
            cell: (row) => (
                <TableCell title="Start Time">
                    <Box className={styles.lastActiveContainer}>
                        <Box />

                        <Typography
                            variant="body2"
                            className={styles.lastActiveText}
                        >
                            {row.startDateTime
                                ? new Date(row.startDateTime).toLocaleString()
                                : "-"}
                        </Typography>
                    </Box>
                </TableCell>
            ),
        },
        {
            name: "End Time",
            minWidth: "190px",
            cell: (row) => (
                <TableCell title="End Time">
                    <Box className={styles.lastActiveContainer}>
                        <Box />

                        <Typography
                            variant="body2"
                            className={styles.lastActiveText}
                        >
                            {row.endDateTime
                                ? new Date(row.endDateTime).toLocaleString()
                                : "-"}
                        </Typography>
                    </Box>
                </TableCell>
            ),
        },
        {
            name: "Location",
            minWidth: "300px",
            cell: (row) => (
                // <TableCell title="Title">
                <TextareaAutosize
                    value={row.location || '-'}
                    disabled
                    minRows={1}
                    className={styles.keyTextarea}
                />
                // </TableCell>
            ),
        },
        {
            name: "Location Type",
            minWidth: "150px",
            cell: (row) => (
                <TableCell title="Location Type">
                    <Typography
                        variant="body2"
                        className={styles.name}
                        sx={{paddingLeft: 3}}
                    >
                        {formatWords(row.locationType) || '-'}
                    </Typography>
                </TableCell>
            ),
        },
        {
            name: "Meeting Url",
            minWidth: "300px",
            cell: (row) => (
                <TextareaAutosize
                    value={row.meetingUrl || '-'}
                    disabled
                    minRows={1}
                    className={styles.keyTextarea}
                />
            ),
        },
        {
            name: "External Url",
            minWidth: "300px",
            cell: (row) => (
                <TextareaAutosize
                    value={row.externalUrl || '-'}
                    disabled
                    minRows={1}
                    className={styles.keyTextarea}
                />
            ),
        },
        {
            name: "Max Capacity",
            minWidth: "150px",
            cell: (row) => (
                <TableCell title="Max Capacity">
                    <Typography
                        variant="body2"
                        className={styles.name}
                        sx={{paddingLeft: 3}}
                    >
                        {row.maxCapacity || '0'}
                    </Typography>
                </TableCell>
            ),
        },
        {
            name: "Registrations",
            minWidth: "150px",
            cell: (row) => (
                <TableCell title="Registrations">
                    <Typography
                        variant="body2"
                        className={styles.name}
                        sx={{paddingLeft: 3}}
                    >
                        {row._count.registrations || '0'}
                    </Typography>
                </TableCell>
            ),
        },
        {
            name: "Featured",
            minWidth: "150px",
            cell: (row) => (
                <TableCell title="Required">
                    <Typography
                        variant="body2"
                        className={
                            row.isFeatured
                                ? styles.active
                                : styles.notActive
                        }
                    >
                        {row.isFeatured ? 'Featured' : 'Not Featured'}
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
                        to={`/events/edit/${row.id}`}
                        variant="contained"
                        className={styles.editButton}
                    >
                        Edit
                    </Button>
                </TableCell>
            ),
        },
    ];

    if (EventFetchingError, EventCategoryFetchingError) {
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
        <>
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
        </>
    );
};

export default EventList;