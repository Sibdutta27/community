import { useCallback, useState, useMemo } from "react";
import useDebounceState from "@/hooks/useDebounceState";
import { toast } from "react-toastify";

import Table, { TableCell } from "@/components/ui/Table/Table";
import Checkbox from "@components/ui/Checkbox";
import RoleSelect from "./RoleSelect";

import { Link } from "react-router-dom";

import { useUsers, useRoleCounts, useRoleChange } from "../../hooks/useUser";

import { getRoleCounts } from "../../util";

import {
  Alert,
  Avatar,
  Typography,
  Chip,
  Box,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import styles from "./userList.module.css";

// Define all user roles
const USER_ROLES = ["USER", "ADMIN", "MODERATOR"];

/**
 * Userlist components.
 * Show all users
 * @returns
 */
const UserList = () => {
  // State variable for selected row
  const [selectedRow, setSelectedRow] = useState([]);

  // State variable for change role to
  const [changeRoleTo, setChangeRoleTo] = useState("");

  /**
   * Table filters
   */
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    role: "",
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

  // Hooks for search users
  const {
    data: usersData,
    isFetching: usersFetching,
    error: usersFetchingError,
    refetch: refetchUsers,
  } = useUsers(queryFilters);

  // Hooks for search role counts
  const {
    data: roleCounts,
    isFetching: roleFetching,
    refetch: refetchRoleCounts,
  } = useRoleCounts();

  // Hook for change users role
  const { mutateAsync: roleChangeMut, isPending: roleChanging } =
    useRoleChange();

  /**
   * Handle realtime filter updates
   */
  const handleFilter = useCallback((rowsPerPage, page, filter) => {
    setFilters((prev) => ({
      ...prev,
      page,
      limit: rowsPerPage,
      role: filter.typeCount || "",
      search: filter.search || "",
    }));
  }, []);

  /**
   * Handle role changes
   */
  const handleRoleChange = async (users, role) => {
    await roleChangeMut(
      { users, role },
      {
        /**
         * Handle on success
         */
        onSuccess: () => {
          refetchUsers();
          refetchRoleCounts();

          // Show the success message
          toast.success("User roles updated successfully.");
        },

        /**
         * Handle on error
         */
        onError: (error) => {
          refetchUsers();

          // Show the error message
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to update user roles. Please check your connection and try again";
          toast.error(errorMessage);
        },
      },
    );
  };

  /**
   * Define realtime filters
   */
  const realtimeFilter = [
    {
      name: "changeRole",
      render: () => {
        return (
          <Box key="changeRole" className={styles.roleFilterContainer}>
            <Box>
              <RoleSelect
                roles={USER_ROLES}
                placeholder="Change role to..."
                onChange={setChangeRoleTo}
              />
            </Box>

            <Button
              variant="contained"
              color="info"
              disableElevation
              onClick={() => {
                if (!changeRoleTo) {
                  return toast.error("Please select role to change.");
                }

                if (!selectedRow?.length) {
                  return toast.error("Please select at least one row.");
                }

                handleRoleChange(
                  selectedRow.map((row) => row.id),
                  changeRoleTo,
                );
              }}
            >
              Change
            </Button>
          </Box>
        );
      },
    },
    {
      name: "search",
      render: (updateFilter, filterValue) => (
        <TextField
          key="searchField"
          name="search"
          placeholder="Search users..."
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
      name: "Name",
      minWidth: "180px",
      cell: (row) => (
        <TableCell title="Name">
          <Link to={`/users/edit/${row.id}`} className={styles.userLink}>
            <Avatar
              src={row.profilePicture}
              alt={row.name}
              className={styles.avatar}
            />

            <Typography variant="body2" className={styles.userName}>
              {row.name}
            </Typography>
          </Link>
        </TableCell>
      ),
    },
    {
      name: "Email",
      minWidth: "220px",
      cell: (row) => (
        <TableCell title="Email">
          <Typography variant="body2" className={styles.email}>
            {row.email}
          </Typography>
        </TableCell>
      ),
    },
    {
      name: "Role",
      width: "100px",
      cell: (row) => (
        <TableCell title="Role">
          <Typography
            variant="body2"
            className={
              row.role === "ADMIN" ? styles.adminRole : styles.userRole
            }
          >
            {row.role}
          </Typography>
        </TableCell>
      ),
    },
    {
      name: "Enrollment",
      minWidth: "120px",
      cell: (row) => (
        <TableCell title="Enrollment Status">
          <Chip
            label={row.hasEnrollment ? "Enrolled" : "Not Enrolled"}
            size="small"
            className={
              row.hasEnrollment ? styles.enrolledChip : styles.notEnrolledChip
            }
          />
        </TableCell>
      ),
    },
    {
      name: "Public ID",
      minWidth: "180px",
      cell: (row) => (
        <TableCell title="Public ID">
          <Box className={styles.publicIdContainer}>
            <Typography variant="body2" className={styles.publicIdText}>
              {row.publicId}
            </Typography>
          </Box>
        </TableCell>
      ),
    },
    {
      name: "Last Active",
      minWidth: "190px",
      cell: (row) => (
        <TableCell title="Last Active">
          <Box className={styles.lastActiveContainer}>
            <Box
              className={
                row.lastActiveAt ? styles.activeDot : styles.inactiveDot
              }
            />

            <Typography variant="body2" className={styles.lastActiveText}>
              {row.lastActiveAt
                ? new Date(row.lastActiveAt).toLocaleString()
                : "Never Active"}
            </Typography>
          </Box>
        </TableCell>
      ),
    },
  ];

  /**
   * The error was destructured and then never read, so a failed fetch showed
   * an empty table — indistinguishable from "there are no users".
   */
  if (usersFetchingError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => refetchUsers()}>
            Retry
          </Button>
        }
      >
        Could not load users.
      </Alert>
    );
  }

  return (
    <>
      <Table
        data={usersData?.data}
        columns={columns}
        loading={usersFetching || roleFetching || roleChanging}
        selectable={true}
        defaultRowsParPage={10}
        perPageOption={[10, 20, 30, 50, 100]}
        totalRows={usersData?.count}
        typeCounts={getRoleCounts(roleCounts)}
        realtimeFilter={realtimeFilter}
        bulkActionComponent={null}
        handleChange={handleFilter}
        handleSelect={setSelectedRow}
        selectableRowsComponent={Checkbox}
      />
    </>
  );
};

export default UserList;
