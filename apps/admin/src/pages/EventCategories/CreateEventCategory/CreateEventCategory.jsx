// pages/EventCategories/CreateEventCategory/CreateEventCategory.jsx

import { useForm } from 'react-hook-form';

import { z }
    from 'zod';

import { zodResolver }
    from '@hookform/resolvers/zod';

import {
    Box,
    Button,
    Paper,
    TextField,
    Typography,
} from '@mui/material';

import { useMutation }
    from '@tanstack/react-query';

import { toast }
    from 'react-toastify';

import {
    createEventCategory,
} from '@/api/eventCat.api';

import styles
    from './createEventCategory.module.css';

/**
 * Validation schema
 */
const createEventCategorySchema = z.object({

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

    description: z
        .string()
        .optional(),

    icon: z
        .string()
        .optional(),
});

const CreateEventCategory = () => {

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
                createEventCategorySchema,
            ),

        defaultValues: {

            key: '',
            name: '',

            description: '',
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
        mutationFn:
            createEventCategory,
    });

    /**
     * Submit
     */
    const onSubmit = async (data) => {

        try {

            await mutateAsync({

                ...data,

                description:
                    data.description || undefined,

                icon:
                    data.icon || undefined,
            });

            toast.success(
                'Event category created successfully.',
            );

            reset();

        } catch (error) {

            let message =
                error.response?.data?.message
                || error.message
                || 'Failed to create event category';

            if ( Array.isArray(message) ) {
                message = message.join(', ');
            }

            toast.error(message);
        }
    };

    return (
        <section className={styles.page}>

            <Typography
                variant="h4"
                className={styles.title}
            >
                Create Event Category
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

                        placeholder="community_gathering"

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

                        placeholder="Community Gathering"

                        fullWidth

                        {...register('name')}

                        error={!!errors.name}

                        helperText={
                            errors.name?.message
                        }
                    />

                    {/* DESCRIPTION */}
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
                            || 'Optional description'
                        }
                    />

                    {/* ICON */}
                    <TextField
                        label="Icon"

                        placeholder="Event"

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
                                : 'Create Event Category'
                        }

                    </Button>

                </Box>

            </Paper>

        </section>
    );
};

export default CreateEventCategory;