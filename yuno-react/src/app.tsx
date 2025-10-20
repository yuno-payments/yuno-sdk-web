import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AppContext } from "./context/app-context";
import { useRef, useEffect, useState } from "react";
import { loadScript } from "@yuno-payments/sdk-web";
import type { YunoInstance } from "@yuno-payments/sdk-web-types";

const PUBLIC_API_KEY = "";
const CHECKOUT_SESSION = "";

export const App = () => {
  const instanceFlag = useRef(0);
  const [yunoInstance, setYunoInstance] = useState<YunoInstance | null>(null);

  useEffect(() => {
    const createYunoInstance = async () => {
      const yuno = await loadScript();
      const yunoInstance = await yuno.initialize(PUBLIC_API_KEY);
      setYunoInstance(yunoInstance);
    };
    if (instanceFlag.current === 0) {
      createYunoInstance();
      instanceFlag.current = 1;
    }
  }, []);

  if (!yunoInstance) {
    return <div>Loading...</div>;
  }

  return (
    <AppContext.Provider
      value={{
        checkoutSession: CHECKOUT_SESSION,
        yunoInstance,
        countryCode: "CO",
      }}
    >
      <RouterProvider router={router} />
    </AppContext.Provider>
  );
};
