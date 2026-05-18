import React from 'react';

import ServiceCategoryList from './components/ServiceCategoryList.jsx/ServiceCategoryList';

import { Link } from 'react-router-dom';

import {
    Box,
    Button,
    Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';

import styles from './serviceCategories.module.css';

const ServiceCategories = () => {
    return (
        <section className={styles.page}>
            <Box className={styles.header}>
                <Typography
                    variant="h4"
                    className={styles.title}
                >
                    Service Categories
                </Typography>

                <Button
                    variant="contained"
                    component={Link}
                    to="/service-categories/create"
                    startIcon={<AddIcon />}
                    className={styles.addButton}
                >
                    Add Service Category
                </Button>
            </Box>

            <ServiceCategoryList/>
        </section>
    );
};

export default ServiceCategories;