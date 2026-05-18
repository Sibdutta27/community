
import React, { forwardRef } from "react";

const Checkbox = forwardRef(({ onClick, label, id, checked, disabled, className, ...rest }, ref) => {
    return (
        <label
            htmlFor={id}
            className={`custom-checkbox-container ${disabled ? "custom-checkbox-disabled" : ""} ${className || ""}`}
        >
            <input
                id={id}
                ref={ref}
                type="checkbox"
                className="custom-checkbox-input"
                onClick={onClick}
                checked={checked}
                disabled={disabled}
                {...rest}
            />

            <span className="custom-checkbox">
                <span className="custom-checkbox-box" aria-hidden>
                    <svg className="custom-checkbox-check" viewBox="0 0 24 24" aria-hidden>
                        <polyline points="20 6 9 17 4 12" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            </span>

            {label && (
                <span className="custom-checkbox-label">{label}</span>
            )}
        </label>
    );
});

export default Checkbox;

