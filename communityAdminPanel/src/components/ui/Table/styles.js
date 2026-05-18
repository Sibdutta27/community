export const customStyles = {
    table: {
        style: {
            backgroundColor: "transparent",
        },

    },
    headRow: {
        style: {
            backgroundColor: "#2d3748",
            color: "#d1d5db",
            fontSize: "14px",
            fontWeight: "600",
        },
    },
    rows: {
        style: {
            backgroundColor: "#1f2937",
            color: "#ffffff",
            // borderBottom: "1px solid #4b5563",
            "&:hover": {
                backgroundColor: "#374151",
            },
            "&:nth-child(odd)": {
                opacity: "0.8"
            },
        },
    },
    cells: {
        style: {
            padding: "8px",
        },
    },
    pagination: {
        style: {
            backgroundColor: "#1f2937",
            color: "#2d77e6",
            borderTop: "1px solid #4b556364",
            padding: "7px",
        },
        pageButtonsStyle: {
            backgroundColor: "#3b82f6", // Button background color
            color: "#ffffff", // Button text/icon color
            border: "none",
            borderRadius: "4px",
            padding: "6px 12px",
            margin: "0 4px",
            cursor: "pointer",
            fill: "#ffffff", // For SVG icons (e.g., Next/Previous arrows)
            "&:hover:not(:disabled)": {
                backgroundColor: "#2563eb", // Hover background color
            },
            "&:disabled": {
                backgroundColor: "#4b5563", // Disabled button background
                color: "#9ca3af", // Disabled button text/icon color
                fill: "#9ca3af", // Disabled button SVG icon color
                cursor: "not-allowed",
            },
        },
    },
}