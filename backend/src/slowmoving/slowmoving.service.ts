import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { SuggestionStatus } from "@prisma/client";

interface SlowMovingQuery {
  storeId?: number;
  categoryId?: number;
}

interface SlowMovingItemResponse {
  id: number;
  storeId: number;
  storeName: string;
  productId: number;
  productName: string;
  productSku: string;
  categoryName: string;
  stock: number;
  slowDays: number;
  lastSaleAt: string;
  suggestionStatus: string;
  suggestion: string;
}

interface OperationTaskResponse {
  id: number;
  slowMovingProductId: number;
  taskName: string;
  taskType: string;
  priority: string;
  status: string;
  assignee: string;
  storeName: string;
  productName: string;
  suggestion: string;
  createdAt: string;
}

@Injectable()
export class SlowmovingService {
  constructor(private prisma: PrismaService) {}

  async getStores() {
    return this.prisma.store.findMany({
      orderBy: { id: "asc" },
    });
  }

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { id: "asc" },
    });
  }

  async getSlowMovingProducts(query: SlowMovingQuery) {
    const whereClause: any = {};

    if (query.storeId) {
      whereClause.storeId = query.storeId;
    }

    if (query.categoryId) {
      whereClause.product = {
        categoryId: query.categoryId,
      };
    }

    const items = await this.prisma.slowMovingProduct.findMany({
      where: whereClause,
      include: {
        store: true,
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { slowDays: "desc" },
    });

    const result: SlowMovingItemResponse[] = items.map((item) => ({
      id: item.id,
      storeId: item.storeId,
      storeName: item.store.name,
      productId: item.productId,
      productName: item.product.name,
      productSku: item.product.sku,
      categoryName: item.product.category.name,
      stock: item.stock,
      slowDays: item.slowDays,
      lastSaleAt: item.lastSaleAt ? item.lastSaleAt.toISOString() : "",
      suggestionStatus: item.suggestionStatus,
      suggestion: item.suggestion || "",
    }));

    return {
      total: result.length,
      redAlertCount: result.filter((item) => item.slowDays > 20).length,
      items: result,
    };
  }

  async acceptSuggestion(id: number) {
    const item = await this.prisma.slowMovingProduct.findUnique({
      where: { id },
      include: {
        store: true,
        product: true,
      },
    });

    if (!item) {
      throw new Error("记录不存在");
    }

    if (item.suggestionStatus === SuggestionStatus.ACCEPTED) {
      return { success: false, message: "该建议已采纳" };
    }

    const existingTask = await this.prisma.operationTask.findUnique({
      where: { slowMovingProductId: id },
    });

    if (existingTask) {
      return { success: false, message: "该建议已生成运营任务" };
    }

    await this.prisma.slowMovingProduct.update({
      where: { id },
      data: {
        suggestionStatus: SuggestionStatus.ACCEPTED,
      },
    });

    const priority = item.slowDays > 30 ? "高" : item.slowDays > 20 ? "中" : "低";
    const taskType = item.slowDays > 30 ? "清仓促销" : "库存调拨";

    const task = await this.prisma.operationTask.create({
      data: {
        slowMovingProductId: id,
        taskName: `${item.store.name}-${item.product.name}-滞销处理`,
        taskType,
        priority,
        status: "待处理",
        assignee: "运营组",
        storeName: item.store.name,
        productName: item.product.name,
        suggestion: item.suggestion || "",
      },
    });

    const taskResponse: OperationTaskResponse = {
      id: task.id,
      slowMovingProductId: task.slowMovingProductId,
      taskName: task.taskName,
      taskType: task.taskType,
      priority: task.priority,
      status: task.status,
      assignee: task.assignee,
      storeName: task.storeName,
      productName: task.productName,
      suggestion: task.suggestion,
      createdAt: task.createdAt.toISOString(),
    };

    return {
      success: true,
      message: "已采纳，运营任务已生成",
      task: taskResponse,
    };
  }

  async rejectSuggestion(id: number) {
    const item = await this.prisma.slowMovingProduct.findUnique({
      where: { id },
    });

    if (!item) {
      throw new Error("记录不存在");
    }

    if (item.suggestionStatus === SuggestionStatus.REJECTED) {
      return { success: false, message: "该建议已驳回" };
    }

    if (item.suggestionStatus === SuggestionStatus.ACCEPTED) {
      return { success: false, message: "该建议已采纳，无法驳回" };
    }

    await this.prisma.slowMovingProduct.update({
      where: { id },
      data: {
        suggestionStatus: SuggestionStatus.REJECTED,
      },
    });

    return {
      success: true,
      message: "已驳回",
    };
  }

  async getOperationTasks() {
    const tasks = await this.prisma.operationTask.findMany({
      orderBy: { id: "desc" },
    });

    return tasks.map((task): OperationTaskResponse => ({
      id: task.id,
      slowMovingProductId: task.slowMovingProductId,
      taskName: task.taskName,
      taskType: task.taskType,
      priority: task.priority,
      status: task.status,
      assignee: task.assignee,
      storeName: task.storeName,
      productName: task.productName,
      suggestion: task.suggestion,
      createdAt: task.createdAt.toISOString(),
    }));
  }
}
