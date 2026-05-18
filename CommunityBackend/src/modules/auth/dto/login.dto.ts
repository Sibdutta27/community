import {
    IsEmail,
    IsString,
    MinLength,
    MaxLength,
    IsNotEmpty,
} from 'class-validator';

import { Transform } from 'class-transformer';

export class LoginDto {
    @Transform(({ value }) => value?.toLowerCase().trim())
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString()
    @MinLength(3, { message: 'Password must be at least 3 characters' })
    @MaxLength(100, { message: 'Password must not exceed 100 characters' })
    password: string;
}