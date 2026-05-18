
import { useEffect } from 'react';

import { useParams } from 'react-router-dom';

import {
    Controller,
    useForm,
} from 'react-hook-form';

import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';

import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from '@mui/material';

import { toast } from 'react-toastify';

import {
    useCulturalConnection,
    useUpdateCulturalConnection,
} from './hooks';

import styles from './editCulturalConnection.module.css';

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
const schema = z.object({

    description: z
        .string()
        .min(
            5,
            'Description must be at least 5 characters',
        ),

    active: z.boolean(),
});

const EditCulturalConnection = () => {

    const { id } = useParams();

    /**
     * Fetch cultural connection
     */
    const {
        data: connectionData,
    } = useCulturalConnection(id);

    /**
     * Update mutation
     */
    const {
        mutateAsync: updateCulturalConnectionMut,
        isPending  : updatingConnection,
    } = useUpdateCulturalConnection();

    /**
     * Form
     */
    const {
        control,
        handleSubmit,
        reset,

        formState: {
            errors,
        },

    } = useForm({

        resolver:
            zodResolver(schema),

        defaultValues: {
            description: '',
            active: true,
        },
    });

    /**
     * Reset form
     */
    useEffect(() => {

        if (connectionData) {

            reset({
                description: connectionData.description || '',
                active     : connectionData.active ?? true,
            });
        }

    }, [
        connectionData,
        reset,
    ]);

    /**
     * Submit
     */
    const onSubmit = async (data) => {

        try {

            await updateCulturalConnectionMut({
                id,

                data: {
                    description: data.description,
                    active     : data.active,
                },
            });

            toast.success(
                'Cultural connection updated successfully',
            );

        } catch (error) {

            let message =
                error.response?.data?.message
                || error.message
                || 'Failed to update cultural connection';

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
                Edit Cultural Connection
            </Typography>

            <Paper className={styles.formContainer}>

                <Box
                    component="form"

                    onSubmit={
                        handleSubmit(onSubmit)
                    }

                    className={styles.form}
                >

                    {/* KEY */}
                    <TextField
                        label="Key"

                        value={
                            connectionData?.key || ''
                        }

                        fullWidth

                        disabled
                    />

                    {/* DESCRIPTION */}
                    <Controller
                        name="description"

                        control={control}

                        render={({ field }) => (
                            <TextField
                                {...field}

                                label="Description"

                                multiline

                                minRows={4}

                                fullWidth

                                error={
                                    !!errors.description
                                }

                                helperText={
                                    errors.description?.message
                                }
                            />
                        )}
                    />

                    {/* STATUS */}
                    <Controller
                        name="active"

                        control={control}

                        render={({ field }) => (

                            <FormControl
                                fullWidth

                                error={
                                    !!errors.active
                                }
                            >

                                <InputLabel>
                                    Status
                                </InputLabel>

                                <Select
                                    value={
                                        field.value
                                            ? 'true'
                                            : 'false'
                                    }

                                    label="Status"

                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value === 'true',
                                        )
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

                                </Select>

                                <FormHelperText>
                                    {errors.active?.message}
                                </FormHelperText>

                            </FormControl>
                        )}
                    />

                    <Button
                        type="submit"

                        variant="contained"

                        disabled={
                            updatingConnection
                        }

                        className={
                            styles.submitButton
                        }
                    >

                        {
                            updatingConnection
                                ? 'Updating...'
                                : 'Update Cultural Connection'
                        }

                    </Button>

                </Box>

            </Paper>

        </section>
    );
};

export default EditCulturalConnection;