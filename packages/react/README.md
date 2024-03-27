# @yuno-sdk-web/react

> React SDK Support

## Documentation

## Installation

```bash
    # npm
    npm install @yuno-sdk-web/react

    # Yarn
    yarn add @yuno-sdk-web/react

    #pnpm
    pnpm add @yuno-sdk-web/react
```

## Add public api key environment variable

```.env
VITE_PUBLIC_API_KEY={YUNO_PUBLIC_API_KEY}
```

## Integrate Yuno at the root of your app

```tsx
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
```

## Using Yuno

```tsx
import { useYuno } from "@yuno-sdk-web/react";

import { useEffect } from "react";

export default function Full() {
  const yuno = useYuno();

  useEffect(() => {
    void (async () => {
      if (yuno) {
        await yuno.startCheckout({
          checkoutSession: "{checkout_session_id}",
          elementSelector: "#root-apm-yuno",
          countryCode: "CO",
          language: "es",
          onLoading: () => {},
          async yunoCreatePayment() {
            yuno.continuePayment();
          },
        });
        await yuno.mountCheckout({});
      }
    })();
  }, [yuno]);

  const startYunoPayment = () => {
    yuno?.startPayment();
  };

  return (
    <div className="flex flex-col w-screen h-screen justify-center items-center">
      <div id="root-apm-yuno"></div>
      <button id="button-pay" onClick={startYunoPayment}>
        Pagar Ahora
      </button>
    </div>
  );
}
```
