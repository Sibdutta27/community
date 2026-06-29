import React from 'react';

import ServiceList from './components/ServiceList/ServiceList';

import { Link } from 'react-router-dom';

import {
    Box,
    Button,
    Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';

import styles from './services.module.css';

const Services = () => {
    return (
        <section className={styles.page}>
            <Box className={styles.header}>
                <Typography
                    variant="h4"
                    className={styles.title}
                >
                    Services
                </Typography>

                <Button
                    variant="contained"
                    component={Link}
                    to="/services/create"
                    startIcon={<AddIcon />}
                    className={styles.addButton}
                >
                    Add Service
                </Button>
            </Box>

            <ServiceList/>
        </section>
    );
};

export default Services;