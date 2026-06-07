export interface FeatureItem {
  id: number;
  title: string;
  description: string;
  status: string;
  metric: string;
}

export interface KpiItem {
  label: string;
  value: string;
  trend: string;
  tone: string;
}

export interface OperationRecord {
  key: string;
  name: string;
  owner: string;
  status: string;
  metric: string;
  priority: string;
}

export interface OverviewResponse {
  appName: string;
  appCode: string;
  description: string;
  features: FeatureItem[];
  kpis: KpiItem[];
  records: OperationRecord[];
}

export interface Store {
  id: number;
  name: string;
  code: string;
  address?: string;
}

export interface Category {
  id: number;
  name: string;
  code: string;
}

export interface SlowMovingItem {
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
  suggestionStatus: "PENDING" | "ACCEPTED" | "REJECTED";
  suggestion: string;
}

export interface SlowMovingResponse {
  total: number;
  redAlertCount: number;
  items: SlowMovingItem[];
}

export interface OperationTask {
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

export interface SuggestionActionResponse {
  success: boolean;
  message: string;
  task?: OperationTask;
}
