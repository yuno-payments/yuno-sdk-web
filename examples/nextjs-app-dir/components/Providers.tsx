"use client";

import { YunoProvider, type Yuno, YunoInstance } from "@yuno-sdk-web/react";
import Script from "next/script";
import { ReactNode, Suspense, useEffect, useState } from "react";

export default function Providers({ children }: { children: any }) {
  const [yuno] = useState<YunoInstance | undefined>(
    () =>
      (globalThis as any).Yuno?.initialize(
        process.env.NEXT_PUBLIC_PUBLIC_API_KEY!,
      ),
  );

  return (
    <>
      <YunoProvider client={yuno!}>{children}</YunoProvider>
      <Script
        src="https://sdk-web.y.uno/v1/static/js/main.min.js"
        type="text/typescript"
        strategy="beforeInteractive"
      />
    </>
  );
}
