// pages/Services/CreateService/CreateService.jsx

import { useForm } from 'react-hook-form';

import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';

import {
    Box,
    Button,
    MenuItem,
    Paper,
    TextField,
    Typography,
} from '@mui/material';

import { useMutation } from '@tanstack/react-query';

import { toast } from 'react-toastify';

import { createService } from '@/api/service.api';

import styles from './createService.module.css';

import { useServiceCategory } from '../components/ServiceList/hooks';

import CategorySelect from '../components/CategorySelect/CategorySelect';

/**
 * Service status options
 */
const STATUS_OPTIONS = [
    {
        label: 'Active',
        value: 'ACTIVE',
    },

    {
        label: 'Inactive',
        value: 'INACTIVE',
    },

    {
        label: 'Closed',
        value: 'CLOSED',
    },
];

/**
 * Action type options
 */
const ACTION_OPTIONS = [
    {
        label: 'Internal',
        value: 'INTERNAL',
    },

    {
        label: 'External',
        value: 'EXTERNAL',
    },

    {
        label: 'Modal',
        value: 'MODAL',
    },

    {
        label: 'None',
        value: 'NONE',
    },
];

/**
 * Featured options
 */
const FEATURED_OPTIONS = [
    {
        label: 'Featured',
        value: true,
    },

    {
        label: 'Not Featured',
        value: false,
    },
];

/**
 * Validation schema
 */
const createServiceSchema = z.object({

    name: z
        .string()
        .min(2, 'Name must be at least 2 characters'),

    description: z
        .string()
        .optional(),

    icon: z
        .string()
        .optional(),

    categoryId: z
        .string()
        .min(1, 'Category is required'),

    status: z.enum([
        'ACTIVE',
        'INACTIVE',
        'CLOSED',
    ]),

    isFeatured: z.boolean(),

    location: z
        .string()
        .optional(),

    phone: z
        .string()
        .optional(),

    email: z
        .string()
        .email('Invalid email')
        .optional()
        .or(z.literal('')),

    actionType: z.enum([
        'INTERNAL',
        'EXTERNAL',
        'MODAL',
        'NONE',
    ]),

    actionLabel: z
        .string()
        .optional(),

    actionUrl: z
        .string()
        .optional(),

    actionRoute: z
        .string()
        .optional(),

    highlights: z
        .string()
        .optional(),
});

const CreateService = () => {

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
        setValue,
        watch,
    } = useForm({

        resolver:
            zodResolver(
                createServiceSchema,
            ),

        defaultValues: {
            name: '',
            description: '',
            icon: '',
            categoryId: '',

            status: 'ACTIVE',

            isFeatured: false,

            location: '',
            phone: '',
            email: '',

            actionType: 'EXTERNAL',
            actionLabel: '',
            actionUrl: '',
            actionRoute: '',

            highlights: '',
        },
    });

    /**
     * Watch values
     */
    const featuredValue = watch('isFeatured');

    // Hooks for getl all services category
    const {
        data: ServiceCategoryData,
        isFetching: ServiceCategoryFetching,
        error: ServiceCategoryFetchingError,
        refetch: refetchServiceCategory,
    } = useServiceCategory({});

    /**
     * Mutation
     */
    const {
        mutateAsync,
        isPending,
    } = useMutation({
        mutationFn: createService,
    });

    /**
     * Submit
     */
    const onSubmit = async (data) => {

        try {

            await mutateAsync({

                ...data,

                highlights:
                    data.highlights
                        ? data.highlights
                            .split(',')
                            .map((item) =>
                                item.trim(),
                            )
                            .filter(Boolean)
                        : [],
            });

            toast.success(
                'Service created successfully.',
            );

            reset();

        } catch (error) {
            let message =
                error.response?.data?.message
                || error.message
                || 'Failed to create service';

                // toast.success("helloooo");

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
                Create Service
            </Typography>

            <Paper className={styles.formContainer}>

                <Box
                    component="form"

                    onSubmit={
                        handleSubmit(onSubmit)
                    }

                    className={styles.form}
                >

                    {/* NAME */}
                    <TextField
                        label="Service Name"

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
                        }
                    />

                    {/* ICON */}
                    <TextField
                        label="Icon"

                        placeholder="HealthAndSafety"

                        fullWidth

                        {...register('icon')}

                        error={!!errors.icon}

                        helperText={
                            errors.icon?.message
                        }
                    />

                    {/* CATEGORY ID */}
                    <CategorySelect
                        categorys={ServiceCategoryData?.data}
                        value={watch('categoryId')}
                        placeholder='Select Category'
                        hideAllCategoryOption={true}
                        onChange={(categoryId) =>
                            setValue(
                                'categoryId',
                                categoryId,
                                {
                                    shouldValidate: true,
                                },
                            )
                        }
                        error={!!errors.categoryId}
                        helperText={errors.categoryId?.message}
                    />

                    {/* STATUS */}
                    <TextField
                        select

                        label="Status"

                        fullWidth

                        defaultValue="ACTIVE"

                        {...register('status')}

                        error={!!errors.status}

                        helperText={
                            errors.status?.message
                        }
                    >

                        {
                            STATUS_OPTIONS.map((item) => (
                                <MenuItem
                                    key={item.value}

                                    value={item.value}
                                >
                                    {item.label}
                                </MenuItem>
                            ))
                        }

                    </TextField>

                    {/* FEATURED */}
                    <TextField
                        select

                        label="Featured"

                        fullWidth

                        value={
                            featuredValue
                                ? 'true'
                                : 'false'
                        }

                        onChange={(e) =>
                            setValue(
                                'isFeatured',
                                e.target.value === 'true',
                            )
                        }
                    >

                        {
                            FEATURED_OPTIONS.map((item) => (
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

                    {/* LOCATION */}
                    <TextField
                        label="Location"

                        fullWidth

                        {...register('location')}
                    />

                    {/* PHONE */}
                    <TextField
                        label="Phone"

                        fullWidth

                        {...register('phone')}
                    />

                    {/* EMAIL */}
                    <TextField
                        label="Email"

                        fullWidth

                        {...register('email')}

                        error={!!errors.email}

                        helperText={
                            errors.email?.message
                        }
                    />

                    {/* ACTION TYPE */}
                    <TextField
                        select

                        label="Action Type"

                        fullWidth

                        defaultValue="EXTERNAL"

                        {...register('actionType')}

                        error={
                            !!errors.actionType
                        }

                        helperText={
                            errors.actionType?.message
                        }
                    >

                        {
                            ACTION_OPTIONS.map((item) => (
                                <MenuItem
                                    key={item.value}

                                    value={item.value}
                                >
                                    {item.label}
                                </MenuItem>
                            ))
                        }

                    </TextField>

                    {/* ACTION LABEL */}
                    <TextField
                        label="Action Label"

                        placeholder="Schedule Appointment"

                        fullWidth

                        {...register('actionLabel')}
                    />

                    {/* ACTION URL */}
                    <TextField
                        label="Action URL"

                        placeholder="https://example.com"

                        fullWidth

                        {...register('actionUrl')}
                    />

                    {/* ACTION ROUTE */}
                    <TextField
                        label="Action Route"

                        placeholder="/apply"

                        fullWidth

                        {...register('actionRoute')}
                    />

                    {/* HIGHLIGHTS */}
                    <TextField
                        label="Highlights"

                        placeholder="24/7 Support, Certified Experts"

                        multiline

                        minRows={3}

                        fullWidth

                        {...register('highlights')}

                        helperText="Separate highlights with commas"
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
                                : 'Create Service'
                        }

                    </Button>

                </Box>

            </Paper>

        </section>
    );
};

export default CreateService;