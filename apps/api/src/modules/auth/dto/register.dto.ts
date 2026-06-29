import {
    IsEmail,
    IsString,
    MinLength,
    MaxLength,
    IsNotEmpty,
} from 'class-validator';

import { Transform } from 'class-transformer';

export class RegisterDto {
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    @MinLength(2, { message: 'Name must be at least 2 characters' })
    @MaxLength(50, { message: 'Name must not exceed 50 characters' })
    name: string;

    @Transform(({ value }) => value?.toLowerCase().trim())
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString()
    @MinLength(3, { message: 'Password must be at least 3 characters' })
    @MaxLength(100, { message: 'Password must not exceed 100 characters' })
    password: string;
}