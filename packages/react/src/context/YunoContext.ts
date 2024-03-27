import { createContext } from "react";
import { YunoInstance } from "../types";

export const YunoContext = createContext<{ publicApiKey: string }>({
  publicApiKey: "test",
});
