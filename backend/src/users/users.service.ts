import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  // NOTE: Implement actual persistence using Supabase/Postgres.

  async findAll() {
    return {
      items: [],
      total: 0,
    };
  }

  async findOne(id: string) {
    // TODO: fetch user by id
    return { id };
  }

  async create(dto: CreateUserDto) {
    // TODO: create user + assign roles
    return { id: 'generated-id', ...dto };
  }

  async update(id: string, dto: UpdateUserDto) {
    // TODO: update user fields and roles
    return { id, ...dto };
  }

  async setStatus(id: string, isActive: boolean) {
    // TODO: activate/deactivate user
    return { id, isActive };
  }

  async softDelete(id: string) {
    // TODO: soft delete user
    return;
  }
}

