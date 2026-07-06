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
            fontSize: "0.72rem",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            borderBottom: "1px solid #e2e6eb",
            minHeight: "48px",
        },
    },
    headCells: {
        style: {
            paddingLeft: "12px",
            paddingRight: "12px",
        },
    },
    rows: {
        style: {
            backgroundColor: "transparent",
            color: "#141a22",
            fontSize: "0.9rem",
            minHeight: "56px",
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
            paddingLeft: "12px",
            paddingRight: "12px",
            paddingTop: "10px",
            paddingBottom: "10px",
        },
    },
    pagination: {
        style: {
            backgroundColor: "transparent",
            color: "#5a6472",
            borderTop: "1px solid #e2e6eb",
            fontSize: "0.85rem",
            padding: "10px 4px 2px",
        },
        pageButtonsStyle: {
            backgroundColor: "#ffffff",
            color: "#0a56a8",
            border: "1px solid #e2e6eb",
            borderRadius: "8px",
            padding: "6px 10px",
            margin: "0 3px",
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
