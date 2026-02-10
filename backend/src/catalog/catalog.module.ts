import { Module } from '@nestjs/common';
import { BrandsController } from './brands/brands.controller';
import { BrandsService } from './brands/brands.service';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesService } from './categories/categories.service';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { VariantsController } from './variants/variants.controller';
import { VariantsService } from './variants/variants.service';

@Module({
  controllers: [
    BrandsController,
    CategoriesController,
    ProductsController,
    VariantsController,
  ],
  providers: [
    BrandsService,
    CategoriesService,
    ProductsService,
    VariantsService,
  ],
})
export class CatalogModule {}

