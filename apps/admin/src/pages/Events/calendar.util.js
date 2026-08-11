/**
 * Month-grid date math.
 *
 * Built on the platform `Date` rather than a calendar library: a month grid is
 * six weeks of day arithmetic, and adding a dependency (plus its locale data)
 * to the admin bundle to compute it would cost far more than it saves.
 *
 * Everything here works in the viewer's LOCAL timezone on purpose — staff
 * schedule events in the hall's clock, so a Saturday evening event must land
 * on Saturday's cell, not slide to Sunday because UTC says so.
 */

/** Weekday headings, Sunday-first, matching the grid below. */
export const WEEKDAY_LABELS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

/** Midnight, local time, on the same day as `date`. */
export function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** The 1st of `date`'s month, local midnight. */
export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** `months` later (or earlier), anchored on the 1st so no day-overflow. */
export function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** Two dates fall on the same local calendar day. */
export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * `YYYY-MM-DD` for a local date — the shape an `<input type="date">` and our
 * own `?date=` query param both speak. `toISOString()` is wrong here: it would
 * shift the day for anyone west of UTC.
 */
export function toDateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * `YYYY-MM-DDTHH:mm` for a local datetime — what `<input type="datetime-local">`
 * expects as a value.
 */
export function toDateTimeLocal(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${toDateKey(date)}T${hours}:${minutes}`;
}

/**
 * The visible grid for a month: the month padded out to whole Sunday-start
 * weeks. Always emits whole weeks; length varies between 28 and 42 days, so
 * the grid never shows a stray blank row.
 */
export function buildMonthGrid(month) {
  const first = startOfMonth(month);

  // Back up to the Sunday on or before the 1st.
  const gridStart = addDays(first, -first.getDay());

  // Forward to the Saturday on or after the last day.
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const gridEnd = addDays(last, 6 - last.getDay());

  const days = [];

  for (
    let cursor = gridStart;
    cursor <= gridEnd;
    cursor = addDays(cursor, 1)
  ) {
    days.push(startOfDay(cursor));
  }

  const weeks = [];

  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }

  return { days, weeks, gridStart, gridEnd };
}

/**
 * The window to ask the API for: the whole visible grid, as an inclusive start
 * and an exclusive end.
 */
export function monthWindow(month) {
  const { gridStart, gridEnd } = buildMonthGrid(month);

  return {
    from: gridStart.toISOString(),
    to: addDays(gridEnd, 1).toISOString(),
  };
}

/**
 * Index events by the local day they start on, so each cell is one lookup
 * rather than a scan of the whole month.
 */
export function groupEventsByDay(events = []) {
  const byDay = new Map();

  for (const event of events) {
    const start = new Date(event.startDateTime);

    if (Number.isNaN(start.getTime())) continue;

    const key = toDateKey(start);

    if (!byDay.has(key)) {
      byDay.set(key, []);
    }

    byDay.get(key).push(event);
  }

  // Within a day, earliest first — that is the order the day is lived in.
  for (const list of byDay.values()) {
    list.sort(
      (a, b) => new Date(a.startDateTime) - new Date(b.startDateTime),
    );
  }

  return byDay;
}

/** "September 2026" in the viewer's locale. */
export function formatMonthLabel(month) {
  return month.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

/** "6:00 PM" — the only part of the timestamp a calendar chip has room for. */
export function formatEventTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}
