// EnrollmentApproval.tsx

import styles from './enrollmentApproval.module.css';

import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import { toast } from 'react-toastify';

import { useParams, useNavigate } from 'react-router-dom';

import {
    Box,
    Button,
    Paper,
    Step,
    StepLabel,
    Stepper,
    Typography,
} from '@mui/material';

import Step1Review from '../components/Step1Review/Step1Review';
import Step2Review from '../components/Step2Review/Step2Review';
import Step3Review from '../components/Step3Review/Step3Review';
import Step4Review from '../components/Step4Review/Step4Review';

import { verifyEnrollment } from '@/api/enrollment.api';

const steps = [
    'Step 1',
    'Step 2',
    'Step 3',
    'Step 4',
    'Approval',
];

export default function EnrollmentApproval() {

    const { id: enrollmentId } = useParams();

    const navigate = useNavigate();

    const [activeStep, setActiveStep] = useState(0);

    const handleNext = () => {
        if (activeStep < steps.length - 1) {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (activeStep > 0) {
            setActiveStep((prev) => prev - 1);
        }
    };

    /**
     * Verify mutation
     */
    const {
        mutateAsync: verificationMut,
        isPending: vefificationPanding,
    } = useMutation({
        mutationFn: verifyEnrollment,
    });

    /**
     * Handle verification document
     */
    const handleVerification = async (isApproved) => {
        await verificationMut(
            { enrollmentId, isApproved },
            {
                /**
                 * Handle on success
                 */
                onSuccess: () => {
                    // Show the success message
                    toast.success("Enrollment Verification Successfull");

                    // Redirect
                    navigate('/enrollments/all', {
                        replace: true,
                    });
                },

                /**
                 * Handle on error
                 */
                onError: (error) => {
                    // Show the error message
                    const errorMessage = error.response?.data?.message || error.message || "Failed to vefify enrollment. Please check your connection and try again";
                    toast.error(errorMessage);
                },
            }
        );
    };

    /**
     * Render step body
     */
    const renderStepBody = () => {

        switch (activeStep) {

            case 0:
                return (
                    <div className={styles.stepBody}>
                        <Box sx={{borderBottom: '1px solid #aaaaaa', paddingBottom: 2}}>
                            <Typography variant="h5">
                                Personal details and contacts
                            </Typography>
                        </Box>
                        <Box>
                            <Step1Review enrollmentId={enrollmentId} />
                        </Box>
                    </div>
                );

            case 1:
                return (
                    <div className={styles.stepBody}>
                        <Box sx={{borderBottom: '1px solid #aaaaaa', paddingBottom: 2}}>
                            <Typography variant="h5">
                                Maternal Lineage 
                            </Typography>
                        </Box>
                        <Box>
                            <Step2Review enrollmentId={enrollmentId} />
                        </Box>
                    </div>
                );

            case 2:
                return (
                    <div className={styles.stepBody}>
                        <Box sx={{borderBottom: '1px solid #aaaaaa', paddingBottom: 2}}>
                            <Typography variant="h5">
                                Cultural Connections
                            </Typography>
                        </Box>
                        <Box>
                            <Step3Review enrollmentId={enrollmentId} />
                        </Box>
                    </div>
                );
            case 3:
                return (
                    <div className={styles.stepBody}>
                        <Box sx={{borderBottom: '1px solid #aaaaaa', paddingBottom: 2}}>
                            <Typography variant="h5">
                                Personal details and contacts
                            </Typography>
                        </Box>
                        <Box>
                            <Step4Review enrollmentId={enrollmentId} />
                        </Box>
                    </div>
                );

            case 4:
                return (
                    <div className={styles.stepBody}>
                        <Box sx={{borderBottom: '1px solid #aaaaaa', paddingBottom: 2}}>
                            <Typography variant="h5">
                                Approval section
                            </Typography>
                        </Box>

                        <div className={styles.actionButtons}>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => handleVerification(true)}
                                disabled={vefificationPanding}
                            >
                                Approve
                            </Button>

                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => handleVerification(false)}
                                disabled={vefificationPanding}
                            >
                                Reject
                            </Button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Box className={styles.container}>

            {/* HEADER */}
            <div className={styles.header}>
                <Typography
                    variant="h4"
                    fontWeight={600}
                >
                    Enrollment Review
                </Typography>

                <Typography className={styles.subtitle}>
                    Review each enrollment step before approval
                </Typography>
            </div>

            {/* STEPPER */}
            <Paper
                elevation={0}
                className={styles.stepperCard}
            >
                <Stepper activeStep={activeStep}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>
                                {label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Paper>

            {/* BODY */}
            <Paper
                elevation={0}
                className={styles.contentCard}
            >
                {renderStepBody()}
            </Paper>

            {/* FOOTER */}
            <div className={styles.footer}>

                <Button
                    variant="outlined"
                    disabled={activeStep === 0}
                    onClick={handlePrevious}
                >
                    Previous
                </Button>

                <Button
                    variant="contained"
                    disabled={activeStep === steps.length - 1}
                    onClick={handleNext}
                >
                    Next
                </Button>
            </div>
        </Box>
    );
}