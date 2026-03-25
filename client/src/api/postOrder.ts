import type { CartItem } from "../types";

export default async function postOrder(cart: CartItem[]): Promise<void> {
  const apiUrl = import.meta.env.VITE_API_URL ?? "";
  const response = await fetch(`${apiUrl}/api/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cart }),
  });

  if (!response.ok) {
    throw new Error("Failed to place order");
  }
}
