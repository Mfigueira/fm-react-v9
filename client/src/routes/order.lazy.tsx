import { useState, useContext } from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CartContext } from "../contexts";
import Cart from "../Cart";
import Pizza from "../Pizza";
import getPizzaTypes from "../api/getPizzaTypes";
import postOrder from "../api/postOrder";
import type { Pizza as PizzaType, PizzaSize } from "../types";

const intl = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const Route = createLazyFileRoute("/order")({
  component: Order,
});

function Order() {
  const [pizzaType, setPizzaType] = useState("pepperoni");
  const [pizzaSize, setPizzaSize] = useState<PizzaSize>("M");
  const [cart, setCart] = useContext(CartContext);

  const { isLoading, data: pizzaTypes = [] } = useQuery({
    queryKey: ["pizza-types"],
    queryFn: getPizzaTypes,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { mutate: checkoutOrder, isPending: isOrdering } = useMutation({
    mutationFn: postOrder,
    onSuccess: () => setCart([]),
  });

  const selectedPizza: PizzaType | undefined = pizzaTypes.find(
    (pizza) => pizzaType === pizza.id,
  );
  const price = intl.format(selectedPizza?.sizes[pizzaSize] ?? 0);

  const loading = isLoading || isOrdering;

  return (
    <div className="order-page">
      <div className="order">
        <h2>Create Order</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedPizza) return;
            setCart([
              ...cart,
              { pizza: selectedPizza, size: pizzaSize, price },
            ]);
          }}
        >
          <div>
            <div>
              <label htmlFor="pizza-type">Pizza Type</label>
              <select
                onChange={(e) => setPizzaType(e.target.value)}
                name="pizza-type"
                value={pizzaType}
              >
                {pizzaTypes.map((pizza) => (
                  <option key={pizza.id} value={pizza.id}>
                    {pizza.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pizza-size">Pizza Size</label>
              <div>
                <span>
                  <input
                    onChange={(e) => setPizzaSize(e.target.value as PizzaSize)}
                    checked={pizzaSize === "S"}
                    type="radio"
                    name="pizza-size"
                    value="S"
                    id="pizza-s"
                  />
                  <label htmlFor="pizza-s">Small</label>
                </span>
                <span>
                  <input
                    onChange={(e) => setPizzaSize(e.target.value as PizzaSize)}
                    checked={pizzaSize === "M"}
                    type="radio"
                    name="pizza-size"
                    value="M"
                    id="pizza-m"
                  />
                  <label htmlFor="pizza-m">Medium</label>
                </span>
                <span>
                  <input
                    onChange={(e) => setPizzaSize(e.target.value as PizzaSize)}
                    checked={pizzaSize === "L"}
                    type="radio"
                    name="pizza-size"
                    value="L"
                    id="pizza-l"
                  />
                  <label htmlFor="pizza-l">Large</label>
                </span>
              </div>
            </div>
            <button type="submit">Add to Cart</button>
          </div>
          {loading ? (
            <h3>LOADING …</h3>
          ) : (
            <div className="order-pizza">
              <Pizza
                name={selectedPizza?.name ?? ""}
                description={selectedPizza?.description ?? ""}
                image={selectedPizza?.image}
              />
              <p>{price}</p>
            </div>
          )}
        </form>
      </div>
      {loading ? (
        <h2>LOADING …</h2>
      ) : (
        <Cart checkout={() => checkoutOrder(cart)} cart={cart} />
      )}
    </div>
  );
}
