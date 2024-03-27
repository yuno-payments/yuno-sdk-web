import { useState } from "react";
import type { Yuno } from "@yuno-sdk-web/react";
import { YunoProvider } from "@yuno-sdk-web/react";
import Full from "./components/Full";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Yuno: Yuno;
  }
}

function App() {
  const [yuno] = useState(
    window.Yuno.initialize(import.meta.env.VITE_PUBLIC_API_KEY),
  );

  return (
    <YunoProvider client={yuno}>
      <Full />
    </YunoProvider>
  );
}

export default App;
