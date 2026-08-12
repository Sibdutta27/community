import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import GroupsIcon from "@mui/icons-material/Groups";

import Panel from "@components/Panel/Panel";

import CategorySelect from "../CategorySelect/CategorySelect";

import { useEventCalendar } from "./hooks";
import { useEventCategory } from "../EventList.jsx/hooks.js";

import {
  WEEKDAY_LABELS,
  addMonths,
  buildMonthGrid,
  formatEventTime,
  formatMonthLabel,
  groupEventsByDay,
  isSameDay,
  monthWindow,
  startOfMonth,
  toDateKey,
} from "../../calendar.util";

/**
 * A month calendar as the primary way to see and manage events.
 *
 * The grid is plain date math over CSS grid — no calendar dependency. Click a
 * day to add an event on it, click an event to edit it.
 *
 * Styling follows the admin's governance aesthetic: one elevated white card,
 * hairline cell rules rather than boxes-within-boxes, azul reserved for the
 * active/primary marks, and no colour used as the only carrier of meaning.
 */
const EventCalendar = () => {
  const navigate = useNavigate();

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [categoryId, setCategoryId] = useState("");

  const today = useMemo(() => new Date(), []);

  const { weeks } = useMemo(() => buildMonthGrid(month), [month]);

  // The window the API is asked for: the whole visible grid, not just the
  // month, so the leading/trailing days of adjacent months are populated too.
  const gridWindow = useMemo(() => monthWindow(month), [month]);

  const { data, isFetching, error, refetch } = useEventCalendar({
    ...gridWindow,
    categoryId,
  });

  const { data: categoryData } = useEventCategory({});

  const eventsByDay = useMemo(() => groupEventsByDay(data?.data), [data]);

  if (error) {
    return (
      <Panel padding="roomy">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            py: 4,
          }}
        >
          <Typography variant="h6">Could not load the calendar.</Typography>

          <Button variant="contained" onClick={() => refetch()}>
            Retry
          </Button>
        </Box>
      </Panel>
    );
  }

  return (
    <Panel padding="compact">
      {/* MONTH BAR */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          pb: 1.25,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            aria-label="Previous month"
            onClick={() => setMonth((prev) => addMonths(prev, -1))}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <ChevronLeftIcon />
          </IconButton>

          <IconButton
            aria-label="Next month"
            onClick={() => setMonth((prev) => addMonths(prev, 1))}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <ChevronRightIcon />
          </IconButton>

          <Typography
            component="h2"
            sx={{
              ml: 1,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              fontSize: { xs: "1.05rem", sm: "1.2rem" },
            }}
          >
            {formatMonthLabel(month)}
          </Typography>

          {isFetching ? <CircularProgress size={16} sx={{ ml: 1 }} /> : null}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          {/* Bounded: CategorySelect is fullWidth, which let it eat the bar
              and push "Today" onto a second line. */}
          <Box sx={{ width: 200 }}>
            <CategorySelect
              value={categoryId}
              placeholder="Category"
              categorys={categoryData?.data}
              onChange={(id) => setCategoryId(id || "")}
            />
          </Box>

          <Button
            size="small"
            variant="outlined"
            onClick={() => setMonth(startOfMonth(new Date()))}
          >
            Today
          </Button>
        </Box>
      </Box>

      {/* WEEKDAY HEADINGS */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        {WEEKDAY_LABELS.map((label) => (
          <Typography
            key={label}
            sx={{
              py: 0.5,
              textAlign: "center",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "text.secondary",
            }}
          >
            {label}
          </Typography>
        ))}
      </Box>

      {/* MONTH GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",

          // Hairline rules drawn by the cells' own borders — one shared grid,
          // not 42 separate boxes.
          borderTop: "1px solid",
          borderLeft: "1px solid",
          borderColor: "divider",
          borderRadius: "12px 12px 0 0",
          overflow: "hidden",
        }}
      >
        {weeks.flat().map((day) => {
          const inMonth = day.getMonth() === month.getMonth();
          const isToday = isSameDay(day, today);

          const dayEvents = eventsByDay.get(toDateKey(day)) || [];

          return (
            <DayCell
              key={toDateKey(day)}
              day={day}
              inMonth={inMonth}
              isToday={isToday}
              events={dayEvents}
              onAdd={() => navigate(`/events/create?date=${toDateKey(day)}`)}
              onOpenEvent={(event) => navigate(`/events/edit/${event.id}`)}
            />
          );
        })}
      </Box>

      <Typography
        sx={{
          pt: 1,
          fontSize: "0.72rem",
          color: "text.secondary",
        }}
      >
        Click a day to add an event on it, or an event to edit it. Use the list
        view to scan or search across months.
      </Typography>
    </Panel>
  );
};

/**
 * One day. The whole cell is the "add on this day" target; the event chips sit
 * on top of it and stop the click from reaching it.
 */
function DayCell({ day, inMonth, isToday, events, onAdd, onOpenEvent }) {
  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={`Add an event on ${day.toDateString()}`}
      onClick={onAdd}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onAdd();
        }
      }}
      sx={{
        position: "relative",

        minHeight: { xs: 76, md: 92 },

        p: 0.5,

        borderRight: "1px solid",
        borderBottom: "1px solid",
        borderColor: "divider",

        cursor: "pointer",

        bgcolor: inMonth ? "background.paper" : "var(--admin-surface-muted)",

        transition: "background-color 200ms",

        "&:hover": { bgcolor: "var(--admin-surface-muted)" },

        "&:hover .day-add": { opacity: 1 },

        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: -2,
        },

        "@media (prefers-reduced-motion: reduce)": { transition: "none" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 0.5,
          mb: 0.5,
        }}
      >
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: "999px",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            fontSize: "0.7rem",
            fontWeight: isToday ? 700 : 600,

            // Today is marked by an azul disc, not by colour alone.
            bgcolor: isToday ? "var(--admin-primary)" : "transparent",
            color: isToday
              ? "#ffffff"
              : inMonth
                ? "text.primary"
                : "text.secondary",
          }}
        >
          {day.getDate()}
        </Box>

        <AddIcon
          className="day-add"
          fontSize="small"
          sx={{
            opacity: 0,
            color: "var(--admin-muted)",
            transition: "opacity 200ms",
            "@media (prefers-reduced-motion: reduce)": { transition: "none" },
          }}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {events.slice(0, 3).map((event) => (
          <EventChip key={event.id} event={event} onOpen={onOpenEvent} />
        ))}

        {events.length > 3 ? (
          <Typography
            sx={{
              pl: 0.5,
              fontSize: "0.7rem",
              fontWeight: 600,
              color: "text.secondary",
            }}
          >
            +{events.length - 3} more
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

/**
 * One event inside a day: time, title, and the registration count — the number
 * staff are actually here for.
 */
function EventChip({ event, onOpen }) {
  const registrations = event?._count?.registrations ?? 0;

  return (
    <Box
      component="button"
      type="button"
      title={`${event.title}${
        event.category?.name ? ` — ${event.category.name}` : ""
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onOpen(event);
      }}
      sx={{
        width: "100%",

        display: "flex",
        alignItems: "center",
        gap: 0.5,

        px: 0.75,
        py: 0.4,

        textAlign: "left",
        cursor: "pointer",

        border: "1px solid rgba(10, 86, 168, 0.2)",
        borderLeft: "3px solid",
        borderLeftColor: event.isFeatured
          ? "var(--admin-celeste)"
          : "var(--admin-primary)",
        borderRadius: "6px",

        bgcolor: "var(--admin-secondary-tint)",
        color: "var(--admin-secondary-fg)",

        fontFamily: "inherit",
        fontSize: "0.7rem",
        fontWeight: 600,
        lineHeight: 1.3,

        transition: "background-color 200ms",

        "&:hover": { bgcolor: "rgba(10, 86, 168, 0.14)" },

        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 1,
        },

        "@media (prefers-reduced-motion: reduce)": { transition: "none" },
      }}
    >
      <Box
        component="span"
        sx={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {formatEventTime(event.startDateTime)} {event.title}
      </Box>

      {/* Uptake at a glance. Plain text, not a nested control — an
          interactive element inside a button is invalid, and the roster is one
          click further on from the event's own page. */}
      <Box
        component="span"
        aria-label={`${registrations} registered`}
        sx={{
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          gap: 0.25,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <GroupsIcon sx={{ fontSize: "0.85rem" }} />
        {registrations}
      </Box>
    </Box>
  );
}

export default EventCalendar;
