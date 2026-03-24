import { createContext, Dispatch, SetStateAction } from "react";
import type { CartItem } from "./types";

export type CartContextType = [
  CartItem[],
  Dispatch<SetStateAction<CartItem[]>>,
];

export const CartContext = createContext<CartContextType>([[], () => {}]);
