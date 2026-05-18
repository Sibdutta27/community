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

                background: 'rgba(255, 255, 255, 0.5)',

                border: '1px solid rgba(255,255,255,0.08)',

                borderRadius: 3,

                px: 2,
                py: 1,

                width: 300,
            }}
        >
            <Search
                sx={{
                    color: '#9ca3af',
                    mr: 1,
                }}
            />

            <InputBase
                placeholder="Search..."
                sx={{
                    color: '#fff',
                    width: '100%',

                    '& input::placeholder': {
                        color: '#9ca3af',
                        opacity: 1,
                    },
                }}
            />
        </Box>
    )
}

export default SearchSection