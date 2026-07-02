// EnrollmentStep4Review.jsx

import styles from './step4Review.module.css';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    Alert,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Skeleton,
    Typography,
} from '@mui/material';

import {
    CheckCircle,
    Close,
    Description,
    Download,
    Image,
    InsertDriveFile,
    Verified,
} from '@mui/icons-material';

import { toast } from 'react-toastify';

import { fetchEnrollmentStep4, verifyEnrollmentDocument } from '@/api/enrollment.api';

const DOCUMENT_TYPES = [
    'USER_PHOTO',
    'GENEALOGICAL_RECORDS',
    'KINSHIP_LETTERS',
    'ORAL_HISTORY',
    'DNA_TESTING',
]

const DOCUMENT_TITLES = {
    USER_PHOTO: 'User Photo',
    GENEALOGICAL_RECORDS: 'Genealogical Records',
    KINSHIP_LETTERS: 'Kinship Letters',
    ORAL_HISTORY: 'Oral History',
    DNA_TESTING: 'DNA Testing',
};

export default function EnrollmentStep4Review({
    enrollmentId,
}) {

    const queryClient = useQueryClient();

    const {
        data,
        isLoading,
        error,
        refetch: refetchStep4,
    } = useQuery({
        queryKey: ['admin-enrollment-step4', enrollmentId],
        queryFn: () => fetchEnrollmentStep4(enrollmentId)
    });

    /**
     * Verify mutation
     */
    const {
        mutateAsync: verificationMut,
        isPending: vefificationPanding,
    } = useMutation({
        mutationFn: verifyEnrollmentDocument,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    'admin-enrollment-step4',
                    enrollmentId,
                ],
            });
        },
    });

    /**
     * Handle verification document
     */
    const handleVerification = async (documentId, isApproved) => {
        await verificationMut(
            { documentId, isApproved },
            {
                /**
                 * Handle on success
                 */
                onSuccess: () => {
                    refetchStep4();

                    // Show the success message
                    toast.success("Document Verification Successfull");
                },

                /**
                 * Handle on error
                 */
                onError: (error) => {
                    // Show the error message
                    const errorMessage = error.response?.data?.message || error.message || "Failed to vefify document. Please check your connection and try again";
                    toast.error(errorMessage);
                },
            }
        );
    };

    /**
     * Loading
     */
    if (isLoading) {
        return (
            <div className={styles.loadingGrid}>

                {[1, 2, 3].map((item) => (
                    <Paper
                        key={item}
                        className={styles.categoryCard}
                    >
                        <Skeleton
                            variant="text"
                            width={220}
                            height={35}
                        />

                        <Skeleton
                            variant="rounded"
                            height={180}
                        />
                    </Paper>
                ))}

            </div>
        );
    }

    /**
     * Error
     */
    if (error) {
        return (
            <Alert severity="error">
                Failed to load documents
            </Alert>
        );
    }

    return (
        <div className={styles.container}>

            {
                data.map((group) => {

                    if (!DOCUMENT_TYPES.includes(group.type)) {
                        return;
                    }

                    const documents = group.isSingle
                        ? (
                            group.documents
                                ? [group.documents]
                                : []
                        )
                        : group.documents;

                    return (
                        <Paper
                            key={group.type}
                            className={styles.categoryCard}
                        >

                            {/* HEADER */}
                            <div className={styles.categoryHeader}>

                                <div>

                                    <Typography
                                        className={styles.categoryTitle}
                                    >
                                        {
                                            DOCUMENT_TITLES[
                                            group.type
                                            ]
                                        }
                                    </Typography>

                                    <Typography
                                        className={
                                            styles.categorySubTitle
                                        }
                                    >
                                        {
                                            documents.length
                                        } document(s)
                                    </Typography>

                                </div>

                                <Chip
                                    label={
                                        group.isSingle
                                            ? 'Single Upload'
                                            : 'Multiple Uploads'
                                    }
                                    className={styles.typeChip}
                                />

                            </div>

                            {/* EMPTY */}
                            {
                                documents.length === 0 && (
                                    <div className={styles.emptyBox}>

                                        <InsertDriveFile />

                                        <Typography>
                                            No document uploaded
                                        </Typography>

                                    </div>
                                )
                            }

                            {/* DOCUMENTS */}
                            <div className={styles.documentsGrid}>

                                {
                                    documents.map((document) => (

                                        <div
                                            key={document.id}
                                            className={styles.documentCard}
                                        >

                                            {/* PREVIEW */}
                                            <div
                                                className={styles.previewBox}
                                            >

                                                <img
                                                    src={document.url}
                                                    alt={
                                                        document.type
                                                    }
                                                    className={
                                                        styles.previewImage
                                                    }
                                                />

                                            </div>

                                            {/* BODY */}
                                            <div
                                                className={styles.documentBody}
                                            >

                                                <div>

                                                    <Typography
                                                        className={
                                                            styles.documentTitle
                                                        }
                                                    >
                                                        {
                                                            DOCUMENT_TITLES[
                                                            document.type
                                                            ]
                                                        }
                                                    </Typography>

                                                    <Typography
                                                        className={
                                                            styles.documentMeta
                                                        }
                                                    >
                                                        Uploaded:{' '}
                                                        {
                                                            new Date(
                                                                document.uploadedAt,
                                                            ).toLocaleDateString()
                                                        }
                                                    </Typography>

                                                    <Typography
                                                        className={
                                                            styles.documentMeta
                                                        }
                                                    >
                                                        Size:{' '}
                                                        {
                                                            (
                                                                document.fileSize
                                                                / 1024
                                                            ).toFixed(1)
                                                        } KB
                                                    </Typography>

                                                </div>

                                                {/* STATUS */}
                                                <div
                                                    className={
                                                        styles.statusRow
                                                    }
                                                >

                                                    {
                                                        document.verifiedByAdmin ? (
                                                            <Chip
                                                                icon={
                                                                    <Verified />
                                                                }
                                                                label="Approved"
                                                                className={
                                                                    styles.approvedChip
                                                                }
                                                            />
                                                        ) : (
                                                            <Chip
                                                                label="Not Approved"
                                                                className={
                                                                    styles.pendingChip
                                                                }
                                                            />
                                                        )
                                                    }

                                                </div>

                                                {/* ACTIONS */}
                                                <div
                                                    className={
                                                        styles.actionRow
                                                    }
                                                >

                                                    <Button
                                                        variant="outlined"
                                                        startIcon={
                                                            <Download />
                                                        }
                                                        href={document.url}
                                                        target="_blank"
                                                        className={
                                                            styles.previewBtn
                                                        }
                                                    >
                                                        Preview
                                                    </Button>

                                                    {
                                                        document.verifiedByAdmin ? (
                                                            <Button
                                                                variant="outlined"
                                                                startIcon={
                                                                    <Close />
                                                                }
                                                                disabled={
                                                                    vefificationPanding
                                                                }
                                                                onClick={() => handleVerification(document.id, false)}
                                                                className={
                                                                    styles.rejectBtn
                                                                }
                                                            >
                                                                Reject
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="contained"
                                                                startIcon={
                                                                    vefificationPanding
                                                                        ? (
                                                                            <CircularProgress
                                                                                size={
                                                                                    18
                                                                                }
                                                                            />
                                                                        )
                                                                        : (
                                                                            <CheckCircle />
                                                                        )
                                                                }
                                                                disabled={
                                                                    vefificationPanding
                                                                }
                                                                onClick={() => handleVerification(document.id, true)}
                                                                className={
                                                                    styles.approveBtn
                                                                }
                                                            >
                                                                Approve
                                                            </Button>
                                                        )
                                                    }
                                                </div>

                                            </div>

                                        </div>

                                    ))
                                }

                            </div>

                        </Paper>
                    );
                })
            }

        </div>
    );
}