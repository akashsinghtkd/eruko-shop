import { Module } from '@nestjs/common';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  controllers: [RbacController],
  providers: [RbacService, PermissionsGuard],
})
export class RbacModule {}

