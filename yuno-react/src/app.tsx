import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AppContext } from "./context/app-context";
import { useRef, useEffect, useState } from "react";
import { loadScript } from "@yuno-payments/sdk-web";
import type { YunoInstance } from "@yuno-payments/sdk-web-types";

const PUBLIC_API_KEY = "";
const CHECKOUT_SESSION = "";

const canaryToggleContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: "12px auto",
  maxWidth: "450px",
  padding: "8px 16px",
  background: "#f1f5f9",
  borderRadius: "6px",
  border: "1px solid #e2e8f0",
};

const canaryToggleLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  cursor: "pointer",
  fontFamily: "'Inter', 'Arial'",
  fontSize: "14px",
  fontWeight: 500,
  color: "#334155",
  userSelect: "none",
};

export const App = () => {
  const instanceFlag = useRef(0);
  const [yunoInstance, setYunoInstance] = useState<YunoInstance | null>(null);
  const [canaryMode, setCanaryModeState] = useState(false);

  useEffect(() => {
    const createYunoInstance = async () => {
      const yuno = await loadScript();
      const instance = await yuno.initialize(PUBLIC_API_KEY);
      setYunoInstance(instance);
    };
    if (instanceFlag.current === 0) {
      createYunoInstance();
      instanceFlag.current = 1;
    }
  }, []);

  const handleCanaryToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setCanaryModeState(enabled);
    if (yunoInstance) {
      // setCanaryMode is available on the SDK instance at runtime
      (yunoInstance as YunoInstance & { setCanaryMode: (enabled: boolean) => void }).setCanaryMode(enabled);
    }
  };

  if (!yunoInstance) {
    return <div>Loading...</div>;
  }

  return (
    <AppContext.Provider
      value={{
        checkoutSession: CHECKOUT_SESSION,
        yunoInstance,
        countryCode: "CO",
        canaryMode,
        setCanaryMode: (enabled: boolean) => {
          setCanaryModeState(enabled);
          (yunoInstance as YunoInstance & { setCanaryMode: (enabled: boolean) => void }).setCanaryMode(enabled);
        },
      }}
    >
      <div style={canaryToggleContainerStyle}>
        <label style={canaryToggleLabelStyle}>
          <input
            type="checkbox"
            id="canary-toggle"
            checked={canaryMode}
            onChange={handleCanaryToggle}
          />
          <span>Canary Mode</span>
        </label>
      </div>
      <RouterProvider router={router} />
    </AppContext.Provider>
  );
};
