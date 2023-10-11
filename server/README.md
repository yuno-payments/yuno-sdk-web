# @yuno-sdk-web/server

> Node.js SDK Support

## Documentation

## Installation

```bash
    # npm
    npm install @yuno-sdk-web/server

    # Yarn
    yarn add @yuno-sdk-web/server

    #pnpm
    pnpm add @yuno-sdk-web/server
```

## Add environment variables

```.env
# .env
ACCOUNT_CODE=
PUBLIC_API_KEY=
PRIVATE_SECRET_KEY=
```

## Initialize YunoClient

```ts
// utils/yuno.ts
import "dotenv/config";

import { YunoClient } from "@yuno-sdk-web/server";

export const yunoClient = YunoClient.initialize({
  accountCode: process.env.ACCOUNT_CODE,
  publicApiKey: process.env.PUBLIC_API_KEY,
  privateSecretKey: process.env.PRIVATE_SECRET_KEY,
});
```

## Using Yuno

> Express.js example

```ts
// index.ts
import express from "express";
import cors from "cors";
import type { CheckoutSessionInput, CustomerInput } from "@yuno-sdk-web/server";
import "dotenv/config";
import { yunoClient } from "./utils/yuno";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/checkout/sessions", async (req, res) => {
  const body = req.body as CheckoutSessionInput;

  const checkoutSession = await yunoClient.checkoutSessions.create(body);

  res.json(checkoutSession).status(200);
});

app.post("/customers", async (req, res) => {
  const body = req.body as CustomerInput;

  const customer = await yunoClient.customers.create(body);

  res.json(customer).status(200);
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
```
