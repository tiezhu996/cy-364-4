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

export const stores = [
  { id: 1, name: "朝阳门店", code: "ST001", address: "北京市朝阳区建国路88号" },
  { id: 2, name: "海淀店", code: "ST002", address: "北京市海淀区中关村大街1号" },
  { id: 3, name: "西城店", code: "ST003", address: "北京市西城区西单北大街100号" },
  { id: 4, name: "东城店", code: "ST004", address: "北京市东城区王府井大街50号" },
];

export const categories = [
  { id: 1, name: "食品饮料", code: "CAT001" },
  { id: 2, name: "日用百货", code: "CAT002" },
  { id: 3, name: "家居用品", code: "CAT003" },
  { id: 4, name: "个人护理", code: "CAT004" },
  { id: 5, name: "休闲零食", code: "CAT005" },
];

export const products = [
  { id: 1, sku: "SKU001", name: "进口橄榄油500ml", barcode: "6901234567890", spec: "500ml/瓶", categoryId: 1 },
  { id: 2, sku: "SKU002", name: "有机大米5kg", barcode: "6901234567891", spec: "5kg/袋", categoryId: 1 },
  { id: 3, sku: "SKU003", name: "洗衣液2kg", barcode: "6901234567892", spec: "2kg/瓶", categoryId: 2 },
  { id: 4, sku: "SKU004", name: "抽纸3层120抽", barcode: "6901234567893", spec: "24包/箱", categoryId: 2 },
  { id: 5, sku: "SKU005", name: "不粘锅炒锅", barcode: "6901234567894", spec: "32cm", categoryId: 3 },
  { id: 6, sku: "SKU006", name: "保温杯500ml", barcode: "6901234567895", spec: "500ml", categoryId: 3 },
  { id: 7, sku: "SKU007", name: "洗发水750ml", barcode: "6901234567896", spec: "750ml/瓶", categoryId: 4 },
  { id: 8, sku: "SKU008", name: "牙膏120g", barcode: "6901234567897", spec: "120g/支", categoryId: 4 },
  { id: 9, sku: "SKU009", name: "坚果礼盒1kg", barcode: "6901234567898", spec: "1kg/盒", categoryId: 5 },
  { id: 10, sku: "SKU010", name: "巧克力礼盒", barcode: "6901234567899", spec: "200g/盒", categoryId: 5 },
  { id: 11, sku: "SKU011", name: "红酒750ml", barcode: "6901234567900", spec: "750ml/瓶", categoryId: 1 },
  { id: 12, sku: "SKU012", name: "蜂蜜500g", barcode: "6901234567901", spec: "500g/瓶", categoryId: 1 },
];

function generateSlowDays(): number {
  const base = Math.floor(Math.random() * 40) + 10;
  return base;
}

function generateSuggestion(productName: string, slowDays: number, stock: number): string {
  if (slowDays > 30 && stock > 50) {
    return `建议下架促销，${productName}滞销${slowDays}天，库存${stock}件，建议打8折清仓`;
  } else if (slowDays > 20) {
    return `建议调拨处理，${productName}滞销${slowDays}天，可调至销售较好门店`;
  } else {
    return `建议关注，${productName}滞销${slowDays}天，可考虑搭配促销`;
  }
}

export const slowMovingProducts: SlowMovingItem[] = (() => {
  const data: SlowMovingItem[] = [];
  let id = 1;
  const productNames = products.map(p => ({ ...p, category: categories.find(c => c.id === p.categoryId)?.name ?? "未分类" }));

  for (const store of stores) {
    const productCount = Math.floor(Math.random() * 4) + 4;
    const shuffled = [...productNames].sort(() => Math.random() - 0.5);
    for (let i = 0; i < productCount; i++) {
      const product = shuffled[i];
      const slowDays = generateSlowDays();
      const stock = Math.floor(Math.random() * 80) + 20;
      const daysSinceSale = slowDays;
      const lastSaleAt = new Date();
      lastSaleAt.setDate(lastSaleAt.getDate() - daysSinceSale);

      data.push({
        id,
        storeId: store.id,
        storeName: store.name,
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        categoryName: product.category,
        stock,
        slowDays,
        lastSaleAt: lastSaleAt.toISOString(),
        suggestionStatus: "PENDING",
        suggestion: generateSuggestion(product.name, slowDays, stock),
      });
      id++;
    }
  }

  return data.sort((a, b) => b.slowDays - a.slowDays);
})();

export const operationTasks: OperationTask[] = [];
