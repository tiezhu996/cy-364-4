import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./index";
import type { RouteRecordRaw } from "vue-router";
import Overview from "../views/Overview.vue";
import SlowMoving from "../views/SlowMoving.vue";

const routeRecords: RouteRecordRaw[] = [
  { path: routes[0].path, component: Overview, name: routes[0].label },
  { path: routes[1].path, component: SlowMoving, name: routes[1].label },
  { path: routes[2].path, component: Overview, name: routes[2].label },
  { path: routes[3].path, component: Overview, name: routes[3].label },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routeRecords,
});

export default router;
