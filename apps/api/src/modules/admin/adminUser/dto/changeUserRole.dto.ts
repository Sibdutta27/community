// dto/changeUserRole.dto.ts

import {
    ArrayNotEmpty,
    IsArray,
    IsEnum,
    IsString,
} from 'class-validator';

import { Role } from '@/generated/prisma/enums';

export class ChangeUserRoleDto {

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    users: string[];

    @IsEnum(Role)
    role: Role;
}