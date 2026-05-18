import React from 'react';

import EventList from './components/EventList.jsx/EventList';

import { Link } from 'react-router-dom';

import {
    Box,
    Button,
    Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';

import styles from './events.module.css';

const Events = () => {
    return (
        <section className={styles.page}>
            <Box className={styles.header}>
                <Typography
                    variant="h4"
                    className={styles.title}
                >
                    Events
                </Typography>

                <Button
                    variant="contained"
                    component={Link}
                    to="/events/create"
                    startIcon={<AddIcon />}
                    className={styles.addButton}
                >
                    Add Event
                </Button>
            </Box>

            <EventList/>
        </section>
    );
};

export default Events;