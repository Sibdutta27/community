// Premium LIGHT react-data-table-component styles — lives inside a white Panel.
export const customStyles = {
  table: {
    style: {
      backgroundColor: "transparent",
    },
  },
  headRow: {
    style: {
      backgroundColor: "transparent",
      color: "#5a6472",
      fontSize: "0.68rem",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      borderBottom: "1px solid #e2e6eb",
      minHeight: "32px",
    },
  },
  headCells: {
    style: {
      paddingLeft: "8px",
      paddingRight: "8px",
    },
  },
  // 36px rows: ~18 records visible in a 900px viewport instead of ~11.
  rows: {
    style: {
      backgroundColor: "transparent",
      color: "#141a22",
      fontSize: "0.82rem",
      minHeight: "36px",
      "&:not(:last-of-type)": {
        borderBottom: "1px solid #eef2f6",
      },
      "&:hover": {
        backgroundColor: "#f6f8fa",
        transition: "background-color 150ms ease",
      },
    },
  },
  cells: {
    style: {
      paddingLeft: "8px",
      paddingRight: "8px",
      paddingTop: "4px",
      paddingBottom: "4px",
    },
  },
  pagination: {
    style: {
      backgroundColor: "transparent",
      color: "#5a6472",
      borderTop: "1px solid #e2e6eb",
      fontSize: "0.78rem",
      minHeight: "40px",
      padding: "4px 2px 0",
    },
    pageButtonsStyle: {
      backgroundColor: "#ffffff",
      color: "#0a56a8",
      border: "1px solid #e2e6eb",
      borderRadius: "6px",
      padding: "3px 6px",
      margin: "0 2px",
      cursor: "pointer",
      fill: "#0a56a8",
      transition: "background-color 150ms ease",
      "&:hover:not(:disabled)": {
        backgroundColor: "#eef2f6",
      },
      "&:disabled": {
        color: "#9ca3af",
        fill: "#9ca3af",
        cursor: "not-allowed",
        backgroundColor: "#ffffff",
        borderColor: "#eef2f6",
      },
    },
  },
};
