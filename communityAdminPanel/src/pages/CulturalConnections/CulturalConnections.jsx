import React from 'react';
import CulturalConnectionList from './components/CulturalConnectionList/CulturalConnectionList';

import { Link } from 'react-router-dom';

import {
    Box,
    Button,
    Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';

import styles from './culturalConnections.module.css';

const CulturalConnections = () => {
    return (
        <section className={styles.page}>
            <Box className={styles.header}>
                <Typography
                    variant="h4"
                    className={styles.title}
                >
                    CulturalConnections
                </Typography>

                <Button
                    variant="contained"
                    component={Link}
                    to="/cultural-connections/create"
                    startIcon={<AddIcon />}
                    className={styles.addButton}
                >
                    Add Cultural Connection
                </Button>
            </Box>

            <CulturalConnectionList />
        </section>
    );
};

export default CulturalConnections;