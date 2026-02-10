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
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { Permissions } from '../rbac/decorators/permissions.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Permissions('reviews.read')
  @Get()
  async list(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.reviewsService.list();
    return {
      data: result.items,
      meta: {
        total: result.total,
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      },
    };
  }

  @Permissions('reviews.read')
  @Get(':id')
  async getById(@Param('id') id: string) {
    const review = await this.reviewsService.getById(id);
    return { data: review };
  }

  @Permissions('reviews.moderate')
  @Post()
  async create(@Body() dto: CreateReviewDto) {
    const review = await this.reviewsService.create(dto);
    return { data: review };
  }

  @Permissions('reviews.moderate')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
    const review = await this.reviewsService.update(id, dto);
    return { data: review };
  }

  @Permissions('reviews.moderate')
  @Post(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const review = await this.reviewsService.changeStatus(id, body.status);
    return { data: review };
  }

  @Permissions('reviews.moderate')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.reviewsService.remove(id);
    return { data: true };
  }
}

