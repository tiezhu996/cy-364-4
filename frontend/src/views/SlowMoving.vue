<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  fetchStores,
  fetchCategories,
  fetchSlowMovingProducts,
  acceptSuggestion,
  rejectSuggestion,
  fetchOperationTasks,
} from "../api/client";
import type { Store, Category, SlowMovingItem, OperationTask } from "../types";

interface TableRowParam {
  row: SlowMovingItem;
}

const stores = ref<Store[]>([]);
const categories = ref<Category[]>([]);
const selectedStore = ref<number | undefined>();
const selectedCategory = ref<number | undefined>();
const slowMovingItems = ref<SlowMovingItem[]>([]);
const total = ref(0);
const redAlertCount = ref(0);
const operationTasks = ref<OperationTask[]>([]);
const loading = ref(false);
const activeTab = ref<"list" | "tasks">("list");

async function loadData() {
  loading.value = true;
  try {
    const [storesData, categoriesData, productsData, tasksData] = await Promise.all([
      fetchStores(),
      fetchCategories(),
      fetchSlowMovingProducts(selectedStore.value, selectedCategory.value),
      fetchOperationTasks(),
    ]);
    stores.value = storesData;
    categories.value = categoriesData;
    slowMovingItems.value = productsData.items;
    total.value = productsData.total;
    redAlertCount.value = productsData.redAlertCount;
    operationTasks.value = tasksData;
  } catch {
    ElMessage.error("加载数据失败");
  } finally {
    loading.value = false;
  }
}

function handleStoreChange(value: number | undefined) {
  selectedStore.value = value;
  loadData();
}

function handleCategoryChange(value: number | undefined) {
  selectedCategory.value = value;
  loadData();
}

async function handleAccept(item: SlowMovingItem) {
  try {
    await ElMessageBox.confirm(
      `确认采纳"${item.productName}"的补货建议？采纳后将自动生成运营任务。`,
      "确认采纳",
      { type: "warning" },
    );
    const result = await acceptSuggestion(item.id);
    if (result.success) {
      ElMessage.success(result.message);
      item.suggestionStatus = "ACCEPTED";
      if (result.task) {
        operationTasks.value = [result.task, ...operationTasks.value];
      }
    } else {
      ElMessage.warning(result.message);
    }
  } catch {
    // user cancelled
  }
}

async function handleReject(item: SlowMovingItem) {
  try {
    await ElMessageBox.confirm(
      `确认驳回"${item.productName}"的补货建议？`,
      "确认驳回",
      { type: "info" },
    );
    const result = await rejectSuggestion(item.id);
    if (result.success) {
      ElMessage.success(result.message);
      item.suggestionStatus = "REJECTED";
    } else {
      ElMessage.warning(result.message);
    }
  } catch {
    // user cancelled
  }
}

function resetFilters() {
  selectedStore.value = undefined;
  selectedCategory.value = undefined;
  loadData();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN");
}

function getStatusTagType(status: string): string {
  switch (status) {
    case "ACCEPTED":
      return "success";
    case "REJECTED":
      return "danger";
    default:
      return "warning";
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case "ACCEPTED":
      return "已采纳";
    case "REJECTED":
      return "已驳回";
    default:
      return "待处理";
  }
}

function getPriorityTagType(priority: string): string {
  switch (priority) {
    case "高":
      return "danger";
    case "中":
      return "warning";
    default:
      return "info";
  }
}

const sortedItems = computed(() => {
  return [...slowMovingItems.value].sort((a, b) => b.slowDays - a.slowDays);
});

onMounted(() => {
  loadData();
});
</script>

<template>
  <section class="slowmoving-page">
    <div class="page-header">
      <h2>滞销品分析</h2>
      <p class="page-subtitle">在线查看滞销商品清单，按门店品类筛选，智能补货建议辅助决策</p>
    </div>

    <el-tabs v-model="activeTab" class="main-tabs">
      <el-tab-pane label="滞销清单" name="list">
        <div class="summary-bar">
          <div class="summary-item">
            <span class="summary-label">滞销商品总数</span>
            <span class="summary-value">{{ total }}</span>
          </div>
          <div class="summary-item alert">
            <span class="summary-label">超20天预警</span>
            <span class="summary-value">{{ redAlertCount }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">已采纳建议</span>
            <span class="summary-value">
              {{ slowMovingItems.filter(i => i.suggestionStatus === "ACCEPTED").length }}
            </span>
          </div>
        </div>

        <div class="filter-bar">
          <div class="filter-group">
            <label>门店</label>
            <el-select
              v-model="selectedStore"
              placeholder="选择门店"
              clearable
              style="width: 180px"
              @change="handleStoreChange"
            >
              <el-option
                v-for="store in stores"
                :key="store.id"
                :label="store.name"
                :value="store.id"
              />
            </el-select>
          </div>

          <div class="filter-group">
            <label>品类</label>
            <el-select
              v-model="selectedCategory"
              placeholder="选择品类"
              clearable
              style="width: 180px"
              @change="handleCategoryChange"
            >
              <el-option
                v-for="cat in categories"
                :key="cat.id"
                :label="cat.name"
                :value="cat.id"
              />
            </el-select>
          </div>

          <el-button @click="resetFilters">重置筛选</el-button>
          <el-button type="primary" @click="loadData">刷新数据</el-button>
        </div>

        <div class="table-container" v-loading="loading">
          <el-table
            :data="sortedItems"
            style="width: 100%"
            :row-class-name="({ row }: TableRowParam) => row.slowDays > 20 ? 'red-alert-row' : ''"
            size="default"
          >
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="storeName" label="门店" min-width="110" />
            <el-table-column prop="categoryName" label="品类" min-width="100" />
            <el-table-column prop="productSku" label="SKU" min-width="100" />
            <el-table-column prop="productName" label="商品名称" min-width="160" />
            <el-table-column prop="stock" label="库存" width="80" align="right" />
            <el-table-column
              prop="slowDays"
              label="滞销天数"
              width="110"
              align="right"
              sortable
              :sort-orders="['descending', 'ascending']"
            >
              <template #default="{ row }">
                <span :class="{ 'days-highlight': row.slowDays > 20 }">
                  {{ row.slowDays }} 天
                </span>
              </template>
            </el-table-column>
            <el-table-column label="最后销售" width="110">
              <template #default="{ row }">
                {{ row.lastSaleAt ? formatDate(row.lastSaleAt) : "-" }}
              </template>
            </el-table-column>
            <el-table-column prop="suggestion" label="补货建议" min-width="280">
              <template #default="{ row }">
                <div class="suggestion-text">{{ row.suggestion }}</div>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.suggestionStatus)" size="small">
                  {{ getStatusText(row.suggestionStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.suggestionStatus === 'PENDING'"
                  type="primary"
                  size="small"
                  @click="handleAccept(row)"
                >
                  采纳
                </el-button>
                <el-button
                  v-if="row.suggestionStatus === 'PENDING'"
                  size="small"
                  @click="handleReject(row)"
                >
                  驳回
                </el-button>
                <span v-else class="action-done">-</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="legend-bar">
          <span class="legend-item">
            <span class="legend-dot red"></span>
            滞销超过20天（预警）
          </span>
          <span class="legend-item">
            数据按滞销天数从长到短自动排序
          </span>
        </div>
      </el-tab-pane>

      <el-tab-pane label="运营任务" name="tasks">
        <div class="tasks-container">
          <div v-if="operationTasks.length === 0" class="empty-state">
            <el-empty description="暂无运营任务，采纳滞销品建议后将自动生成" />
          </div>
          <el-table
            v-else
            :data="operationTasks"
            style="width: 100%"
            size="default"
          >
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="taskName" label="任务名称" min-width="220" />
            <el-table-column prop="taskType" label="任务类型" width="100" />
            <el-table-column prop="priority" label="优先级" width="90">
              <template #default="{ row }">
                <el-tag :type="getPriorityTagType(row.priority)" size="small">
                  {{ row.priority }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag type="warning" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="assignee" label="负责人" width="100" />
            <el-table-column prop="storeName" label="门店" min-width="110" />
            <el-table-column prop="productName" label="商品" min-width="160" />
            <el-table-column prop="suggestion" label="处理建议" min-width="260" />
            <el-table-column label="创建时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </section>
</template>

<style scoped>
.slowmoving-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: var(--el-text-color-primary);
}

.page-subtitle {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.main-tabs {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 8px 16px;
}

.summary-bar {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item.alert .summary-value {
  color: var(--el-color-danger);
}

.summary-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.summary-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.table-container {
  background: var(--el-bg-color);
  border-radius: 8px;
  overflow: hidden;
}

:deep(.red-alert-row) {
  background-color: rgba(245, 108, 108, 0.1) !important;
}

:deep(.red-alert-row:hover > td) {
  background-color: rgba(245, 108, 108, 0.15) !important;
}

.days-highlight {
  font-weight: 600;
  color: var(--el-color-danger);
}

.suggestion-text {
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-primary);
}

.action-done {
  color: var(--el-text-color-placeholder);
}

.legend-bar {
  display: flex;
  gap: 24px;
  margin-top: 12px;
  padding: 0 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.legend-dot.red {
  background: var(--el-color-danger);
  opacity: 0.7;
}

.tasks-container {
  padding-top: 8px;
}

.empty-state {
  padding: 60px 0;
}
</style>
