import { useCallback, useState, useMemo } from "react";
import useDebounceState from "@/hooks/useDebounceState";

import Table, { TableCell } from "@/components/ui/Table/Table";

import { useEnrollments, useStatusCounts } from "./hooks.js";

import { getStatusCounts } from "../../utils.js";

import {
    Avatar,
    Typography,
    Chip,
    Box,
    Button,
    TextField,
    InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import styles from "./enrollmentList.module.css";
import { formatWords } from "@/utils/formatWord.util.js";

// Define all enrollment status
// const ENROLLMENT_STATUSES = [
//     'DRAFT',
//     'SUBMITTED',
//     'APPROVED',
//     'REJECTED'
// ]

/**
 * Enrollment list components.
 * Show all Enrollments in a table with filters and pagination.
 */
const EnrollmentList = () => {

    /**
     * Table filters
     */
    const [filters, setFilters] = useState({
        page  : 1,
        limit : 10,
        status: "",
        search: "",
    });

    /**
     * Debounced search only
    */
    const debouncedSearch = useDebounceState( filters.search, 1000 );

    /**
     * Prepared query filters
     */
    const queryFilters = useMemo(() => {
        return {
            ...filters,
            search: debouncedSearch,
        };
    }, [filters, debouncedSearch]);

    // Hooks for search users
    const {
        data: enrollmentData,
        isFetching: enrollmentFetching,
        error: enrollmentFetchingError,
        refetch: refetchEnrollment,
    } = useEnrollments(queryFilters);

    // Hooks for search status counts
    const {
        data: statusCounts,
        isFetching: statusFetching,
        error: statusFetchingError,
        refetch: refetchStatusCounts,
    } = useStatusCounts();

    /**
     * Handle realtime filter updates
     */
    const handleFilter = useCallback(
        (rowsPerPage, page, filter) => {
            setFilters((prev) => ({
                ...prev,
                page,
                limit : rowsPerPage,
                status: filter.typeCount || "",
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
                    placeholder="Search users..."
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
            name: "Name",
            minWidth: "180px",
            cell: (row) => (
                <TableCell title="Name">
                    {/* <Link
                        to={`/users/edit/${row.id}`}
                        className={styles.userLink}
                    > */}
                        <Avatar
                            src={row.profilePicture}
                            alt={row.name}
                            className={styles.avatar}
                        />

                        <Typography
                            variant="body2"
                            className={styles.userName}
                        >
                            { row.firstName || row.lastName ? `${row.firstName || ""} ${row.lastName || ""}`.trim() : row.user.name }
                        </Typography>
                    {/* </Link> */}
                </TableCell>
            ),
        },
        {
            name: "Email",
            minWidth: "220px",
            cell: (row) => (
                <TableCell title="Email">
                    <Typography
                        variant="body2"
                        className={styles.email}
                    >
                        {row.user.email}
                    </Typography>
                </TableCell>
            ),
        },
        {
            name: "Status",
            width: "100px",
            cell: (row) => (
                <TableCell title="Status">
                    <Typography
                        variant="body2"
                        className={
                            row.status === "APPROVED"
                                ? styles.approvedStatus
                                : row.status === "REJECTED"
                                    ? styles.rejectedStatus
                                    : row.status === "SUBMITTED"
                                        ? styles.submittedStatus
                                        : styles.draftStatus
                        }
                    >
                        {formatWords(row.status)}
                    </Typography>
                </TableCell>
            ),
        },
        {
            name: "Public ID",
            minWidth: "180px",
            cell: (row) => (
                <TableCell title="Public ID">
                    <Box className={styles.publicIdContainer}>
                        <Typography
                            variant="body2"
                            className={styles.publicIdText}
                        >
                            {row.user.publicId}
                        </Typography>
                    </Box>
                </TableCell>
            ),
        },
    ];

    if ( enrollmentFetchingError || statusFetchingError ) {
        return (
            <Box className={styles.errorContainer}>
                <Typography variant="h6" className={styles.errorText}>
                    Error fetching enrollments data.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        refetchEnrollment();
                        refetchStatusCounts();
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
                data={enrollmentData?.data}
                columns={columns}
                loading={
                    enrollmentFetching ||
                    statusFetching
                }
                selectable={false}
                defaultRowsParPage={10}
                perPageOption={[10, 20, 30, 50, 100]}
                totalRows={enrollmentData?.count}
                typeCounts={getStatusCounts(statusCounts)}
                realtimeFilter={realtimeFilter}
                bulkActionComponent={null}
                handleChange={handleFilter}
            />
        </>
    );
};

export default EnrollmentList;