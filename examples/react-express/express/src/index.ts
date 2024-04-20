import express from "express";
import cors from "cors";
import type { CheckoutSessionInput, CustomerInput } from "@yuno-sdk-web/server";
import "dotenv/config";
import { yunoClient } from "./utils/yuno";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.json({ hello: "world" });
});

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
