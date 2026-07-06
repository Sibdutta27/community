import React from 'react'
import {
    Typography,
    Box,
    Avatar,
    Skeleton,
} from '@mui/material';

import { useAccount } from './hooks/useAccount';

const UserSectionSkeleton = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,

                '& .MuiSkeleton-root': {
                    bgcolor: 'var(--admin-surface-muted)',
                },
            }}
        >
            {/* Avatar Skeleton */}
            <Skeleton
                variant="circular"
                width={42}
                height={42}
            />

            {/* Text Skeleton */}
            <Box>
                <Skeleton
                    variant="text"
                    width={100}
                    height={24}
                />

                <Skeleton
                    variant="text"
                    width={80}
                    height={18}
                />
            </Box>
        </Box>
    );
};


const UserSection = () => {

    const {
        data,
        isLoading,
        isError,
        error,
    } = useAccount();

    if (isLoading) {
        return <UserSectionSkeleton />;
    }

    if (isError) {
        return (
            <Typography
                variant="body2"
                sx={{
                    color: 'var(--admin-danger)',
                    fontWeight: 600,
                }}
            >
                Error loading user
            </Typography>
        );
    }

    const { name, role, profilePicture } = data.user;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
            }}
        >
            {
                profilePicture ? (
                    <Avatar
                        sx={{
                            width: 42,
                            height: 42,
                        }}
                    >
                        <img src={profilePicture} alt={name} />
                    </Avatar>
                ) : (
                    <Avatar
                        sx={{
                            bgcolor: '#0a56a8',
                            width: 42,
                            height: 42,
                            fontWeight: 700,
                        }}
                    >
                        {name.charAt(0)}
                    </Avatar>
                )
            }

            <Box>
                <Typography
                    variant="body2"
                    sx={{
                        color: 'var(--admin-ink)',
                        fontWeight: 600,
                    }}
                >
                    {name}
                </Typography>

                <Typography
                    variant="caption"
                    sx={{
                        color: 'var(--admin-muted)',
                    }}
                >
                    {role === 'ADMIN' ? 'Administrator' : 'User'}
                </Typography>
            </Box>
        </Box>
    )
}

export default UserSection;