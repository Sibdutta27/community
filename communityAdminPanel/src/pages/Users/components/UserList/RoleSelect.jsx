import { useState } from 'react';

import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from '@mui/material';

import { formatWords } from '@/utils/formatWord.util';

/**
 * Role select component
 */
const RoleSelect = ({
    roles = [],
    placeholder = 'Select Role',
    onChange,
}) => {

    const [ value, setValue ] = useState('');

    return (
        <FormControl fullWidth size="small">
            <InputLabel>
                {placeholder}
            </InputLabel>

            <Select
                label={placeholder}
                value={value}
                onChange={(event) => {
                    setValue(event.target.value);
                    onChange(event.target.value);
                }}
                sx={{minWidth: 180}}
            >
                {roles.map((role) => (
                    <MenuItem
                        key={role}
                        value={role}
                    >
                        {formatWords(role)}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default RoleSelect;