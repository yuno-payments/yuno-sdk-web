import "dotenv/config";

import { YunoClient } from "@yuno-sdk-web/server";

export const yunoClient = YunoClient.initialize({
  accountCode: process.env.ACCOUNT_CODE!,
  publicApiKey: process.env.PUBLIC_API_KEY!,
  privateSecretKey: process.env.PRIVATE_SECRET_KEY!,
});
