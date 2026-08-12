// EnrollmentApproval.jsx

import styles from "./enrollmentApproval.module.css";

import { useState } from "react";

import { useMutation } from "@tanstack/react-query";

import { toast } from "react-toastify";

import { Link, useParams, useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Step,
  StepButton,
  Stepper,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import Panel from "@components/Panel/Panel";

import Step1Review from "../components/Step1Review/Step1Review";
import Step2Review from "../components/Step2Review/Step2Review";
import Step3Review from "../components/Step3Review/Step3Review";
import Step4Review from "../components/Step4Review/Step4Review";
import SignatureReview from "../components/SignatureReview/SignatureReview";
import ConsentReview from "../components/ConsentReview/ConsentReview";

import { verifyEnrollment } from "@/api/enrollment.api";

/**
 * The steps are named after what they contain.
 *
 * They used to read "Step 1 … Step 4, Approval", which told a reviewer nothing
 * — the actual subject of each step was only revealed as a heading once you
 * had already navigated there. Naming them makes the stepper a table of
 * contents instead of a progress bar.
 */
const STEPS = [
  { label: "Demographics", render: (id) => <Step1Review enrollmentId={id} /> },
  {
    label: "Maternal Kinship",
    render: (id) => <Step2Review enrollmentId={id} />,
  },
  {
    label: "Paternal Kinship",
    render: (id) => <Step3Review enrollmentId={id} />,
  },
  { label: "Documents", render: (id) => <Step4Review enrollmentId={id} /> },
  { label: "Decision", render: (id) => <DecisionStep enrollmentId={id} /> },
];

export default function EnrollmentApproval() {
  const { id: enrollmentId } = useParams();

  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);

  const isLastStep = activeStep === STEPS.length - 1;

  /**
   * Verify mutation
   */
  const { mutateAsync: verificationMut, isPending: verificationPending } =
    useMutation({
      mutationFn: verifyEnrollment,
    });

  /**
   * Handle the enrollment decision
   */
  const handleVerification = async (isApproved) => {
    // This decides someone's citizenship application and there is no undo in
    // the UI, so it asks first. The prompt names the outcome rather than
    // saying "are you sure?".
    const confirmed = window.confirm(
      isApproved
        ? "Approve this enrollment? The applicant becomes an enrolled member."
        : "Reject this enrollment? The applicant will be told their application was not approved.",
    );

    if (!confirmed) {
      return;
    }

    await verificationMut(
      { enrollmentId, isApproved },
      {
        onSuccess: () => {
          toast.success(
            isApproved ? "Enrollment approved" : "Enrollment rejected",
          );

          navigate(
            isApproved ? "/enrollments/approved" : "/enrollments/rejected",
            {
              replace: true,
            },
          );
        },

        onError: (error) => {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Could not record the decision. Check your connection and try again.";
          toast.error(errorMessage);
        },
      },
    );
  };

  return (
    <Box className={styles.container}>
      {/* HEADER — one line, with the way back out */}
      <Box className={styles.header}>
        <Button
          component={Link}
          to="/enrollments/submitted"
          startIcon={<ArrowBackIcon />}
          sx={{ color: "text.secondary", ml: -1 }}
        >
          Back to review queue
        </Button>

        <Typography
          component="h1"
          sx={{
            fontSize: "1.15rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          Enrollment Review
        </Typography>
      </Box>

      {/* STEPPER — clickable. Jumping straight to Documents (or to the
          decision) was previously four clicks of "Next" away. */}
      <Panel padding="compact">
        <Stepper nonLinear activeStep={activeStep}>
          {STEPS.map((step, index) => (
            <Step key={step.label} completed={false}>
              <StepButton onClick={() => setActiveStep(index)}>
                {step.label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </Panel>

      {/* BODY */}
      <Panel padding="compact">{STEPS[activeStep].render(enrollmentId)}</Panel>

      {/* FOOTER — paging on the left, the decision always reachable on the
          right. The reviewer no longer has to walk to the last step to act. */}
      <Box className={styles.footer}>
        <Box className={styles.pager}>
          <Button
            variant="outlined"
            disabled={activeStep === 0}
            onClick={() => setActiveStep((prev) => prev - 1)}
          >
            Previous
          </Button>

          <Button
            variant="outlined"
            disabled={isLastStep}
            onClick={() => setActiveStep((prev) => prev + 1)}
          >
            Next
          </Button>

          <Typography className={styles.progress}>
            {activeStep + 1} of {STEPS.length} · {STEPS[activeStep].label}
          </Typography>
        </Box>

        <Box className={styles.decision}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleVerification(false)}
            disabled={verificationPending}
          >
            Reject
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={() => handleVerification(true)}
            disabled={verificationPending}
          >
            Approve enrollment
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

/**
 * The final step: what was signed, and what was consented to.
 */
function DecisionStep({ enrollmentId }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <SignatureReview enrollmentId={enrollmentId} />

      <Box>
        <Typography
          component="h3"
          sx={{
            pb: 0.75,
            mb: 0.75,
            borderBottom: "2px solid",
            borderColor: "divider",
            fontSize: "0.9rem",
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          Consents
        </Typography>

        <ConsentReview enrollmentId={enrollmentId} />
      </Box>
    </Box>
  );
}
