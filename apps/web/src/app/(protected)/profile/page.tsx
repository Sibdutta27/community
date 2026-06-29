import { ProfilePageContent } from "@/features/profile/components/profile-page-content";
import { getRequiredSessionUser } from "@/lib/auth-session";

export default async function ProfilePage() {
  const user = await getRequiredSessionUser();

  return <ProfilePageContent user={user} />;
}
