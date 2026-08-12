// EnrollmentStep1Review.jsx

import { useQuery } from "@tanstack/react-query";

import { Box, Skeleton } from "@mui/material";

import { Badge, Cake, Diversity3, Person } from "@mui/icons-material";

import { fetchEnrollmentStep1 } from "@/api/enrollment.api";

import { SectionHeader } from "@components/Panel/Panel";
import { Fact, Facts } from "@components/RecordFields/RecordFields";
import { formatBoolean } from "@/utils/formatBoolean.util";

import { formatWords } from "@/utils/formatWord.util";

import { reviewQuery } from "../../reviewQuery";
import StepUnavailable from "../../StepUnavailable";

export default function EnrollmentStep1Review({ enrollmentId }) {
  const { data, isLoading, error } = useQuery(
    reviewQuery(["admin-enrollment-step1", enrollmentId], () =>
      fetchEnrollmentStep1(enrollmentId),
    ),
  );

  if (isLoading) {
    return <Step1Skeleton />;
  }

  if (error) {
    return <StepUnavailable error={error} what="demographics" />;
  }

  const demographics = data?.demographics;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Group
        icon={<Person />}
        title="Legal Name"
        description="Personal identity information"
      >
        <Fact label="First Name" value={demographics?.firstName} />
        <Fact label="Last Name" value={demographics?.lastName} />
      </Group>

      <Group
        icon={<Cake />}
        title="Birth Information"
        description="Birth and location details"
      >
        <Fact
          label="Date of Birth"
          value={
            demographics?.dateOfBirth
              ? new Date(demographics.dateOfBirth).toLocaleDateString()
              : null
          }
        />
        <Fact label="Country of Birth" value={demographics?.countryOfBirth} />
        <Fact label="City of Birth" value={demographics?.cityOfBirth} />
        <Fact label="Municipality" value={demographics?.municipalityOfBirth} />
      </Group>

      <Group
        icon={<Badge />}
        title="Demographics"
        description="Sex, gender, marital status and occupation"
      >
        <Fact label="Sex" value={formatWords(demographics?.sex)} />
        <Fact
          label="Gender"
          value={
            demographics?.gender === "SELF_DESCRIBE"
              ? demographics?.genderSelfDescribe ||
                formatWords(demographics?.gender)
              : formatWords(demographics?.gender)
          }
        />
        <Fact label="Marital Status" value={demographics?.maritalStatus} />
        <Fact label="Occupation" value={demographics?.occupation} />
      </Group>

      <Group
        icon={<Diversity3 />}
        title="Identity & Yucayeke"
        description="Heritage identity, yucayeke and children"
      >
        <Fact label="Identity" value={data?.yucayekeInfo?.identity} />
        <Fact
          label="Yucayeke"
          value={
            data?.yucayekeInfo?.yucayekeUnknown
              ? "Unknown (member doesn't know)"
              : data?.yucayekeInfo?.yucayeke
          }
        />
        <Fact
          label="Has Children"
          value={formatBoolean(data?.yucayekeInfo?.hasChildren)}
        />
        <Fact
          label="Has Children Under 18"
          value={formatBoolean(data?.yucayekeInfo?.hasMinorChildren)}
        />
      </Group>
    </Box>
  );
}

/**
 * One titled block of facts. A hairline rule under the heading is enough to
 * separate blocks — nesting a shadowed card per block (as this screen used to)
 * builds a box-in-a-box-in-a-box and adds height without adding meaning.
 */
function Group({ icon, title, description, children }) {
  return (
    <Box component="section">
      <Box
        sx={{
          pb: 0.75,
          mb: 0.5,
          borderBottom: "2px solid",
          borderColor: "divider",
        }}
      >
        <SectionHeader icon={icon} title={title} description={description} />
      </Box>

      <Box component="dl" sx={{ m: 0 }}>
        <Facts>{children}</Facts>
      </Box>
    </Box>
  );
}

function Step1Skeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {[1, 2, 3].map((group) => (
        <Box key={group}>
          <Skeleton variant="text" width={180} height={22} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              columnGap: 3,
            }}
          >
            {[1, 2, 3, 4].map((field) => (
              <Box key={field} sx={{ py: 0.75 }}>
                <Skeleton variant="text" width={90} height={14} />
                <Skeleton variant="text" width="70%" height={18} />
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
