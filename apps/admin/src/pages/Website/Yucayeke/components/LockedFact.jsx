import { Box } from "@mui/material";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { Fact } from "@components/RecordFields/RecordFields";

/**
 * One fact the Studio cannot change, drawn as a record field rather than a
 * disabled input.
 *
 * The distinction is the whole point. A greyed-out text box says "temporarily
 * unavailable — ask someone" and invites a support ticket. A record field with
 * a lock and a reason says "this is a fact about the yukayeke", which is true:
 * these values are join keys and register entries, and editing them would
 * break a lookup rather than change a label.
 */
export default function LockedFact({ label, value, reason }) {
  return (
    <Fact
      label={label}
      icon={<LockOutlinedIcon />}
      value={
        <>
          {value || "—"}

          <Box
            component="span"
            sx={{
              display: "block",
              mt: 0.25,
              fontSize: "0.68rem",
              fontWeight: 400,
              lineHeight: 1.35,
              color: "text.secondary",
            }}
          >
            {reason}
          </Box>
        </>
      }
    />
  );
}
