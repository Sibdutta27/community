import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Table, { TableCell } from "@/components/ui/Table/Table";

import { useFeedback, useFeedbackStatusCounts } from "./hooks.js";

import {
  Box,
  Button,
  Chip,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";

import styles from "./feedbackList.module.css";

import {
  FEEDBACK_STATUSES,
  feedbackStatusColor,
  feedbackStatusLabel,
  feedbackSubmitterName,
  formatFeedbackDate,
  formatPageUrl,
} from "../../utils.js";

/**
 * Feedback list component.
 * Shows the triage queue — newest first — with a status filter and pagination.
 */
const FeedbackList = () => {
  /**
   * Table filters
   */
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
  });

  // Hook for the paginated queue
  const {
    data: feedbackData,
    isFetching: feedbackFetching,
    error: feedbackFetchingError,
    refetch: refetchFeedback,
  } = useFeedback(filters);

  // Hook for the per-lane counts shown inside the filter
  const { data: statusCounts } = useFeedbackStatusCounts();

  /**
   * Total across every lane, for the "All statuses" option
   */
  const totalCount = useMemo(() => {
    if (!statusCounts) return null;

    return Object.values(statusCounts).reduce((sum, value) => sum + value, 0);
  }, [statusCounts]);

  /**
   * Handle realtime filter updates
   */
  const handleFilter = useCallback((rowsPerPage, page, filter) => {
    setFilters((prev) => ({
      ...prev,
      page,
      limit: rowsPerPage,
      status: filter.status || "",
    }));
  }, []);

  /**
   * Define realtime filters — one status select, with the size of each lane
   * shown alongside it so staff can see where the queue is piling up.
   */
  const realtimeFilter = [
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
          className={styles.statusFilter}
        >
          <MenuItem value="">
            {totalCount === null
              ? "All statuses"
              : `All statuses (${totalCount})`}
          </MenuItem>

          {FEEDBACK_STATUSES.map((status) => (
            <MenuItem key={status.value} value={status.value}>
              {statusCounts
                ? `${status.label} (${statusCounts[status.value] ?? 0})`
                : status.label}
            </MenuItem>
          ))}
        </TextField>
      ),
    },
  ];

  /**
   * Columns for the data table
   */
  const columns = [
    {
      name: "Submitted",
      width: "175px",
      cell: (row) => (
        <TableCell title="Submitted">
          <Typography variant="body2" className={styles.date}>
            {formatFeedbackDate(row.createdAt)}
          </Typography>
        </TableCell>
      ),
    },
    {
      name: "From",
      minWidth: "190px",
      cell: (row) => (
        <TableCell title="From">
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              className={row.isAnonymous ? styles.anonymous : styles.submitter}
            >
              {feedbackSubmitterName(row)}
            </Typography>

            {!row.isAnonymous && row.submitter?.email && (
              <Typography variant="body2" className={styles.email}>
                {row.submitter.email}
              </Typography>
            )}
          </Box>
        </TableCell>
      ),
    },
    {
      name: "Page",
      minWidth: "160px",
      cell: (row) => (
        <TableCell title={row.pageUrl}>
          <Typography
            variant="body2"
            component="span"
            className={styles.pageUrl}
          >
            {formatPageUrl(row.pageUrl)}
          </Typography>
        </TableCell>
      ),
    },
    {
      name: "Message",
      minWidth: "300px",
      grow: 2,
      cell: (row) => (
        <TableCell title="Message">
          <Link to={`/feedback/${row.id}`} className={styles.feedbackLink}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 0.75,
                minWidth: 0,
              }}
            >
              {row.hasAttachment && (
                <Tooltip title="Has an attachment">
                  <AttachFileIcon
                    fontSize="small"
                    sx={{
                      color: "var(--admin-muted)",
                      mt: "2px",
                      flexShrink: 0,
                    }}
                  />
                </Tooltip>
              )}

              <Typography variant="body2" className={styles.message}>
                {row.messagePreview}
              </Typography>
            </Box>
          </Link>
        </TableCell>
      ),
    },
    {
      name: "Status",
      width: "140px",
      cell: (row) => (
        <TableCell title="Status">
          <Chip
            size="small"
            label={feedbackStatusLabel(row.status)}
            color={feedbackStatusColor(row.status)}
            variant="outlined"
          />
        </TableCell>
      ),
    },
  ];

  if (feedbackFetchingError) {
    return (
      <Box className={styles.errorContainer}>
        <Typography variant="h6" className={styles.errorText}>
          Error fetching feedback.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            refetchFeedback();
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Table
      data={feedbackData?.data}
      columns={columns}
      loading={feedbackFetching}
      selectable={false}
      defaultRowsParPage={10}
      perPageOption={[10, 20, 30, 50, 100]}
      totalRows={feedbackData?.count}
      realtimeFilter={realtimeFilter}
      bulkActionComponent={null}
      handleChange={handleFilter}
    />
  );
};

export default FeedbackList;
