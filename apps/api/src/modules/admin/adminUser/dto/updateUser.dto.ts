// dto/update-user.dto.ts

import {
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

import { Role } from '@/generated/prisma/enums';
import { EmptyToUndefined } from '@/common/utils/transformar.util';

export class UpdateUserDto {

    @IsOptional()
    @IsString()
    @MinLength(2, {
        message: 'Name must be at least 2 characters',
    })
    @MaxLength(50, {
        message: 'Name must not exceed 50 characters',
    })
    name?: string;

    @IsOptional()
    @EmptyToUndefined()
    @IsEnum(Role, {
        message: 'Invalid role',
    })
    role?: Role;

    @IsOptional()
    @IsString()
    @MinLength(3, {
        message: 'Password must be at least 3 characters',
    })
    @MaxLength(100, {
        message: 'Password must not exceed 100 characters',
    })
    password?: string;
}