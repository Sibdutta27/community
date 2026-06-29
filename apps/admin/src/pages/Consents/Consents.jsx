import React from 'react';
import ConsentList from './components/ConsentList/ConsentList';

import { Link } from 'react-router-dom';

import {
    Box,
    Button,
    Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';

import styles from './consents.module.css';

const Consents = () => {
    return (
        <section className={styles.page}>
            <Box className={styles.header}>
                <Typography
                    variant="h4"
                    className={styles.title}
                >
                    Consents
                </Typography>

                <Button
                    variant="contained"
                    component={Link}
                    to="/consents/create"
                    startIcon={<AddIcon />}
                    className={styles.addButton}
                >
                    Add Consent
                </Button>
            </Box>

            <ConsentList />
        </section>
    );
};

export default Consents;