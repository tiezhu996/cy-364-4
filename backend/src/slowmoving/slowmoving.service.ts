import { Injectable } from "@nestjs/common";
import { slowMovingProducts, stores, categories, operationTasks } from "./slowmoving.data";

interface SlowMovingQuery {
  storeId?: number;
  categoryId?: number;
}

interface SlowMovingItem {
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

interface OperationTask {
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
  getStores() {
    return stores;
  }

  getCategories() {
    return categories;
  }

  getSlowMovingProducts(query: SlowMovingQuery) {
    let result: SlowMovingItem[] = [...slowMovingProducts];

    if (query.storeId) {
      result = result.filter(item => item.storeId === query.storeId);
    }

    if (query.categoryId) {
      const category = categories.find(c => c.id === query.categoryId);
      if (category) {
        result = result.filter(item => item.categoryName === category.name);
      }
    }

    result.sort((a, b) => b.slowDays - a.slowDays);

    return {
      total: result.length,
      redAlertCount: result.filter(item => item.slowDays > 20).length,
      items: result,
    };
  }

  acceptSuggestion(id: number) {
    const item = slowMovingProducts.find(p => p.id === id);
    if (!item) {
      throw new Error("记录不存在");
    }

    if (item.suggestionStatus === "ACCEPTED") {
      return { success: false, message: "该建议已采纳" };
    }

    item.suggestionStatus = "ACCEPTED";

    const taskId = operationTasks.length + 1;
    const priority = item.slowDays > 30 ? "高" : item.slowDays > 20 ? "中" : "低";
    const taskType = item.slowDays > 30 ? "清仓促销" : "库存调拨";

    const task: OperationTask = {
      id: taskId,
      slowMovingProductId: id,
      taskName: `${item.storeName}-${item.productName}-滞销处理`,
      taskType,
      priority,
      status: "待处理",
      assignee: "运营组",
      storeName: item.storeName,
      productName: item.productName,
      suggestion: item.suggestion || "",
      createdAt: new Date().toISOString(),
    };

    operationTasks.push(task);

    return {
      success: true,
      message: "已采纳，运营任务已生成",
      task,
    };
  }

  rejectSuggestion(id: number) {
    const item = slowMovingProducts.find(p => p.id === id);
    if (!item) {
      throw new Error("记录不存在");
    }

    if (item.suggestionStatus === "REJECTED") {
      return { success: false, message: "该建议已驳回" };
    }

    item.suggestionStatus = "REJECTED";

    return {
      success: true,
      message: "已驳回",
    };
  }

  getOperationTasks() {
    return operationTasks.sort((a, b) => b.id - a.id);
  }
}
