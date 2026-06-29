import { useEffect, useState } from 'react';

import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Box
} from '@mui/material';

import { formatWords } from '@/utils/formatWord.util';

/**
 * Category select component
 */
const CategorySelect = ({
    value: _value = '',
    categorys = [],
    placeholder = 'Select Category',
    onChange,
    hideAllCategoryOption,
    error,
}) => {

    const [value, setValue] = useState( _value || '');

    useEffect(() => {
        setValue(_value);
    }, [_value])

    return (
        <>
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
                    sx={{ minWidth: 180 }}
                    error={error}
                >
                    {
                        !hideAllCategoryOption &&
                        <MenuItem
                            key={'all'}
                            value={''}
                        >
                            {formatWords('All Category')}
                        </MenuItem>
                    }

                    {categorys.map((category) => (
                        <MenuItem
                            key={category.id}
                            value={category.id}
                        >
                            {formatWords(category.name)}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </>
    );
};

export default CategorySelect;