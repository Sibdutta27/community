import type { ProfileRegionalMember } from "../config/profile-config";

function buildRegionalMemberSearchText(member: ProfileRegionalMember) {
  return [member.name, member.role, member.memberId].join(" ").toLowerCase();
}

export function filterRegionalMembers(
  members: ReadonlyArray<ProfileRegionalMember>,
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return members;
  }

  return members.filter((member) =>
    buildRegionalMemberSearchText(member).includes(normalizedQuery),
  );
}
