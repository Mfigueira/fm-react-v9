import { render } from "vitest-browser-react";
import { expect, test } from "vitest";
import Header from "../Header";
import {
  RouterProvider,
  createRouter,
  createRootRoute,
} from "@tanstack/react-router";
import { CartContext } from "../contexts";
import type { CartContextType } from "../contexts";

test("correctly renders a header with a zero cart count", async () => {
  const rootRoute = createRootRoute({
    component: () => (
      <CartContext.Provider value={[[], () => {}] as CartContextType}>
        <Header />
      </CartContext.Provider>
    ),
  });

  const router = createRouter({ routeTree: rootRoute });
  const screen = render(<RouterProvider router={router}></RouterProvider>);

  const itemsInCart = (await screen).getByTestId("cart-number");

  await expect.element(itemsInCart).toBeInTheDocument();
  await expect.element(itemsInCart).toHaveTextContent("0");
});

test("correctly renders a header with a three cart count", async () => {
  const fakeCart = [
    { pizza: { id: "1", name: "", category: "", description: "", image: "", sizes: { S: 1, M: 1, L: 1 } }, size: "M" as const, price: "" },
    { pizza: { id: "2", name: "", category: "", description: "", image: "", sizes: { S: 1, M: 1, L: 1 } }, size: "M" as const, price: "" },
    { pizza: { id: "3", name: "", category: "", description: "", image: "", sizes: { S: 1, M: 1, L: 1 } }, size: "M" as const, price: "" },
  ];

  const rootRoute = createRootRoute({
    component: () => (
      <CartContext.Provider value={[fakeCart, () => {}]}>
        <Header />
      </CartContext.Provider>
    ),
  });

  const router = createRouter({ routeTree: rootRoute });
  const screen = render(<RouterProvider router={router}></RouterProvider>);

  const itemsInCart = (await screen).getByTestId("cart-number");

  await expect.element(itemsInCart).toBeInTheDocument();
  await expect.element(itemsInCart).toHaveTextContent("3");
});
