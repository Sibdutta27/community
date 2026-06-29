import { Role } from "@/generated/prisma/enums";

export interface GetUsersQuery {
    page  ?: number;
    limit ?: number;
    role  ?: Role;
    search?: string;
}