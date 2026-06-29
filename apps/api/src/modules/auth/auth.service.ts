import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/modules/user/user.service';
import { comparePassword, hashPassword } from '@/common/utils/password.util';
import { Role } from '@/generated/prisma/enums';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService
    ) { }

    /**
     * Auth register service
     */
    async register(
        {
            name,
            email,
            password
        }: {
            name: string,
            email: string,
            password: string
        }
    ) {

        // Validate the fields
        if (!name) {
            throw new BadRequestException('Name is required');
        }

        if (!email) {
            throw new BadRequestException('Email is required');
        }

        if (!password) {
            throw new BadRequestException('Password is required');
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Get the user by email
        let existingUser = await this.userService.findByEmail(normalizedEmail);

        // Check for existing user
        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create a new user
        const user = await this.userService.createUser({
            name    : name,
            email   : email,
            password: hashedPassword
        })


        // Create the payload
        const payload = {
            sub     : user.id,
            email   : user.email,
            role    : user.role,
            publicId: user.publicId,
            name    : user.name,
        };

        // Get the access token
        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
        };
    }

    /**
     * Auth login service
     */
    async login(
        {
            email,
            password
        }: {
            email: string,
            password: string
        }
    ) {
        // Validate the fields
        if (!email) {
            throw new BadRequestException('Email is required');
        }

        if (!password) {
            throw new BadRequestException('Password is required');
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Get the user by email
        let user = await this.userService.findByEmail(normalizedEmail);

        // Check for existing user
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check passwored validity
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Update last active time
        user = await this.userService.updateLastActive(user.id);

        // Create the payload
        const payload = {
            sub     : user.id,
            email   : user.email,
            role    : user.role,
            publicId: user.publicId,
            name    : user.name,
        };

        // Get the access token
        const accessToken = this.jwtService.sign(payload);


        return {
            accessToken,
        };
    }

    /**
     * Auth admin login service
     */
    async adminLogin(
        {
            email,
            password
        }: {
            email: string,
            password: string
        }
    ) {
        // Validate the fields
        if (!email) {
            throw new BadRequestException('Email is required');
        }

        if (!password) {
            throw new BadRequestException('Password is required');
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Get the user by email
        let user = await this.userService.findByEmail(normalizedEmail);

        // Check for existing user
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if user is admin
        if (user.role !== Role.ADMIN) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check passwored validity
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Update last active time
        user = await this.userService.updateLastActive(user.id);

        // Create the payload
        const payload = {
            sub     : user.id,
            email   : user.email,
            role    : user.role,
            publicId: user.publicId,
            name    : user.name,
        };

        // Get the access token
        const accessToken = this.jwtService.sign(payload);


        return {
            accessToken,
        };
    }
}
