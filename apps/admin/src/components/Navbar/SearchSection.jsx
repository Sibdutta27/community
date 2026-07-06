import React from 'react'
import {
    Box,
    InputBase,
} from '@mui/material';

import {
  Search,
} from '@mui/icons-material';

const SearchSection = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',

                background: 'var(--admin-surface-muted)',

                border: '1px solid var(--admin-border)',

                borderRadius: 3,

                px: 2,
                py: 1,

                width: 300,
            }}
        >
            <Search
                sx={{
                    color: 'var(--admin-muted)',
                    mr: 1,
                }}
            />

            <InputBase
                placeholder="Search..."
                sx={{
                    color: 'var(--admin-ink)',
                    width: '100%',

                    '& input::placeholder': {
                        color: 'var(--admin-muted)',
                        opacity: 1,
                    },
                }}
            />
        </Box>
    )
}

export default SearchSection