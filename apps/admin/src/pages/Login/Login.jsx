import {
    Box,
    Button,
    Paper,
    TextField,
    Typography,
    InputAdornment,
    IconButton,
} from '@mui/material';

import {
    EmailOutlined,
    LockOutlined,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useLogin } from './useLogin';

import styles from './login.module.css';

// The login card is deep-azul chrome, so the inputs need light text / borders
// (the app's MUI theme is light mode).
const darkInputSx = {
    '& .MuiOutlinedInput-root': {
        color: '#ffffff',
        backgroundColor: 'rgba(255,255,255,0.05)',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.18)' },
        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.35)' },
        '&.Mui-focused fieldset': { borderColor: '#4ea6dc' },
    },
    '& .MuiInputBase-input::placeholder': { color: '#9fb3c8', opacity: 1 },
    '& .MuiSvgIcon-root': { color: '#9fb3c8' },
};

const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email'),

    password: z
        .string()
        .min(6, 'Minimum 6 characters'),
});

/**
 * Login page component
 */
export default function LoginPage() {

    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const loginMutation = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        loginMutation.mutate(data, {
            onSuccess: (response) => {

                // store token
                localStorage.setItem('token', response.accessToken);

                // Redirect
                navigate('/users', {
                    replace: true,
                });
            },

            onError: (error) => {
                const errorObj = error.response?.data || { message: 'Login failed' };
                toast.error(errorObj.message || 'Login failed');
            }
        });
    };

    return (
        <Box className={styles.page}>
            <Box className={styles.rightSection}>
                <Paper className={styles.loginCard}>
                    <Typography
                        variant="h4"
                        className={styles.title}
                    >
                        Sign In
                    </Typography>

                    <Typography
                        variant="body2"
                        className={styles.subtitle}
                    >
                        Login as Administrator
                    </Typography>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className={styles.form}
                    >
                        {/* EMAIL */}
                        <Box>
                            <Typography
                                className={styles.label}
                            >
                                Email
                            </Typography>

                            <TextField
                                fullWidth
                                sx={darkInputSx}
                                placeholder="Enter your email"
                                {...register('email')}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailOutlined />
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                            />
                        </Box>

                        {/* PASSWORD */}
                        <Box>
                            <Typography
                                className={styles.label}
                            >
                                Password
                            </Typography>

                            <TextField
                                fullWidth
                                sx={darkInputSx}
                                type={
                                    showPassword
                                        ? 'text'
                                        : 'password'
                                }
                                placeholder="Enter your password"
                                {...register('password')}
                                error={!!errors.password}
                                helperText={
                                    errors.password?.message
                                }
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockOutlined />
                                            </InputAdornment>
                                        ),

                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                >
                                                    {showPassword ? (
                                                        <VisibilityOff />
                                                    ) : (
                                                        <Visibility />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                            />
                        </Box>

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loginMutation.isPending}
                            className={styles.loginButton}
                        >
                            {loginMutation.isPending
                                ? 'Signing In...'
                                : 'Sign In'}
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Box>
    );
}