import { API_BASE_URL } from "../constants/app";
import type {
  OverviewResponse,
  Store,
  Category,
  SlowMovingResponse,
  SuggestionActionResponse,
  OperationTask,
} from "../types";

export async function fetchOverview(): Promise<OverviewResponse> {
  const response = await fetch(`${API_BASE_URL}/overview`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Overview request failed: ${response.status}`);
  }

  return response.json() as Promise<OverviewResponse>;
}

export async function fetchStores(): Promise<Store[]> {
  const response = await fetch(`${API_BASE_URL}/slowmoving/stores`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Stores request failed: ${response.status}`);
  }

  return response.json() as Promise<Store[]>;
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/slowmoving/categories`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Categories request failed: ${response.status}`);
  }

  return response.json() as Promise<Category[]>;
}

export async function fetchSlowMovingProducts(
  storeId?: number,
  categoryId?: number,
): Promise<SlowMovingResponse> {
  const params = new URLSearchParams();
  if (storeId) params.set("storeId", String(storeId));
  if (categoryId) params.set("categoryId", String(categoryId));

  const url = `${API_BASE_URL}/slowmoving/products${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Slow moving products request failed: ${response.status}`);
  }

  return response.json() as Promise<SlowMovingResponse>;
}

export async function acceptSuggestion(id: number): Promise<SuggestionActionResponse> {
  const response = await fetch(`${API_BASE_URL}/slowmoving/products/${id}/accept`, {
    method: "POST",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Accept suggestion request failed: ${response.status}`);
  }

  return response.json() as Promise<SuggestionActionResponse>;
}

export async function rejectSuggestion(id: number): Promise<SuggestionActionResponse> {
  const response = await fetch(`${API_BASE_URL}/slowmoving/products/${id}/reject`, {
    method: "POST",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Reject suggestion request failed: ${response.status}`);
  }

  return response.json() as Promise<SuggestionActionResponse>;
}

export async function fetchOperationTasks(): Promise<OperationTask[]> {
  const response = await fetch(`${API_BASE_URL}/slowmoving/tasks`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Operation tasks request failed: ${response.status}`);
  }

  return response.json() as Promise<OperationTask[]>;
}
