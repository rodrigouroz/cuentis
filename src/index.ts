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
