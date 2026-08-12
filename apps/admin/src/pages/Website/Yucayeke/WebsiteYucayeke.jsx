import { useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  List,
  ListItemButton,
  Skeleton,
  Typography,
} from "@mui/material";

import { toast } from "react-toastify";

import PageHeader from "@components/PageHeader/PageHeader";
import Panel from "@components/Panel/Panel";
import SectionNav from "@components/SectionNav/SectionNav";

import { WEBSITE_SECTION_ITEMS } from "../sections";

import TerritoryEditor from "./components/TerritoryEditor";
import {
  useRevertTerritoryOverride,
  useSaveTerritoryOverride,
  useTerritories,
} from "./hooks";
import { editedFields, effectiveValues } from "./territory.util";

/**
 * The Website Studio's Yukayeke tab.
 *
 * The 21 ancestral territories, with the handful of fields the Nation owns
 * editable and everything else shown as the record it is. Same shape as the
 * Pages tab underneath: what ships in the code is the source of truth, this
 * screen stores a thin layer over it, and "Restore original" is a delete — so
 * getting back to the shipped values cannot itself go wrong.
 *
 * The territory descriptions are NOT here. They are site copy like any other
 * and are edited on the Pages tab, where they publish with everything else.
 */
export default function WebsiteYucayeke() {
  const [selectedSlug, setSelectedSlug] = useState(null);

  const { data, isLoading, error, refetch } = useTerritories();

  const save = useSaveTerritoryOverride();
  const revert = useRevertTerritoryOverride();

  const territories = useMemo(() => data?.data ?? [], [data]);

  const editedCount = useMemo(
    () => territories.filter((entry) => editedFields(entry).length > 0).length,
    [territories],
  );

  const selected =
    territories.find((entry) => entry.slug === selectedSlug) ??
    territories[0] ??
    null;

  const busy = save.isPending || revert.isPending;

  const handleSave = async ({ slug, payload, overridesAnything }) => {
    try {
      // Nothing differs from the code any more, so the right state is no
      // stored row at all — an all-empty override is a row that shadows
      // nothing but would still outlive a later correction in the code.
      if (!overridesAnything) {
        const entry = territories.find((candidate) => candidate.slug === slug);

        if (!entry?.override) {
          toast.info("Nothing to save — these are the original values");
          return;
        }

        await revert.mutateAsync(slug);
        toast.success("Original values restored");
        return;
      }

      await save.mutateAsync({ slug, ...payload });
      toast.success("Saved — the change is live on the site");
    } catch (requestError) {
      toast.error(
        requestError?.response?.data?.message || "Could not save the changes",
      );
    }
  };

  const handleRevert = async (slug) => {
    if (
      !window.confirm(
        "Restore every original value for this yukayeke? The site updates right away.",
      )
    ) {
      return;
    }

    try {
      await revert.mutateAsync(slug);
      toast.success("Original values restored");
    } catch (requestError) {
      toast.error(
        requestError?.response?.data?.message ||
          "Could not restore the original values",
      );
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <PageHeader
        title="Website Studio"
        description="The yukayeke territories as the public site shows them. Changes here go live immediately."
        action={
          editedCount > 0 ? (
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={`${editedCount} yukayeke${editedCount === 1 ? "" : "s"} edited`}
            />
          ) : null
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
          Could not load the yukayeke territories.
        </Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr", md: "240px minmax(0, 1fr)" },
            alignItems: "start",
          }}
        >
          <Panel padding="none">
            {isLoading ? (
              <Box sx={{ p: 1 }}>
                {[0, 1, 2, 3, 4].map((n) => (
                  <Skeleton
                    key={n}
                    variant="rounded"
                    height={40}
                    sx={{ mb: 0.75 }}
                  />
                ))}
              </Box>
            ) : (
              <List
                dense
                sx={{ py: 0.5, maxHeight: "70vh", overflowY: "auto" }}
              >
                {territories.map((entry) => {
                  const effective = effectiveValues(entry);
                  const edited = editedFields(entry);

                  return (
                    <ListItemButton
                      key={entry.slug}
                      selected={entry.slug === selected?.slug}
                      onClick={() => setSelectedSlug(entry.slug)}
                      sx={{ py: 0.75 }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {effective.displayName}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{ color: "var(--admin-muted)" }}
                          noWrap
                          display="block"
                        >
                          {effective.cacique ?? "No cacique recorded"}
                        </Typography>
                      </Box>

                      {edited.length > 0 ? (
                        <Chip
                          size="small"
                          color="primary"
                          variant="outlined"
                          label="Edited"
                          sx={{ ml: 1 }}
                        />
                      ) : null}
                    </ListItemButton>
                  );
                })}
              </List>
            )}
          </Panel>

          <Panel>
            {isLoading ? (
              <Skeleton variant="rounded" height={360} />
            ) : selected ? (
              <TerritoryEditor
                key={selected.slug}
                entry={selected}
                saving={busy}
                onSave={handleSave}
                onRevert={handleRevert}
              />
            ) : (
              <Typography
                variant="body2"
                sx={{ textAlign: "center", color: "var(--admin-muted)", py: 4 }}
              >
                No yukayeke territories to show.
              </Typography>
            )}
          </Panel>
        </Box>
      )}
    </Box>
  );
}
