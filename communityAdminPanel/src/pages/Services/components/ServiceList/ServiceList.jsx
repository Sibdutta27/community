import { useCallback, useState, useMemo } from "react";
import useDebounceState from "@/hooks/useDebounceState";

import Table, { TableCell } from "@/components/ui/Table/Table";

import { Link } from "react-router-dom";

import { useServices, useServiceCategory } from "./hooks.js";

import {
    Typography,
    Box,
    Button,
    TextField,
    InputAdornment,
    TextareaAutosize
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import styles from "./serviceList.module.css";
import CategorySelect from "../CategorySelect/CategorySelect.jsx";
import { formatWords } from "@/utils/formatWord.util.js";

/**
 * Service list components.
 * @returns
 */
const ServiceList = () => {

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
        error: ServiceCategoryFetchingError,
        refetch: refetchServiceCategory,
    } = useServiceCategory({});

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
                <Box key="categories" >
                    <CategorySelect
                        key="categories"
                        placeholder="Select Category..."
                        categorys={ServiceCategoryData?.data}
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
                    placeholder="Search Service..."
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
                    minRows={2}
                    className={styles.keyTextarea}
                />
                // </TableCell>
            ),
        },
        {
            name: "Status",
            minWidth: "150px",
            cell: (row) => (
                <TableCell title="Status">
                    <Typography
                        variant="body2"
                        className={
                            row.status == 'ACTIVE'
                                ? styles.active
                                : styles.notActive
                        }
                    >
                        {formatWords(row.status)}
                    </Typography>
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
                    minRows={2}
                    className={styles.keyTextarea}
                />
                // </TableCell>
            ),
        },
        {
            name: "Phone",
            minWidth: "300px",
            cell: (row) => (
                // <TableCell title="Content">
                <TextareaAutosize
                    value={row.phone || '-'}
                    disabled
                    minRows={2}
                    className={styles.keyTextarea}
                />
                // </TableCell>
            ),
        },
        {
            name: "Email",
            minWidth: "300px",
            cell: (row) => (
                // <TableCell title="Content">
                <TextareaAutosize
                    value={row.email || '-'}
                    disabled
                    minRows={2}
                    className={styles.keyTextarea}
                />
                // </TableCell>
            ),
        },
        {
            name: "Action Type",
            minWidth: "150px",
            cell: (row) => (
                <TableCell title="Action Type">
                    <Typography
                        variant="body2"
                        className={styles.name}
                    >
                        {formatWords(row.actionType) || '-'}
                    </Typography>
                </TableCell>
            ),
        },
        {
            name: "Action Label",
            minWidth: "300px",
            cell: (row) => (
                <TextareaAutosize
                    value={row.actionLabel || '-'}
                    disabled
                    minRows={2}
                    className={styles.keyTextarea}
                />
            ),
        },
        {
            name: "Action Url",
            minWidth: "300px",
            cell: (row) => (
                <TextareaAutosize
                    value={row.actionUrl || '-'}
                    disabled
                    minRows={2}
                    className={styles.keyTextarea}
                />
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
                        to={`/services/edit/${row.id}`}
                        variant="contained"
                        className={styles.editButton}
                    >
                        Edit
                    </Button>
                </TableCell>
            ),
        },
    ];

    if (ServiceFetchingError, ServiceCategoryFetchingError) {
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
        <>
            <Table
                data={ServiceData?.data}
                columns={columns}
                loading={
                    ServiceFetching ||
                    ServiceCategoryFetching
                }
                defaultRowsParPage={10}
                perPageOption={[10, 20, 30, 50, 100]}
                totalRows={ServiceData?.count}
                realtimeFilter={realtimeFilter}
                bulkActionComponent={null}
                handleChange={handleFilter}
            />
        </>
    );
};

export default ServiceList;