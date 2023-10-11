import type { YunoInstance } from "../types";
import { YunoContext } from "./YunoContext";

type Props = {
  children: React.ReactNode;
  client: YunoInstance;
};

export function YunoProvider(props: Props) {
  const { children, client } = props;

  return (
    <YunoContext.Provider value={{ client }}>{children}</YunoContext.Provider>
  );
}
