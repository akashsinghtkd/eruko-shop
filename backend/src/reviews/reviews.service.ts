import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  async list() {
    return { items: [], total: 0 };
  }

  async getById(id: string) {
    return { id };
  }

  async create(dto: CreateReviewDto) {
    return { id: 'generated-review-id', ...dto };
  }

  async update(id: string, dto: UpdateReviewDto) {
    return { id, ...dto };
  }

  async changeStatus(id: string, status: string) {
    return { id, status };
  }

  async remove(id: string) {
    return;
  }
}

