// pages/Consents/EditConsent/EditConsent.jsx

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
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from '@mui/material';

import { toast }
    from 'react-toastify';

import {
    useConsent,
    useUpdateConsent,
} from './hooks';

import styles
    from './editConsent.module.css';

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
const schema = z.object({

    title: z
        .string()
        .min(
            3,
            'Title must be at least 3 characters',
        ),

    content: z
        .string()
        .min(
            10,
            'Content must be at least 10 characters',
        ),

    required: z.boolean(),

    active: z.boolean(),
});

const EditConsent = () => {

    const { id } = useParams();

    /**
     * Fetch consent
     */
    const {
        data: consentData,
    } = useConsent(id);

    /**
     * Update mutation
     */
    const {
        mutateAsync: updateConsentMut,
        isPending: updatingConsent,
    } = useUpdateConsent();

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
            title: '',
            content: '',

            required: true,
            active: true,
        },
    });

    /**
     * Reset form
     */
    useEffect(() => {

        if (consentData) {

            reset({
                title:
                    consentData.title || '',

                content:
                    consentData.content || '',

                required:
                    consentData.required ?? true,

                active:
                    consentData.active ?? true,
            });
        }

    }, [
        consentData,
        reset,
    ]);

    /**
     * Submit
     */
    const onSubmit = async (data) => {

        try {

            await updateConsentMut({
                id,

                data: {
                    title:
                        data.title,

                    content:
                        data.content,

                    required:
                        data.required,

                    active:
                        data.active,
                },
            });

            toast.success(
                'Consent updated successfully',
            );

        } catch (error) {

            let message =
                error.response?.data?.message
                || error.message
                || 'Failed to update consent';

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
                Edit Consent
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
                            consentData?.key || ''
                        }

                        fullWidth

                        disabled
                    />

                    {/* VERSION */}
                    <TextField
                        label="Version"

                        value={
                            consentData?.version || ''
                        }

                        fullWidth

                        disabled
                    />

                    {/* TITLE */}
                    <Controller
                        name="title"

                        control={control}

                        render={({ field }) => (
                            <TextField
                                {...field}

                                label="Title"

                                fullWidth

                                error={
                                    !!errors.title
                                }

                                helperText={
                                    errors.title?.message
                                }
                            />
                        )}
                    />

                    {/* CONTENT */}
                    <Controller
                        name="content"

                        control={control}

                        render={({ field }) => (
                            <TextField
                                {...field}

                                label="Content"

                                multiline

                                minRows={8}

                                fullWidth

                                error={
                                    !!errors.content
                                }

                                helperText={
                                    errors.content?.message
                                }
                            />
                        )}
                    />

                    {/* REQUIRED */}
                    <Controller
                        name="required"

                        control={control}

                        render={({ field }) => (

                            <FormControl
                                fullWidth

                                error={
                                    !!errors.required
                                }
                            >

                                <InputLabel>
                                    Requirement
                                </InputLabel>

                                <Select
                                    value={
                                        field.value
                                            ? 'true'
                                            : 'false'
                                    }

                                    label="Requirement"

                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value === 'true',
                                        )
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

                                </Select>

                                <FormHelperText>
                                    {errors.required?.message}
                                </FormHelperText>

                            </FormControl>
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
                            updatingConsent
                        }

                        className={
                            styles.submitButton
                        }
                    >

                        {
                            updatingConsent
                                ? 'Updating...'
                                : 'Update Consent'
                        }

                    </Button>

                </Box>

            </Paper>

        </section>
    );
};

export default EditConsent;