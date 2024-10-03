import Router from "koa-router";
import { audioStorage, handleIncomingMessage } from "./handlers";

const router = new Router();

// Routes
router.post("/webhook", handleIncomingMessage);

// Serve in-memory OGG audio files
router.get("/audio/:id.ogg", async (ctx) => {
  const { id } = ctx.params;
  const oggBuffer = audioStorage[id];

  if (!oggBuffer) {
    ctx.status = 404;
    ctx.body = "Audio file not found";
    return;
  }

  ctx.set("Content-Type", "audio/ogg");
  ctx.body = oggBuffer;
});

export default router;
