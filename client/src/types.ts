export type PizzaSize = "S" | "M" | "L";

export interface Pizza {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  sizes: Record<PizzaSize, number>;
}

export interface CartItem {
  pizza: Pizza;
  size: PizzaSize;
  price: string;
}

export interface PastOrder {
  order_id: number;
  date: string;
  time: string;
}

export interface PastOrderItem {
  pizzaTypeId: string;
  name: string;
  category: string;
  description: string;
  size: PizzaSize;
  image: string;
  quantity: number;
  price: number;
  total: number;
}

export interface PastOrderDetail {
  order: PastOrder & { total: number };
  orderItems: PastOrderItem[];
}

export interface ContactResponse {
  success: string;
}
