<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { APP_CODE, APP_NAME } from "./constants/app";
import { REQUEST_MESSAGES } from "./constants/messages";
import { routes } from "./routes";

const route = useRoute();
const router = useRouter();
const activeRoute = ref(route.path);

watch(
  () => route.path,
  (newPath) => {
    activeRoute.value = newPath;
  },
);

function goHealth() {
  window.location.href = REQUEST_MESSAGES.healthPath;
}

function navigateTo(path: string) {
  router.push(path);
}
</script>

<template>
  <main class="app-shell">
    <header class="topbar">
      <div>
        <span class="brand-code">{{ APP_CODE }}</span>
        <h1 class="brand-title">{{ APP_NAME }}</h1>
      </div>
      <el-button type="primary" @click="goHealth">API Health</el-button>
    </header>

    <nav class="nav-tabs">
      <el-menu
        :default-active="activeRoute"
        mode="horizontal"
        @select="navigateTo"
        class="nav-menu"
      >
        <el-menu-item
          v-for="r in routes"
          :key="r.path"
          :index="r.path"
        >
          {{ r.label }}
        </el-menu-item>
      </el-menu>
    </nav>

    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </main>
</template>

<style scoped>
.nav-tabs {
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 0 24px;
}

.nav-menu {
  border-bottom: none;
}
</style>
