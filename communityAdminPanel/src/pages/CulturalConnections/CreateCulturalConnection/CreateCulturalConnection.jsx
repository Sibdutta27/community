// pages/CulturalConnections/CreateCulturalConnection/CreateCulturalConnection.jsx

import { useForm } from 'react-hook-form';

import { z } from 'zod';

import { zodResolver }
    from '@hookform/resolvers/zod';

import {
    Box,
    Button,
    MenuItem,
    Paper,
    TextField,
    Typography,
} from '@mui/material';

import { useMutation }
    from '@tanstack/react-query';

import { toast }
    from 'react-toastify';

import {
    createCulturalConnection,
} from '@/api/culturalConnection.api';

import styles
    from './createCulturalConnection.module.css';

/**
 * Status options
 */
const ACTIVE_OPTIONS = [
    {
        label: 'Active',
        value: true,
    },

    {
        label: 'Not Active',
        value: false,
    },
];

/**
 * Validation schema
 */
const createCulturalConnectionSchema = z.object({

    key: z
        .string()
        .min(2, 'Key must be at least 2 characters'),

    description: z
        .string()
        .min(
            5,
            'Description must be at least 5 characters',
        ),

    active: z.boolean(),
});

const CreateCulturalConnection = () => {

    /**
     * React hook form
     */
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm({

        resolver:
            zodResolver(
                createCulturalConnectionSchema,
            ),

        defaultValues: {
            key: '',
            description: '',
            active: true,
        },
    });

    /**
     * Watch active value
     */
    const activeValue = watch('active');

    /**
     * Create mutation
     */
    const {
        mutateAsync,
        isPending,
    } = useMutation({
        mutationFn:
            createCulturalConnection,
    });

    /**
     * Handle submit
     */
    const onSubmit = async (data) => {

        try {

            await mutateAsync(data);

            toast.success(
                'Cultural connection created successfully.',
            );

            reset();

        } catch (error) {

            let message =
                error.response?.data?.message
                || error.message
                || 'Failed to create cultural connection';

            if ( Array.isArray(message) ) 
                message = message.join(', ')

            toast.error(message);
        }
    };

    return (
        <section className={styles.page}>

            <Typography
                variant="h4"
                className={styles.title}
            >
                Create Cultural Connection
            </Typography>

            <Paper className={styles.formContainer}>

                <Box
                    component="form"

                    onSubmit={
                        handleSubmit(onSubmit)
                    }

                    className={styles.form}
                >

                    <TextField
                        label="Key"

                        placeholder="traditional_food_preparation"

                        fullWidth

                        {...register('key')}

                        error={!!errors.key}

                        helperText={
                            errors.key?.message
                        }
                    />

                    <TextField
                        label="Description"

                        multiline

                        minRows={4}

                        fullWidth

                        {...register('description')}

                        error={
                            !!errors.description
                        }

                        helperText={
                            errors.description?.message
                        }
                    />

                    <TextField
                        select

                        label="Status"

                        fullWidth

                        value={activeValue ? 'true' : 'false'}

                        onChange={(e) =>
                            setValue(
                                'active',
                                e.target.value === 'true',
                            )
                        }

                        error={!!errors.active}

                        helperText={
                            errors.active?.message
                        }
                    >

                        {
                            ACTIVE_OPTIONS.map((item) => (
                                <MenuItem
                                    key={item.label}

                                    value={
                                        item.value.toString()
                                    }
                                >
                                    {item.label}
                                </MenuItem>
                            ))
                        }

                    </TextField>

                    <Button
                        type="submit"

                        variant="contained"

                        disabled={isPending}

                        className={
                            styles.submitButton
                        }
                    >

                        {
                            isPending
                                ? 'Creating...'
                                : 'Create Cultural Connection'
                        }

                    </Button>

                </Box>

            </Paper>

        </section>
    );
};

export default CreateCulturalConnection;