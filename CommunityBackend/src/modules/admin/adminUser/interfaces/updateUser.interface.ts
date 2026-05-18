
import { Role } from '@/generated/prisma/enums';

export interface IUpdateUser {
    name    ?: string;
    role    ?: Role;
    password?: string;
}