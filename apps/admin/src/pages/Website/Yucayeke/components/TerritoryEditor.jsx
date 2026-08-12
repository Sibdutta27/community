import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SaveIcon from "@mui/icons-material/Save";
import UndoIcon from "@mui/icons-material/Undo";

import { Facts } from "@components/RecordFields/RecordFields";

import {
  buildSavePayload,
  effectiveValues,
  TERRITORY_STATUS_OPTIONS,
} from "../territory.util";

import ChipListField from "./ChipListField";
import LockedFact from "./LockedFact";

/**
 * The record editor for one yukayeke.
 *
 * Split down the middle by who owns the value. The five editable fields are
 * editorial judgements the Nation owns. Everything below the divider is a fact
 * the code owns — a join key, a register entry, or a superseded spelling that
 * has to keep resolving — and is drawn read-only with the reason attached.
 *
 * Saves are explicit and whole-record, unlike the Pages tab's save-on-blur:
 * these five fields describe one thing and are read together, and there is no
 * publish queue behind them to catch a half-finished edit.
 */
export default function TerritoryEditor({ entry, saving, onSave, onRevert }) {
  const effective = useMemo(() => effectiveValues(entry), [entry]);

  const [form, setForm] = useState(() => toForm(effective));
  const [showLegacy, setShowLegacy] = useState(false);

  // Re-seed when a different territory is selected, or when the server value
  // changes underneath us after a save or a restore.
  useEffect(() => {
    setForm(toForm(effective));
    setShowLegacy(false);
  }, [entry.slug, effective]);

  const isOverridden = Boolean(entry.override);

  const set = (field) => (value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSave = () => {
    const { payload, overridesAnything } = buildSavePayload(form, entry.base);

    onSave({ slug: entry.slug, payload, overridesAnything });
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            {effective.displayName}
          </Typography>

          <Typography
            variant="caption"
            sx={{ color: "var(--admin-muted)", display: "block" }}
          >
            Saved changes appear on the public site right away.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
          {isOverridden ? (
            <Button
              size="small"
              variant="text"
              startIcon={<UndoIcon />}
              disabled={saving}
              onClick={() => onRevert(entry.slug)}
            >
              Restore original
            </Button>
          ) : null}

          <Button
            size="small"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={saving}
            onClick={handleSave}
          >
            Save changes
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          mt: 2,
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        }}
      >
        <TextField
          label="Name shown on the site"
          size="small"
          fullWidth
          value={form.displayName}
          disabled={saving}
          onChange={(event) => set("displayName")(event.target.value)}
          helperText={`Leave empty to use the name in the code — “${entry.base.displayName}”.`}
        />

        <TextField
          label="Cacique"
          size="small"
          fullWidth
          value={form.cacique}
          disabled={saving}
          onChange={(event) => set("cacique")(event.target.value)}
          helperText={
            entry.base.cacique
              ? `Leave empty to use “${entry.base.cacique}”.`
              : "The code records no cacique for this yukayeke."
          }
        />

        <TextField
          label="Status"
          size="small"
          select
          fullWidth
          value={form.status}
          disabled={saving}
          onChange={(event) => set("status")(event.target.value)}
          helperText="Drives the badge and the provenance note on the site."
        >
          {TERRITORY_STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <Box />

        <ChipListField
          label="Also known as — shown publicly"
          helperText="Alternate spellings, printed under the name on the yukayeke's page. Clearing every entry restores the ones in the code."
          values={form.altNames}
          placeholder="e.g. Aimako"
          disabled={saving}
          onChange={set("altNames")}
        />

        <ChipListField
          label="Present-day municipalities"
          helperText="Listed on the map panel and the reading page. Clearing every entry restores the ones in the code."
          values={form.municipalities}
          placeholder="e.g. Aguadilla"
          disabled={saving}
          onChange={set("municipalities")}
        />
      </Box>

      <Divider sx={{ my: 2.5 }} />

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
        <LockOutlinedIcon
          sx={{ fontSize: "0.95rem", color: "text.secondary" }}
        />
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          Set in the code
        </Typography>
      </Box>

      <Facts columns={2}>
        <LockedFact
          label="Identifier"
          value={entry.slug}
          reason={`The address of the page: /yucayeke/${entry.slug}. Changing it would break every link and bookmark.`}
        />

        <LockedFact
          label="Map boundary"
          value={
            <Chip
              size="small"
              variant="outlined"
              color={entry.geometryKey ? "primary" : "default"}
              label={entry.geometryKey ? "Mapped" : "Not yet mapped"}
            />
          }
          reason={
            entry.geometryKey
              ? "This yukayeke has a boundary on the map, drawn from the surveyed territory data."
              : "No boundary has been delivered yet, so this yukayeke appears in the list but not on the map."
          }
        />

        <LockedFact
          label="Legal name"
          value={entry.legalName}
          reason="From the Nation's official register of yukayeke names."
        />

        <LockedFact
          label="Enrollment values"
          value={entry.apiNames.join(" · ")}
          reason="The exact wording members chose on their enrollment form. Members are matched to this yukayeke by these."
        />
      </Facts>

      <Box sx={{ mt: 1.5 }}>
        <Button
          size="small"
          variant="text"
          startIcon={<LockOutlinedIcon />}
          endIcon={showLegacy ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setShowLegacy((current) => !current)}
        >
          Older spellings ({entry.legacyNames.length})
        </Button>

        <Collapse in={showLegacy}>
          <Alert severity="info" variant="outlined" sx={{ mt: 1 }}>
            <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
              Spellings this yukayeke used to be recorded under. They are kept
              only so a member who enrolled under one is still matched to this
              yukayeke — they are <strong>never shown on the site</strong>, and
              they cannot be edited. To publish an alternate spelling, add it to
              “Also known as” above instead.
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {entry.legacyNames.length === 0 ? (
                <Typography
                  variant="caption"
                  sx={{ color: "var(--admin-muted)" }}
                >
                  None recorded.
                </Typography>
              ) : (
                entry.legacyNames.map((name) => (
                  <Chip
                    key={name}
                    size="small"
                    variant="outlined"
                    label={name}
                  />
                ))
              )}
            </Box>
          </Alert>
        </Collapse>
      </Box>
    </Box>
  );
}

function toForm(effective) {
  return {
    displayName: effective.displayName ?? "",
    cacique: effective.cacique ?? "",
    altNames: [...(effective.altNames ?? [])],
    municipalities: [...(effective.municipalities ?? [])],
    status: effective.status,
  };
}
