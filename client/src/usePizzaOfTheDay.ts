import { useDebugValue } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Pizza } from "./types";
import getPizzaOfTheDay from "./api/getPizzaOfTheDay";

export const usePizzaOfTheDay = (): Pizza | undefined => {
  const { data } = useQuery({
    queryKey: ["pizza-of-the-day"],
    queryFn: getPizzaOfTheDay,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  useDebugValue(data ? data.name : "Loading...");

  return data;
};
