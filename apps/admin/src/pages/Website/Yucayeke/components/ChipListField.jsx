import { useState } from "react";

import { Box, Button, Chip, TextField, Typography } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

/**
 * An editable list of short values, drawn as chips.
 *
 * A comma-separated text box would be smaller code and a worse control: "Cabo
 * Rojo, Guánica" is one typo away from becoming three municipalities, and
 * nothing on screen would say so. Chips make each entry a thing you can see
 * and delete.
 */
export default function ChipListField({
  label,
  helperText,
  values,
  placeholder,
  disabled = false,
  onChange,
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const entry = draft.trim();

    // Silently ignoring a duplicate rather than warning: adding "Ponce" twice
    // is a slip, not a decision worth interrupting anyone for.
    if (entry === "" || values.includes(entry)) {
      setDraft("");
      return;
    }

    onChange([...values, entry]);
    setDraft("");
  };

  const remove = (entry) => {
    onChange(values.filter((value) => value !== entry));
  };

  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, display: "block", mb: 0.25 }}
      >
        {label}
      </Typography>

      {helperText ? (
        <Typography
          variant="caption"
          sx={{ color: "var(--admin-muted)", display: "block", mb: 0.75 }}
        >
          {helperText}
        </Typography>
      ) : null}

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0.75,
          mb: values.length > 0 ? 1 : 0,
        }}
      >
        {values.map((value) => (
          <Chip
            key={value}
            label={value}
            size="small"
            onDelete={disabled ? undefined : () => remove(value)}
          />
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          size="small"
          fullWidth
          value={draft}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          // Enter adds an entry rather than submitting anything — this sits
          // inside a record editor with its own explicit save.
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />

        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          disabled={disabled || draft.trim() === ""}
          onClick={add}
        >
          Add
        </Button>
      </Box>
    </Box>
  );
}
