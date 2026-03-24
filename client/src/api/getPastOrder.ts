import type { PastOrderDetail } from "../types";

export default async function getPastOrder(
  order: number,
): Promise<PastOrderDetail> {
  const apiUrl = import.meta.env.VITE_API_URL ?? "";
  const response = await fetch(`${apiUrl}/api/past-order/${order}`);
  const data: PastOrderDetail = await response.json();
  return data;
}
