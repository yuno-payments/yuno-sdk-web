import { useEffect } from "react";
import { loadYunoScript } from "@yuno-sdk-web/js";
import { YunoContext } from "./YunoContext";

type Props = {
  children: React.ReactNode;
  publicApiKey: string;
};

export function YunoProvider(props: Props) {
  const { children, publicApiKey } = props;

  useEffect(() => {
    loadYunoScript();
  }, []);

  return (
    <YunoContext.Provider value={{ publicApiKey }}>
      {children}
    </YunoContext.Provider>
  );
}
