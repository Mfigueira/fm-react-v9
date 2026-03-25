import type { PastOrder } from "../types";

export default async function getPastOrders(
  page: number,
): Promise<PastOrder[]> {
  const apiUrl = import.meta.env.VITE_API_URL ?? "";
  const response = await fetch(`${apiUrl}/api/past-orders?page=${page}`);
  const data: PastOrder[] = await response.json();
  return data;
}
