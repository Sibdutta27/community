// pages/Consents/CreateConsent/CreateConsent.jsx

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
    createConsent,
} from '@/api/consent.api';

import styles
    from './createConsent.module.css';

/**
 * Active options
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
 * Required options
 */
const REQUIRED_OPTIONS = [
    {
        label: 'Required',
        value: true,
    },

    {
        label: 'Optional',
        value: false,
    },
];

/**
 * Validation schema
 */
const createConsentSchema = z.object({

    key: z
        .string()
        .min(2, 'Key must be at least 2 characters'),

    version: z
        .number({
            invalid_type_error:
                'Version must be a number',
        })
        .min(1, 'Version must be at least 1'),

    title: z
        .string()
        .min(3, 'Title must be at least 3 characters'),

    content: z
        .string()
        .min(
            10,
            'Content must be at least 10 characters',
        ),

    required: z.boolean(),

    active: z.boolean(),
});

const CreateConsent = () => {

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
                createConsentSchema,
            ),

        defaultValues: {
            key: '',
            version: 1,

            title: '',
            content: '',

            required: true,
            active: true,
        },
    });

    /**
     * Watch values
     */
    const activeValue =
        watch('active');

    const requiredValue =
        watch('required');

    /**
     * Mutation
     */
    const {
        mutateAsync,
        isPending,
    } = useMutation({
        mutationFn:
            createConsent,
    });

    /**
     * Submit
     */
    const onSubmit = async (data) => {

        try {

            await mutateAsync({
                ...data,

                version:
                    Number(data.version),
            });

            toast.success(
                'Consent created successfully.',
            );

            reset();

        } catch (error) {

            let message =
                error.response?.data?.message
                || error.message
                || 'Failed to create consent';
                
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
                Create Consent
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

                        placeholder="privacy_policy"

                        fullWidth

                        {...register('key')}

                        error={!!errors.key}

                        helperText={
                            errors.key?.message
                        }
                    />

                    {/* VERSION */}
                    <TextField
                        label="Version"

                        type="number"

                        fullWidth

                        {...register(
                            'version',
                            {
                                valueAsNumber: true,
                            },
                        )}

                        error={!!errors.version}

                        helperText={
                            errors.version?.message
                        }
                    />

                    {/* TITLE */}
                    <TextField
                        label="Title"

                        fullWidth

                        {...register('title')}

                        error={!!errors.title}

                        helperText={
                            errors.title?.message
                        }
                    />

                    {/* CONTENT */}
                    <TextField
                        label="Content"

                        multiline

                        minRows={8}

                        fullWidth

                        {...register('content')}

                        error={!!errors.content}

                        helperText={
                            errors.content?.message
                        }
                    />

                    {/* REQUIRED */}
                    <TextField
                        select

                        label="Requirement"

                        fullWidth

                        value={
                            requiredValue
                                ? 'true'
                                : 'false'
                        }

                        onChange={(e) =>
                            setValue(
                                'required',
                                e.target.value === 'true',
                            )
                        }

                        error={
                            !!errors.required
                        }

                        helperText={
                            errors.required?.message
                        }
                    >

                        {
                            REQUIRED_OPTIONS.map((item) => (
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

                    {/* STATUS */}
                    <TextField
                        select

                        label="Status"

                        fullWidth

                        value={
                            activeValue
                                ? 'true'
                                : 'false'
                        }

                        onChange={(e) =>
                            setValue(
                                'active',
                                e.target.value === 'true',
                            )
                        }

                        error={
                            !!errors.active
                        }

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
                                : 'Create Consent'
                        }

                    </Button>

                </Box>

            </Paper>

        </section>
    );
};

export default CreateConsent;