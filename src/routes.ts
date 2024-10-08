import fs from "fs";
import os from "os";
import path from "path";
import Router from "koa-router";
import { handleIncomingMessage } from "./handlers";

const router = new Router();

// Routes
router.post("/webhook", handleIncomingMessage);

// Serve OGG audio files
router.get("/audio/:id.ogg", async (ctx) => {
  const { id } = ctx.params;
  const tmpDir = os.tmpdir();
  const audioFilePath = path.join(tmpDir, `${id}.ogg`);

  try {
    const oggBuffer = await fs.promises.readFile(audioFilePath);

    ctx.set("Content-Type", "audio/ogg");
    ctx.body = oggBuffer;
  } catch (err) {
    ctx.status = 404;
    ctx.body = "Audio file not found";
  }
});

export default router;
