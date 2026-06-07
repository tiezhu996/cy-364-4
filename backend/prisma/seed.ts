import { PrismaClient, SuggestionStatus } from "@prisma/client";

const prisma = new PrismaClient();

const stores = [
  { name: "朝阳门店", code: "ST001", address: "北京市朝阳区建国路88号" },
  { name: "海淀店", code: "ST002", address: "北京市海淀区中关村大街1号" },
  { name: "西城店", code: "ST003", address: "北京市西城区西单北大街100号" },
  { name: "东城店", code: "ST004", address: "北京市东城区王府井大街50号" },
];

const categories = [
  { name: "食品饮料", code: "CAT001" },
  { name: "日用百货", code: "CAT002" },
  { name: "家居用品", code: "CAT003" },
  { name: "个人护理", code: "CAT004" },
  { name: "休闲零食", code: "CAT005" },
];

const products = [
  { sku: "SKU001", name: "进口橄榄油500ml", barcode: "6901234567890", spec: "500ml/瓶", categoryCode: "CAT001" },
  { sku: "SKU002", name: "有机大米5kg", barcode: "6901234567891", spec: "5kg/袋", categoryCode: "CAT001" },
  { sku: "SKU003", name: "洗衣液2kg", barcode: "6901234567892", spec: "2kg/瓶", categoryCode: "CAT002" },
  { sku: "SKU004", name: "抽纸3层120抽", barcode: "6901234567893", spec: "24包/箱", categoryCode: "CAT002" },
  { sku: "SKU005", name: "不粘锅炒锅", barcode: "6901234567894", spec: "32cm", categoryCode: "CAT003" },
  { sku: "SKU006", name: "保温杯500ml", barcode: "6901234567895", spec: "500ml", categoryCode: "CAT003" },
  { sku: "SKU007", name: "洗发水750ml", barcode: "6901234567896", spec: "750ml/瓶", categoryCode: "CAT004" },
  { sku: "SKU008", name: "牙膏120g", barcode: "6901234567897", spec: "120g/支", categoryCode: "CAT004" },
  { sku: "SKU009", name: "坚果礼盒1kg", barcode: "6901234567898", spec: "1kg/盒", categoryCode: "CAT005" },
  { sku: "SKU010", name: "巧克力礼盒", barcode: "6901234567899", spec: "200g/盒", categoryCode: "CAT005" },
  { sku: "SKU011", name: "红酒750ml", barcode: "6901234567900", spec: "750ml/瓶", categoryCode: "CAT001" },
  { sku: "SKU012", name: "蜂蜜500g", barcode: "6901234567901", spec: "500g/瓶", categoryCode: "CAT001" },
];

function generateSlowDays(): number {
  return Math.floor(Math.random() * 40) + 10;
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

async function main() {
  console.log("开始播种数据...");

  for (const store of stores) {
    await prisma.store.upsert({
      where: { code: store.code },
      update: {},
      create: store,
    });
  }
  console.log("门店数据已同步");

  for (const category of categories) {
    await prisma.category.upsert({
      where: { code: category.code },
      update: {},
      create: category,
    });
  }
  console.log("品类数据已同步");

  const categoryMap = new Map<string, number>();
  const allCategories = await prisma.category.findMany();
  allCategories.forEach(c => categoryMap.set(c.code, c.id));

  for (const product of products) {
    const categoryId = categoryMap.get(product.categoryCode)!;
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        sku: product.sku,
        name: product.name,
        barcode: product.barcode,
        spec: product.spec,
        categoryId,
      },
    });
  }
  console.log("商品数据已同步");

  const allStores = await prisma.store.findMany();
  const allProducts = await prisma.product.findMany({ include: { category: true } });

  const existingSlowMoving = await prisma.slowMovingProduct.findMany();
  if (existingSlowMoving.length === 0) {
    console.log("生成滞销品数据...");

    for (const store of allStores) {
      const productCount = Math.floor(Math.random() * 4) + 4;
      const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
      for (let i = 0; i < productCount; i++) {
        const product = shuffled[i];
        const slowDays = generateSlowDays();
        const stock = Math.floor(Math.random() * 80) + 20;
        const lastSaleAt = new Date();
        lastSaleAt.setDate(lastSaleAt.getDate() - slowDays);

        await prisma.slowMovingProduct.upsert({
          where: {
            storeId_productId: {
              storeId: store.id,
              productId: product.id,
            },
          },
          update: {},
          create: {
            storeId: store.id,
            productId: product.id,
            stock,
            slowDays,
            lastSaleAt,
            suggestionStatus: SuggestionStatus.PENDING,
            suggestion: generateSuggestion(product.name, slowDays, stock),
          },
        });
      }
    }
    console.log("滞销品数据已生成");
  } else {
    console.log("滞销品数据已存在，跳过生成");
  }

  console.log("数据播种完成！");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
