// pages/ServiceCategories/EditServiceCategory/EditServiceCategory.jsx

import { useEffect } from 'react';

import { useParams } from 'react-router-dom';

import {
    Controller,
    useForm,
} from 'react-hook-form';

import { z }
    from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';

import {
    Box,
    Button,
    Paper,
    TextField,
    Typography,
} from '@mui/material';

import { toast } from 'react-toastify';

import {
    useServiceCategory,
    useUpdateServiceCategory,
} from './hooks';

import styles from './editServiceCategory.module.css';

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

    icon: z
        .string()
        .optional(),
});

const EditServiceCategory = () => {

    const { id } = useParams();

    /**
     * Fetch category
     */
    const {
        data: categoryData,
    } = useServiceCategory(id);

    /**
     * Update mutation
     */
    const {
        mutateAsync: updateServiceCategoryMut,
        isPending: updatingCategory,
    } = useUpdateServiceCategory();

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

            await updateServiceCategoryMut({

                id,

                data: {

                    name:
                        data.name,

                    icon:
                        data.icon || undefined,
                },
            });

            toast.success(
                'Service category updated successfully',
            );

        } catch (error) {

            let message =
                error.response?.data?.message
                || error.message
                || 'Failed to update service category';

            if ( Array.isArray(message))
                message = message.join(', ');
            
            toast.error(message);
        }
    };

    return (
        <section className={styles.page}>

            <Typography
                variant="h4"
                className={styles.title}
            >
                Edit Service Category
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

                    {/* ICON */}
                    <Controller
                        name="icon"

                        control={control}

                        render={({ field }) => (
                            <TextField
                                {...field}

                                label="Icon"

                                placeholder="MedicalServices"

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
                                : 'Update Service Category'
                        }

                    </Button>

                </Box>

            </Paper>

        </section>
    );
};

export default EditServiceCategory;