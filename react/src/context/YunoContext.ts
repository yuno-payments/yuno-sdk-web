import { createContext } from "react";
import { YunoInstance } from "../types";

export const YunoContext = createContext<{ client: YunoInstance | undefined }>({
  client: undefined,
});
