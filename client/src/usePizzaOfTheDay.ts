import { useState, useEffect, useDebugValue } from "react";
import type { Pizza } from "./types";

export const usePizzaOfTheDay = (): Pizza | null => {
  const [pizzaOfTheDay, setPizzaOfTheDay] = useState<Pizza | null>(null);

  useDebugValue(pizzaOfTheDay ? pizzaOfTheDay.name : "Loading...");

  useEffect(() => {
    async function fetchPizzaOfTheDay() {
      const apiUrl = import.meta.env.VITE_API_URL ?? "";
      const response = await fetch(`${apiUrl}/api/pizza-of-the-day`);
      const data: Pizza = await response.json();
      setPizzaOfTheDay(data);
    }

    fetchPizzaOfTheDay();
  }, []);

  return pizzaOfTheDay;
};
