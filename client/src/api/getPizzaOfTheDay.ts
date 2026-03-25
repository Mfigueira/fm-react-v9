import type { Pizza } from "../types";

export default async function getPizzaOfTheDay(): Promise<Pizza> {
  const apiUrl = import.meta.env.VITE_API_URL ?? "";
  const response = await fetch(`${apiUrl}/api/pizza-of-the-day`);
  const data: Pizza = await response.json();
  return data;
}
