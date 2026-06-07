import { Controller, Get, Post, Param, Query } from "@nestjs/common";
import { SlowmovingService } from "./slowmoving.service";

@Controller()
export class SlowmovingController {
  constructor(private readonly slowmovingService: SlowmovingService) {}

  @Get("api/slowmoving/stores")
  apiStores() {
    return this.slowmovingService.getStores();
  }

  @Get("api/slowmoving/categories")
  apiCategories() {
    return this.slowmovingService.getCategories();
  }

  @Get("api/slowmoving/products")
  apiProducts(
    @Query("storeId") storeId?: string,
    @Query("categoryId") categoryId?: string,
  ) {
    const query = {
      storeId: storeId ? parseInt(storeId, 10) : undefined,
      categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
    };
    return this.slowmovingService.getSlowMovingProducts(query);
  }

  @Post("api/slowmoving/products/:id/accept")
  apiAccept(@Param("id") id: string) {
    return this.slowmovingService.acceptSuggestion(parseInt(id, 10));
  }

  @Post("api/slowmoving/products/:id/reject")
  apiReject(@Param("id") id: string) {
    return this.slowmovingService.rejectSuggestion(parseInt(id, 10));
  }

  @Get("api/slowmoving/tasks")
  apiTasks() {
    return this.slowmovingService.getOperationTasks();
  }
}
