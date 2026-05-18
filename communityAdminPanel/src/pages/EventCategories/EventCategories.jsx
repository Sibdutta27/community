import React from 'react';

import EventCategoryList from './components/EventCategoryList.jsx/EventCategoryList';

import { Link } from 'react-router-dom';

import {
    Box,
    Button,
    Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';

import styles from './eventCategories.module.css';

const EventCategories = () => {
    return (
        <section className={styles.page}>
            <Box className={styles.header}>
                <Typography
                    variant="h4"
                    className={styles.title}
                >
                    Event Categories
                </Typography>

                <Button
                    variant="contained"
                    component={Link}
                    to="/event-categories/create"
                    startIcon={<AddIcon />}
                    className={styles.addButton}
                >
                    Add Event Category
                </Button>
            </Box>

            <EventCategoryList/>
        </section>
    );
};

export default EventCategories;