import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AppContext } from "./context/app-context";
import { useRef, useEffect, useState } from "react";
import { loadScript } from "@yuno-payments/sdk-web";
import type { SdkPaymentsInstance } from "@yuno-payments/sdk-web-types";

const PUBLIC_API_KEY = "";
const CHECKOUT_SESSION = "";

type YunoInstanceWithCanary = SdkPaymentsInstance & { setCanaryMode: (enabled: boolean) => void };

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
  const [yunoInstance, setYunoInstance] = useState<SdkPaymentsInstance | null>(null);
  const [canaryMode, setCanaryModeState] = useState(() => localStorage.getItem("canary-mode") === "true");

  useEffect(() => {
    const createYunoInstance = async () => {
      const yuno = await loadScript();
      const instance = await yuno.initialize(PUBLIC_API_KEY);
      // apply persisted canary preference to the new instance
      if (localStorage.getItem("canary-mode") === "true") {
        (instance as YunoInstanceWithCanary).setCanaryMode(true);
      }
      setYunoInstance(instance);
    };
    if (instanceFlag.current === 0) {
      createYunoInstance();
      instanceFlag.current = 1;
    }
  }, []);

  const handleCanaryToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    localStorage.setItem("canary-mode", String(enabled));
    setCanaryModeState(enabled);
    if (yunoInstance) {
      // setCanaryMode is available on the SDK instance at runtime
      (yunoInstance as YunoInstanceWithCanary).setCanaryMode(enabled);
    }
  };

  // keep the toggle visible while the SDK loads: pre-init changes are
  // persisted and applied right after the instance is created
  const canaryToggle = (
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
  );

  if (!yunoInstance) {
    return (
      <>
        {canaryToggle}
        <div>Loading...</div>
      </>
    );
  }

  return (
    <AppContext.Provider
      value={{
        checkoutSession: CHECKOUT_SESSION,
        yunoInstance,
        countryCode: "CO",
        canaryMode,
        setCanaryMode: (enabled: boolean) => {
          localStorage.setItem("canary-mode", String(enabled));
          setCanaryModeState(enabled);
          (yunoInstance as YunoInstanceWithCanary).setCanaryMode(enabled);
        },
      }}
    >
      {canaryToggle}
      <RouterProvider router={router} />
    </AppContext.Provider>
  );
};
