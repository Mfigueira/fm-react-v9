import type { Pizza } from "../types";

export default async function getPizzaTypes(): Promise<Pizza[]> {
  const apiUrl = import.meta.env.VITE_API_URL ?? "";
  const response = await fetch(`${apiUrl}/api/pizzas`);
  const data: Pizza[] = await response.json();
  return data;
}
