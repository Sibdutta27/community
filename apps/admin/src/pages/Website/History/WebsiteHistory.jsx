import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  InputAdornment,
  Skeleton,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import PageHeader from "@components/PageHeader/PageHeader";
import Panel from "@components/Panel/Panel";
import SectionNav from "@components/SectionNav/SectionNav";

import useDebounceState from "@/hooks/useDebounceState";

import { useContentRevisions } from "../hooks";
import { WEBSITE_SECTION_ITEMS } from "../sections";

/**
 * Every change to the site's copy, newest first.
 *
 * Content edits deliberately bypass code review, so this log is not a nicety —
 * it is the thing that makes bypassing review acceptable. It answers "who
 * changed the homepage, when, and what did it say before".
 */
export default function WebsiteHistory() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [keyPath, setKeyPath] = useState("");

  const debouncedKeyPath = useDebounceState(keyPath, 350);

  const { data, isLoading, error, refetch } = useContentRevisions({
    page,
    limit,
    keyPath: debouncedKeyPath.trim(),
  });

  const rows = data?.data ?? [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <PageHeader
        title="Website Studio"
        description="Every published change and restore, with who made it."
      />

      <SectionNav items={WEBSITE_SECTION_ITEMS} />

      {error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Could not load the change history.
        </Alert>
      ) : (
        <Panel padding="none">
          <Box sx={{ p: 1.25, borderBottom: "1px solid var(--admin-border)" }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Filter to one piece of text, e.g. home.hero.title"
              value={keyPath}
              onChange={(event) => {
                setKeyPath(event.target.value);
                setPage(1);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          {isLoading ? (
            <Box sx={{ p: 1.25 }}>
              {[0, 1, 2].map((n) => (
                <Skeleton
                  key={n}
                  variant="rounded"
                  height={56}
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          ) : rows.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {debouncedKeyPath.trim()
                  ? "Nothing has changed for that text yet."
                  : "No changes have been published yet."}
              </Typography>
            </Box>
          ) : (
            rows.map((revision, index) => (
              <Box
                key={revision.id}
                sx={{
                  px: 1.5,
                  py: 1.25,
                  borderTop:
                    index === 0 ? "none" : "1px solid var(--admin-border)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Chip
                    size="small"
                    variant="outlined"
                    color={
                      revision.action === "REVERTED" ? "default" : "primary"
                    }
                    label={
                      revision.action === "REVERTED" ? "Restored" : "Published"
                    }
                  />

                  <Typography variant="body2" fontWeight={600}>
                    {revision.keyPath}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{ color: "var(--admin-muted)", ml: "auto" }}
                  >
                    {new Date(revision.createdAt).toLocaleString()}
                    {revision.actorEmail ? ` · ${revision.actorEmail}` : ""}
                  </Typography>
                </Box>

                {/* Before and after, both languages. A log that only says
                    "changed" cannot answer what it used to say. */}
                <Box
                  sx={{
                    display: "grid",
                    gap: 1,
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    mt: 0.75,
                  }}
                >
                  <RevisionDiff
                    label="English"
                    from={revision.fromEn}
                    to={revision.toEn}
                  />
                  <RevisionDiff
                    label="Español"
                    from={revision.fromEs}
                    to={revision.toEs}
                  />
                </Box>
              </Box>
            ))
          )}

          <TablePagination
            component="div"
            count={data?.count ?? 0}
            page={Math.max(0, page - 1)}
            onPageChange={(_event, next) => setPage(next + 1)}
            rowsPerPage={limit}
            rowsPerPageOptions={[20, 50, 100]}
            onRowsPerPageChange={(event) => {
              setLimit(Number(event.target.value));
              setPage(1);
            }}
            sx={{ borderTop: "1px solid var(--admin-border)" }}
          />
        </Panel>
      )}
    </Box>
  );
}

/**
 * One locale's before/after. A null side means "the shipped original" — a
 * revert has no "to", and a first publish has no "from".
 */
function RevisionDiff({ label, from, to }) {
  if (from === null && to === null) {
    return null;
  }

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{ color: "var(--admin-muted)", display: "block" }}
      >
        {label}
      </Typography>

      <Typography
        variant="caption"
        sx={{
          display: "block",
          color: "var(--admin-muted)",
          textDecoration: "line-through",
        }}
      >
        {from ?? "the original wording"}
      </Typography>

      <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
        {to ?? "the original wording"}
      </Typography>
    </Box>
  );
}
