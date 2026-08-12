import { useMemo, useState } from "react";

import {
  Box,
  InputAdornment,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import PageHeader from "@components/PageHeader/PageHeader";
import Panel from "@components/Panel/Panel";
import SectionNav from "@components/SectionNav/SectionNav";

import useDebounceState from "@/hooks/useDebounceState";

import RevisionList from "../components/RevisionList";
import SitePreview from "../components/SitePreview";

import { useContentRevisions } from "../hooks";
import { findPageForKeyPath, WEBSITE_PAGES } from "../pages.config";
import { WEBSITE_SECTION_ITEMS } from "../sections";

/**
 * Every change to the site's copy, newest first, beside the page it changed.
 *
 * Content edits deliberately bypass code review, so this log is not a nicety —
 * it is the thing that makes bypassing review acceptable. It answers "who
 * changed the homepage, when, and what did it say before".
 *
 * Selecting a change points the preview at the page that change belongs to.
 * The preview shows that page as it is NOW, not as it was — nothing here
 * stores a rendered snapshot, and pretending otherwise would be worse than
 * saying so. The before/after text on each row is the historical record.
 */
export default function WebsiteHistory() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [keyPath, setKeyPath] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const debouncedKeyPath = useDebounceState(keyPath, 350);

  const { data, isLoading, error, refetch } = useContentRevisions({
    page,
    limit,
    keyPath: debouncedKeyPath.trim(),
  });

  const revisions = useMemo(() => data?.data ?? [], [data]);

  // Default to the newest change so the pane is never blank on arrival.
  const selected =
    revisions.find((revision) => revision.id === selectedId) ?? revisions[0];

  const previewPage = selected
    ? findPageForKeyPath(selected.keyPath)
    : WEBSITE_PAGES[0];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <PageHeader
        title="Website Studio"
        description="Every published change and restore, with who made it. Select one to see the page it changed."
      />

      <SectionNav items={WEBSITE_SECTION_ITEMS} />

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1fr) 380px",
            xl: "minmax(0, 1fr) 460px",
          },
          alignItems: "start",
        }}
      >
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
                setSelectedId(null);
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

          <RevisionList
            revisions={revisions}
            isLoading={isLoading}
            error={error}
            onRetry={() => refetch()}
            selectedId={selected?.id}
            onSelect={(revision) => setSelectedId(revision.id)}
            emptyMessage={
              debouncedKeyPath.trim()
                ? "Nothing has changed for that text yet."
                : "No changes have been published yet."
            }
          />

          <TablePagination
            component="div"
            count={data?.count ?? 0}
            page={Math.max(0, page - 1)}
            onPageChange={(_event, next) => {
              setPage(next + 1);
              setSelectedId(null);
            }}
            rowsPerPage={limit}
            rowsPerPageOptions={[20, 50, 100]}
            onRowsPerPageChange={(event) => {
              setLimit(Number(event.target.value));
              setPage(1);
            }}
            sx={{ borderTop: "1px solid var(--admin-border)" }}
          />
        </Panel>

        {/* Below lg there is no honest way to show two columns, and a
            full-width frame under the log pushes the entries off screen. */}
        <Box sx={{ display: { xs: "none", lg: "block" } }}>
          {previewPage ? (
            <SitePreview path={previewPage.previewPath} />
          ) : (
            <Panel>
              <Typography variant="body2" color="text.secondary">
                That text is part of the application interface rather than a
                public page, so there is nothing to show here.
              </Typography>
            </Panel>
          )}
        </Box>
      </Box>
    </Box>
  );
}
