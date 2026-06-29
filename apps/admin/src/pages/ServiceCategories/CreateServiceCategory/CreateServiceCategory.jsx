// pages/ServiceCategories/CreateServiceCategory/CreateServiceCategory.jsx

import { useForm } from 'react-hook-form';

import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';

import {
    Box,
    Button,
    Paper,
    TextField,
    Typography,
} from '@mui/material';

import { useMutation } from '@tanstack/react-query';

import { toast } from 'react-toastify';

import {
    createServiceCategory,
} from '@/api/serviceCat.api';

import styles from './createServiceCategory.module.css';

/**
 * Validation schema
 */
const createServiceCategorySchema = z.object({

    key: z
        .string()
        .min(
            2,
            'Key must be at least 2 characters',
        ),

    name: z
        .string()
        .min(
            2,
            'Name must be at least 2 characters',
        ),

    icon: z
        .string()
        .optional(),
});

const CreateServiceCategory = () => {

    /**
     * Form
     */
    const {
        register,
        handleSubmit,

        formState: {
            errors,
        },

        reset,

    } = useForm({

        resolver:
            zodResolver(
                createServiceCategorySchema,
            ),

        defaultValues: {
            key: '',
            name: '',
            icon: '',
        },
    });

    /**
     * Mutation
     */
    const {
        mutateAsync,
        isPending,
    } = useMutation({
        mutationFn: createServiceCategory,
    });

    /**
     * Submit
     */
    const onSubmit = async (data) => {

        try {

            await mutateAsync({
                ...data,

                icon:
                    data.icon || undefined,
            });

            toast.success(
                'Service category created successfully.',
            );

            reset();

        } catch (error) {

            const message =
                error.response?.data?.message
                || error.message
                || 'Failed to create service category';

            toast.error(message);
        }
    };

    return (
        <section className={styles.page}>

            <Typography
                variant="h4"
                className={styles.title}
            >
                Create Service Category
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

                        placeholder="health_services"

                        fullWidth

                        {...register('key')}

                        error={!!errors.key}

                        helperText={
                            errors.key?.message
                        }
                    />

                    {/* NAME */}
                    <TextField
                        label="Name"

                        placeholder="Health Services"

                        fullWidth

                        {...register('name')}

                        error={!!errors.name}

                        helperText={
                            errors.name?.message
                        }
                    />

                    {/* ICON */}
                    <TextField
                        label="Icon"

                        placeholder="MedicalServices"

                        fullWidth

                        {...register('icon')}

                        error={!!errors.icon}

                        helperText={
                            errors.icon?.message
                            || 'Optional icon name or URL'
                        }
                    />

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
                                : 'Create Service Category'
                        }

                    </Button>

                </Box>

            </Paper>

        </section>
    );
};

export default CreateServiceCategory;