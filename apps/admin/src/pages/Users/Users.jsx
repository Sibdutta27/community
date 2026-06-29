import React from 'react';
import UserList from './components/UserList/UserList';

import { Link } from 'react-router-dom';

import {
    Box,
    Button,
    Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';

import styles from './users.module.css';

const Users = () => {
    return (
        <section className={styles.page}>
            <Box className={styles.header}>
                <Typography
                    variant="h4"
                    className={styles.title}
                >
                    Users
                </Typography>

                <Button
                    variant="contained"
                    component={Link}
                    to="/users/create"
                    startIcon={<AddIcon />}
                    className={styles.addButton}
                >
                    Add User
                </Button>
            </Box>

            <UserList />
        </section>
    );
};

export default Users;