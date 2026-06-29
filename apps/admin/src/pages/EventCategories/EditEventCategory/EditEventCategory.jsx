// pages/EventCategories/EditEventCategory/EditEventCategory.jsx

import { useEffect }
    from 'react';

import { useParams }
    from 'react-router-dom';

import {
    Controller,
    useForm,
} from 'react-hook-form';

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

import { toast }
    from 'react-toastify';

import {
    useEventCategory,
    useUpdateEventCategory,
} from './hooks';

import styles
    from './editEventCategory.module.css';

/**
 * Validation schema
 */
const schema = z.object({

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

const EditEventCategory = () => {

    const { id } = useParams();

    /**
     * Fetch category
     */
    const {
        data: categoryData,
    } = useEventCategory(id);

    /**
     * Update mutation
     */
    const {
        mutateAsync:
            updateEventCategoryMut,

        isPending:
            updatingCategory,

    } = useUpdateEventCategory();

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

            name: '',

            description: '',
            icon: '',
        },
    });

    /**
     * Reset form
     */
    useEffect(() => {

        if (categoryData) {

            reset({

                name:
                    categoryData.name || '',

                description:
                    categoryData.description || '',

                icon:
                    categoryData.icon || '',
            });
        }

    }, [
        categoryData,
        reset,
    ]);

    /**
     * Submit
     */
    const onSubmit = async (data) => {

        try {

            await updateEventCategoryMut({

                id,

                data: {

                    name:
                        data.name,

                    description:
                        data.description || undefined,

                    icon:
                        data.icon || undefined,
                },
            });

            toast.success(
                'Event category updated successfully',
            );

        } catch (error) {

            let message =
                error.response?.data?.message
                || error.message
                || 'Failed to update event category';

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
                Edit Event Category
            </Typography>

            <Paper
                className={styles.formContainer}
            >

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
                            categoryData?.key || ''
                        }

                        fullWidth

                        disabled
                    />

                    {/* NAME */}
                    <Controller
                        name="name"

                        control={control}

                        render={({ field }) => (
                            <TextField
                                {...field}

                                label="Name"

                                fullWidth

                                error={
                                    !!errors.name
                                }

                                helperText={
                                    errors.name?.message
                                }
                            />
                        )}
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
                                    || 'Optional description'
                                }
                            />
                        )}
                    />

                    {/* ICON */}
                    <Controller
                        name="icon"

                        control={control}

                        render={({ field }) => (
                            <TextField
                                {...field}

                                label="Icon"

                                placeholder="Event"

                                fullWidth

                                error={
                                    !!errors.icon
                                }

                                helperText={
                                    errors.icon?.message
                                    || 'Optional icon name or URL'
                                }
                            />
                        )}
                    />

                    <Button
                        type="submit"

                        variant="contained"

                        disabled={
                            updatingCategory
                        }

                        className={
                            styles.submitButton
                        }
                    >

                        {
                            updatingCategory
                                ? 'Updating...'
                                : 'Update Event Category'
                        }

                    </Button>

                </Box>

            </Paper>

        </section>
    );
};

export default EditEventCategory;