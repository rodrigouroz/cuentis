import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: "https://3003e1112e89e653a72926bb820a26d8@o4507979775410176.ingest.us.sentry.io/4508088959434752",
  integrations: [nodeProfilingIntegration()],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions

  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,

  enabled: process.env.NODE_ENV !== "development",
});

import Koa from "koa";
import bodyParser from "koa-bodyparser";
import router from "./routes";
import logger from "./logger";

const app = new Koa();

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
