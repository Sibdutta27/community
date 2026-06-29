// pages/Users/CreateUser/CreateUser.jsx

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

import { createUser } from '@/api/user.api';

import styles from './createUser.module.css';

/**
 * User roles
 */
const USER_ROLES = [
    'USER',
    'ADMIN',
    'MODERATOR',
];

/**
 * Validation schema
 */
const createUserSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters'),

    email: z
        .string()
        .email('Invalid email address'),

    password: z
        .string()
        .min(6, 'Password must be at least 6 characters'),

    role: z
        .string()
        .min(1, 'Please select a role'),
});

const CreateUser = () => {

    /**
     * React hook form
     */
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(createUserSchema),

        defaultValues: {
            name: '',
            email: '',
            password: '',
            role: 'USER',
        },
    });

    /**
     * Create user mutation
     */
    const {
        mutateAsync,
        isPending,
    } = useMutation({
        mutationFn: createUser,
    });

    /**
     * Handle submit
     */
    const onSubmit = async (data) => {

        try {

            await mutateAsync(data);

            toast.success('User created successfully.');

            reset();

        } catch (error) {

            let message = error.response?.data?.message || error.message || 'Failed to create user';
            
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
                Create User
            </Typography>

            <Paper className={styles.formContainer}>

                <Box
                    component="form"
                    onSubmit={handleSubmit(onSubmit)}
                    className={styles.form}
                >

                    <TextField
                        label="Name"
                        fullWidth
                        {...register('name')}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                    />

                    <TextField
                        label="Email"
                        fullWidth
                        {...register('email')}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                    />

                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        {...register('password')}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                    />

                    <TextField
                        select
                        label="Role"
                        fullWidth
                        defaultValue="USER"
                        {...register('role')}
                        error={!!errors.role}
                        helperText={errors.role?.message}
                    >
                        {USER_ROLES.map((role) => (
                            <MenuItem
                                key={role}
                                value={role}
                            >
                                {role}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isPending}
                        className={styles.submitButton}
                    >
                        {isPending
                            ? 'Creating...'
                            : 'Create User'}
                    </Button>

                </Box>

            </Paper>

        </section>
    );
};

export default CreateUser;