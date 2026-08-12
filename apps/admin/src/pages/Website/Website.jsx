import { useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  InputAdornment,
  List,
  ListItemButton,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import PublishIcon from "@mui/icons-material/Publish";

import { toast } from "react-toastify";

import PageHeader from "@components/PageHeader/PageHeader";
import Panel from "@components/Panel/Panel";
import SectionNav from "@components/SectionNav/SectionNav";

import useDebounceState from "@/hooks/useDebounceState";

import ContentGroup from "./components/ContentGroup";
import SitePreview from "./components/SitePreview";

import {
  useContentKeys,
  useDiscardContentDrafts,
  usePublishContent,
  useRevertContentKey,
  useSaveContentDraft,
} from "./hooks";

import { findPage, WEBSITE_PAGES } from "./pages.config";
import { WEBSITE_SECTION_ITEMS } from "./sections";

/**
 * The Website Studio's Pages tab.
 *
 * Copy for the public site, edited in both languages and published together.
 * Everything here is an override on top of what shipped in the code, so
 * "Restore original" is always available and the site keeps working even if
 * this whole surface is unreachable.
 */
export default function Website() {
  const [pageId, setPageId] = useState(WEBSITE_PAGES[0].id);
  const [search, setSearch] = useState("");
  const [openGroup, setOpenGroup] = useState(null);
  // Bumped on publish so the preview stops showing the previous wording.
  const [publishedAt, setPublishedAt] = useState(0);

  const debouncedSearch = useDebounceState(search, 250);

  const { data, isLoading, error, refetch } = useContentKeys();

  const saveDraft = useSaveContentDraft();
  const revert = useRevertContentKey();
  const publish = usePublishContent();
  const discard = useDiscardContentDrafts();

  const allKeys = useMemo(() => data?.data ?? [], [data]);

  /** How many unpublished edits each page is holding. */
  const pendingByPage = useMemo(() => {
    const counts = {};

    for (const key of allKeys) {
      if (!key.override?.draftEn && !key.override?.draftEs) continue;

      const page = WEBSITE_PAGES.find((candidate) =>
        candidate.namespaces.includes(key.namespace),
      );

      if (page) {
        counts[page.id] = (counts[page.id] ?? 0) + 1;
      }
    }

    return counts;
  }, [allKeys]);

  const pendingTotal = Object.values(pendingByPage).reduce(
    (sum, count) => sum + count,
    0,
  );

  const page = findPage(pageId);

  const fields = useMemo(() => {
    const needle = debouncedSearch.trim().toLowerCase();

    return allKeys
      .filter((key) => page.namespaces.includes(key.namespace))
      .filter((key) => {
        if (!needle) return true;

        return (
          key.keyPath.toLowerCase().includes(needle) ||
          key.defaultEn.toLowerCase().includes(needle) ||
          key.defaultEs.toLowerCase().includes(needle)
        );
      });
  }, [allKeys, page, debouncedSearch]);

  /**
   * Fields bucketed into the page's sections, in catalog order.
   */
  const groups = useMemo(() => {
    const buckets = new Map();

    for (const field of fields) {
      const key = field.group ?? "";

      if (!buckets.has(key)) {
        buckets.set(key, []);
      }

      buckets.get(key).push(field);
    }

    return [...buckets.entries()].map(([group, groupFields]) => ({
      group,
      fields: groupFields,
    }));
  }, [fields]);

  // A search is a hunt, so everything opens; otherwise the first section is
  // open and the rest wait to be asked for.
  const isSearching = debouncedSearch.trim().length > 0;

  const handleSave = async (input) => {
    await saveDraft.mutateAsync(input);
    await refetch();
  };

  const handleRevert = async (keyPath) => {
    try {
      await revert.mutateAsync(keyPath);
      toast.success("Original wording restored");
    } catch (requestError) {
      toast.error(
        requestError?.response?.data?.message ||
          "Could not restore the original",
      );
    }
  };

  const handlePublish = async () => {
    try {
      const result = await publish.mutateAsync();

      setPublishedAt(Date.now());

      toast.success(
        result.published === 1
          ? "1 change is now live"
          : `${result.published} changes are now live`,
      );

      if (result.skipped > 0) {
        toast.warn(
          `${result.skipped} change(s) were skipped — that text is no longer editable`,
        );
      }
    } catch (requestError) {
      toast.error(
        requestError?.response?.data?.message ||
          "Could not publish the changes",
      );
    }
  };

  const handleDiscard = async () => {
    if (
      !window.confirm(
        "Discard every unpublished change? The live site is not affected.",
      )
    ) {
      return;
    }

    await discard.mutateAsync();
    toast.success("Unpublished changes discarded");
  };

  const busy =
    saveDraft.isPending ||
    revert.isPending ||
    publish.isPending ||
    discard.isPending;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <PageHeader
        title="Website Studio"
        description="Edit the words on the public site. Changes go live only when you publish."
        action={
          <Box sx={{ display: "flex", gap: 1 }}>
            {pendingTotal > 0 ? (
              <Button variant="text" onClick={handleDiscard} disabled={busy}>
                Discard
              </Button>
            ) : null}

            <Button
              variant="contained"
              startIcon={<PublishIcon />}
              onClick={handlePublish}
              disabled={busy || pendingTotal === 0}
            >
              {pendingTotal === 0
                ? "Nothing to publish"
                : `Publish ${pendingTotal} change${pendingTotal === 1 ? "" : "s"}`}
            </Button>
          </Box>
        }
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
          Could not load the site copy.
        </Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: {
              xs: "1fr",
              md: "200px minmax(0, 1fr)",
              xl: "200px minmax(0, 1fr) minmax(0, 0.9fr)",
            },
            alignItems: "start",
          }}
        >
          <Panel padding="none">
            <List dense sx={{ py: 0.5 }}>
              {WEBSITE_PAGES.map((candidate) => (
                <ListItemButton
                  key={candidate.id}
                  selected={candidate.id === pageId}
                  onClick={() => {
                    setPageId(candidate.id);
                    setOpenGroup(null);
                  }}
                  sx={{ py: 0.75 }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {candidate.label}
                    </Typography>
                  </Box>

                  {pendingByPage[candidate.id] ? (
                    <Chip
                      size="small"
                      color="warning"
                      label={pendingByPage[candidate.id]}
                      sx={{ ml: 1 }}
                    />
                  ) : null}
                </ListItemButton>
              ))}
            </List>
          </Panel>

          <Panel>
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {page.label}
              </Typography>

              <Typography
                variant="caption"
                sx={{ color: "var(--admin-muted)" }}
              >
                {page.description}
              </Typography>
            </Box>

            <TextField
              size="small"
              fullWidth
              placeholder="Search this page's text…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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

            {isLoading ? (
              <Box sx={{ mt: 1.5 }}>
                {[0, 1, 2].map((n) => (
                  <Skeleton
                    key={n}
                    variant="rounded"
                    height={72}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            ) : fields.length === 0 ? (
              <Typography
                variant="body2"
                sx={{ mt: 3, textAlign: "center", color: "var(--admin-muted)" }}
              >
                {debouncedSearch
                  ? "No text on this page matches that search."
                  : "There is no editable text on this page yet."}
              </Typography>
            ) : (
              <Box sx={{ mt: 1 }}>
                {groups.map((entry, index) => (
                  <ContentGroup
                    key={entry.group || "general"}
                    group={entry.group}
                    fields={entry.fields}
                    expanded={
                      isSearching ||
                      (openGroup === null
                        ? index === 0
                        : openGroup === entry.group)
                    }
                    onToggle={() =>
                      setOpenGroup((current) =>
                        current === entry.group ? "" : entry.group,
                      )
                    }
                    saving={busy}
                    onSave={handleSave}
                    onRevert={handleRevert}
                  />
                ))}
              </Box>
            )}
          </Panel>

          {/* Below xl the preview would squeeze both columns; there it moves
              under the editor rather than fighting it for width. */}
          <Box sx={{ gridColumn: { xs: "1 / -1", xl: "auto" } }}>
            <SitePreview path={page.previewPath} reloadToken={publishedAt} />
          </Box>
        </Box>
      )}
    </Box>
  );
}
