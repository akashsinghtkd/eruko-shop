import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Permissions } from '../rbac/decorators/permissions.decorator';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Permissions('users.read')
  @Get()
  async findAll(
    @Query('page') _page?: number,
    @Query('limit') _limit?: number,
    @Query('q') _q?: string,
  ) {
    const result = await this.usersService.findAll();
    return {
      data: result.items,
      meta: {
        total: result.total,
        page: Number(_page) || 1,
        limit: Number(_limit) || 20,
      },
    };
  }

  @Permissions('users.read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return { data: user };
  }

  @Permissions('users.write')
  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return { data: user };
  }

  @Permissions('users.write')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto);
    return { data: user };
  }

  @Permissions('users.write')
  @Post(':id/status')
  async setStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    const user = await this.usersService.setStatus(id, body.isActive);
    return { data: user };
  }

  @Permissions('users.write')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.softDelete(id);
    return { data: true };
  }
}

