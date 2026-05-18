import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { UserRegisterDto } from './dto/userRegister.dto';
import { AdminUserService } from './adminUser.service';
import { AdminAuthGuard } from '../guard/adminAuth.guard';
import { Role } from '@/generated/prisma/browser';
import { ChangeUserRoleDto } from './dto/changeUserRole.dto';
import { UpdateUserDto } from './dto/updateUser.dto';


@Controller('admin/user')
@UseGuards(
    JwtAuthGuard,
    AdminAuthGuard
)
export class AdminUserController {
    constructor(private adminUserService: AdminUserService) { }

    /**
     * Register a new user
     */
    @Post('register')
    step1Upsert(
        @Body() dto: UserRegisterDto,
    ) {
        return this.adminUserService.registerUser(dto);
    }

    /**
     * Get all users
     */
    @Get()
    async getUsers(
        @Query('page') page    ?: string,
        @Query('limit') limit  ?: string,
        @Query('role') role    ?: Role,
        @Query('search') search?: string,
    ) {
        return this.adminUserService.getUsers({
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            role,
            search,
        });
    }

    /**
     * Get role counts
     */
    @Get('role-counts')
    async getRoleCounts() {
        return this.adminUserService.getRoleCounts();
    }

    /**
     * Change roles
     */
    @Post('change-roles')
    async changeRoles(
        @Body() dto: ChangeUserRoleDto,
    ) {
        return this.adminUserService.changeRoles(
            dto.users,
            dto.role,
        );
    }

    /**
     * Get single user
     */
    @Get(':id')
    async getUser(
        @Param('id') id: string,
    ) {
        return this.adminUserService.getUser(id);
    }

    /**
     * Update user
     */
    @Patch(':id')
    async updateUser(
        @Param('id') id: string,

        @Body() dto: UpdateUserDto,
    ) {
        return this.adminUserService.updateUser(
            id,
            dto,
        );
    }
}
