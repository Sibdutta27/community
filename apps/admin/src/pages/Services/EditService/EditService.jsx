// pages/Services/EditService/EditService.jsx

import { useEffect } from 'react';

import { Link, useParams } from 'react-router-dom';

import GroupsIcon from '@mui/icons-material/Groups';

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
    useService,
    useUpdateService,
    useServiceCategory
} from './hooks';

import CategorySelect from '../components/CategorySelect/CategorySelect';

import styles from './editService.module.css';

/**
 * Status options
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
const schema = z.object({

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

const EditService = () => {

    const { id } = useParams();

    /**
     * Fetch service
     */
    const {
        data: serviceData,
    } = useService(id);

    // Hooks for getl all services category
    const {
        data: ServiceCategoryData,
        isFetching: ServiceCategoryFetching,
        error: ServiceCategoryFetchingError,
        refetch: refetchServiceCategory,
    } = useServiceCategory({});

    /**
     * Update mutation
     */
    const {
        mutateAsync: updateServiceMut,
        isPending: updatingService,
    } = useUpdateService();

    /**
     * Form
     */
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        watch,

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
     * Reset form
     */
    useEffect(() => {

        if (serviceData) {
            reset({

                name: serviceData.name || '',

                description: serviceData.description || '',

                icon: serviceData.icon || '',

                categoryId: serviceData.category.id || '',

                status: serviceData.status || 'ACTIVE',

                isFeatured: serviceData.isFeatured ?? false,

                location: serviceData.location || '',

                phone: serviceData.phone || '',

                email: serviceData.email || '',

                actionType: serviceData.actionType || 'EXTERNAL',

                actionLabel: serviceData.actionLabel || '',

                actionUrl: serviceData.actionUrl || '',

                actionRoute: serviceData.actionRoute || '',

                highlights: serviceData.highlights?.join(', ') || '',
            });
        }

    }, [
        serviceData,
        reset,
    ]);

    /**
     * Submit
     */
    const onSubmit = async (data) => {

        try {

            await updateServiceMut({

                id,

                data: {

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
                },
            });

            toast.success(
                'Service updated successfully',
            );

        } catch (error) {

            let message =
                error.response?.data?.message
                || error.message
                || 'Failed to update service';

            if (Array.isArray(message))
                message = message.join(', ');

            toast.error(message);
        }
    };

    return (
        <section className={styles.page}>

            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                }}
            >
                <Typography
                    variant="h4"
                    className={styles.title}
                >
                    Edit Program
                </Typography>

                {/* The roster is one click from the program, so staff can go
                    straight to who signed up. */}
                <Button
                    component={Link}
                    to={`/services/${id}/registrations`}
                    variant="outlined"
                    startIcon={<GroupsIcon />}
                >
                    Registrants
                </Button>
            </Box>

            <Paper className={styles.formContainer}>

                <Box
                    component="form"

                    onSubmit={
                        handleSubmit(onSubmit)
                    }

                    className={styles.form}
                >

                    {/* NAME */}
                    <Controller
                        name="name"

                        control={control}

                        render={({ field }) => (
                            <TextField
                                {...field}

                                label="Service Name"

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

                                fullWidth
                            />
                        )}
                    />

                    {/* CATEGORY */}
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

                        error={
                            !!errors.categoryId
                        }
                    />

                    {/* STATUS */}
                    <Controller
                        name="status"

                        control={control}

                        render={({ field }) => (

                            <FormControl
                                fullWidth

                                error={
                                    !!errors.status
                                }
                            >

                                <InputLabel>
                                    Status
                                </InputLabel>

                                <Select
                                    {...field}

                                    label="Status"
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

                                </Select>

                                <FormHelperText>
                                    {errors.status?.message}
                                </FormHelperText>

                            </FormControl>
                        )}
                    />

                    {/* FEATURED */}
                    <Controller
                        name="isFeatured"

                        control={control}

                        render={({ field }) => (

                            <FormControl fullWidth>

                                <InputLabel>
                                    Featured
                                </InputLabel>

                                <Select
                                    value={
                                        field.value
                                            ? 'true'
                                            : 'false'
                                    }

                                    label="Featured"

                                    onChange={(e) =>
                                        field.onChange(
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

                                </Select>

                            </FormControl>
                        )}
                    />

                    {/* LOCATION */}
                    <Controller
                        name="location"

                        control={control}

                        render={({ field }) => (
                            <TextField
                                {...field}

                                label="Location"

                                fullWidth
                            />
                        )}
                    />

                    {/* PHONE */}
                    <Controller
                        name="phone"

                        control={control}

                        render={({ field }) => (
                            <TextField
                                {...field}

                                label="Phone"

                                fullWidth
                            />
                        )}
                    />

                    {/* EMAIL */}
                    <Controller
                        name="email"

                        control={control}

                        render={({ field }) => (
                            <TextField
                                {...field}

                                label="Email"

                                fullWidth

                                error={
                                    !!errors.email
                                }

                                helperText={
                                    errors.email?.message
                                }
                            />
                        )}
                    />

                    {/* ACTION TYPE */}
                    <Controller
                        name="actionType"

                        control={control}

                        render={({ field }) => (

                            <FormControl
                                fullWidth

                                error={
                                    !!errors.actionType
                                }
                            >

                                <InputLabel>
                                    Action Type
                                </InputLabel>

                                <Select
                                    {...field}

                                    label="Action Type"
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

                                </Select>

                                <FormHelperText>
                                    {errors.actionType?.message}
                                </FormHelperText>

                            </FormControl>
                        )}
                    />

                    {/* ACTION LABEL */}
                    <Controller
                        name="actionLabel"

                        control={control}

                        render={({ field }) => (
                            <TextField
                                {...field}

                                label="Action Label"

                                fullWidth
                            />
                        )}
                    />

                    {/* ACTION URL */}
                    <Controller
                        name="actionUrl"

                        control={control}

                        render={({ field }) => (
                            <TextField
                                {...field}

                                label="Action URL"

                                fullWidth
                            />
                        )}
                    />

                    {/* ACTION ROUTE */}
                    <Controller
                        name="actionRoute"

                        control={control}

                        render={({ field }) => (
                            <TextField
                                {...field}

                                label="Action Route"

                                fullWidth
                            />
                        )}
                    />

                    {/* HIGHLIGHTS */}
                    <Controller
                        name="highlights"

                        control={control}

                        render={({ field }) => (
                            <TextField
                                {...field}

                                label="Highlights"

                                multiline

                                minRows={3}

                                fullWidth

                                helperText="Separate highlights with commas"
                            />
                        )}
                    />

                    <Button
                        type="submit"

                        variant="contained"

                        disabled={
                            updatingService
                        }

                        className={
                            styles.submitButton
                        }
                    >

                        {
                            updatingService
                                ? 'Updating...'
                                : 'Update Service'
                        }

                    </Button>

                </Box>

            </Paper>

        </section>
    );
};

export default EditService;