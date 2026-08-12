import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Alert, Box, Chip, Skeleton, Stack, Typography } from "@mui/material";

import PageHeader from "@components/PageHeader/PageHeader";
import Panel from "@components/Panel/Panel";
import StatCard from "@components/StatCard/StatCard";

import { fetchStatusCounts, getEnrollments } from "@/api/enrollment.api";
import { fetchRoleCounts } from "@/api/user.api";
import { fetchFeedbackStatusCounts } from "@/api/feedback.api";
import { getEventCalendar } from "@/api/event.api";

/**
 * The registrar's overview.
 *
 * This page previously rendered invented SaaS metrics — "Total Revenue
 * $24.8k", "New Orders 342" — and was not routed at all. Every figure here now
 * comes from an endpoint, and each one is either a fact about the register or
 * a piece of work waiting for someone.
 *
 * No figure is shown unless it can be sourced. Where a count is unavailable
 * the tile says so rather than rendering a zero, because on this screen a zero
 * means "nothing to do" and that is a claim worth being careful about.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function formatDateTime(value) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function displayName(enrollment) {
  const parts =
    `${enrollment.firstName || ""} ${enrollment.lastName || ""}`.trim();
  return (
    parts ||
    enrollment.user?.name ||
    enrollment.user?.email ||
    "Unnamed applicant"
  );
}

/** A count that failed to load must not read as a real zero. */
function figure(query, value) {
  if (query.isLoading) return "—";
  if (query.error) return "—";
  return value;
}

export default function Dashboard() {
  const statusCounts = useQuery({
    queryKey: ["enrollment-status-counts"],
    queryFn: fetchStatusCounts,
  });

  const roleCounts = useQuery({
    queryKey: ["role-counts"],
    queryFn: fetchRoleCounts,
  });

  const feedbackCounts = useQuery({
    queryKey: ["feedback-status-counts"],
    queryFn: fetchFeedbackStatusCounts,
  });

  const recent = useQuery({
    queryKey: ["dashboard-recent-enrollments"],
    queryFn: () => getEnrollments({ page: 1, limit: 6 }),
  });

  // The next 30 days, bucketed by the browser's own clock so "upcoming"
  // matches what the calendar view shows.
  const upcoming = useQuery({
    queryKey: ["dashboard-upcoming-events"],
    queryFn: () => {
      const now = new Date();
      return getEventCalendar({
        from: toIsoDate(now),
        to: toIsoDate(new Date(now.getTime() + 30 * DAY_MS)),
      });
    },
  });

  const awaiting = statusCounts.data?.SUBMITTED ?? 0;
  const openFeedback =
    (feedbackCounts.data?.NEW ?? 0) + (feedbackCounts.data?.IN_REVIEW ?? 0);

  const recentRows = recent.data?.data ?? [];
  // Already ordered by startDateTime ascending server-side, so this only trims.
  const upcomingRows = (upcoming.data?.data ?? []).slice(0, 6);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <PageHeader
        title="Overview"
        description="Where the register stands today, and what is waiting on staff."
      />

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
        }}
      >
        <StatCard
          title="Awaiting review"
          value={figure(statusCounts, awaiting)}
          helper={awaiting > 0 ? "Open the review queue" : "Queue is clear"}
          to="/enrollments/all"
          emphasis
        />
        <StatCard
          title="Approved members"
          value={figure(statusCounts, statusCounts.data?.APPROVED ?? 0)}
          helper="Enrollment accepted"
          to="/enrollments/all"
        />
        <StatCard
          title="Applications in progress"
          value={figure(statusCounts, statusCounts.data?.DRAFT ?? 0)}
          helper="Started, not yet submitted"
          to="/enrollments/all"
        />
        <StatCard
          title="Open feedback"
          value={figure(feedbackCounts, openFeedback)}
          helper="New and in review"
          to="/feedback"
          emphasis
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr", lg: "3fr 2fr" },
          alignItems: "start",
        }}
      >
        <Panel>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              Latest applications
            </Typography>

            <Typography
              component={Link}
              to="/enrollments/all"
              variant="caption"
              sx={{
                color: "primary.main",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              View all
            </Typography>
          </Stack>

          {recent.isLoading ? (
            <Skeleton variant="rounded" height={160} />
          ) : recent.error ? (
            <Alert severity="error">Could not load recent applications</Alert>
          ) : recentRows.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No applications yet.
            </Typography>
          ) : (
            recentRows.map((row, index) => (
              <Box
                key={row.id}
                component={Link}
                to={`/enrollments/approval/${row.id}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  py: 1,
                  textDecoration: "none",
                  color: "inherit",
                  borderTop:
                    index === 0 ? "none" : "1px solid var(--admin-border)",
                  "&:hover .name": { color: "primary.main" },
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    className="name"
                    variant="body2"
                    fontWeight={600}
                    noWrap
                  >
                    {displayName(row)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {row.user?.email}
                  </Typography>
                </Box>

                <Chip size="small" variant="outlined" label={row.status} />
              </Box>
            ))
          )}
        </Panel>

        <Panel>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              Next 30 days
            </Typography>

            <Typography
              component={Link}
              to="/events"
              variant="caption"
              sx={{
                color: "primary.main",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Calendar
            </Typography>
          </Stack>

          {upcoming.isLoading ? (
            <Skeleton variant="rounded" height={160} />
          ) : upcoming.error ? (
            <Alert severity="error">Could not load upcoming events</Alert>
          ) : upcomingRows.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nothing scheduled in the next 30 days.
            </Typography>
          ) : (
            upcomingRows.map((event, index) => (
              <Box
                key={event.id}
                component={Link}
                to={`/events/edit/${event.id}`}
                sx={{
                  display: "block",
                  py: 1,
                  textDecoration: "none",
                  color: "inherit",
                  borderTop:
                    index === 0 ? "none" : "1px solid var(--admin-border)",
                  "&:hover .title": { color: "primary.main" },
                }}
              >
                <Typography
                  className="title"
                  variant="body2"
                  fontWeight={600}
                  noWrap
                >
                  {event.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(event.startDateTime)}
                  {event.location ? ` · ${event.location}` : ""}
                </Typography>
              </Box>
            ))
          )}
        </Panel>
      </Box>

      <Typography variant="caption" sx={{ color: "var(--admin-muted)" }}>
        Members: {figure(roleCounts, roleCounts.data?.USER ?? 0)} ·{" "}
        Administrators: {figure(roleCounts, roleCounts.data?.ADMIN ?? 0)} ·{" "}
        Moderators: {figure(roleCounts, roleCounts.data?.MODERATOR ?? 0)}
      </Typography>
    </Box>
  );
}
