//express server
import express from "express";
import path from "path";
import dotenv from "dotenv";

import Anthropic from "@anthropic-ai/sdk";

dotenv.config();

const __dirname = path.resolve();
const app = express();

const anthropic = new Anthropic({
  apiKey: process.env["ANTHROPIC_API_KEY"],
});

//serve static files from static directory
app.use("/static", express.static(path.join(__dirname, "/static")));
app.use(express.json());

app.post("/stream/anthropic", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const messages = req.body.messages;

  try {
    const stream = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      messages,
      stream: true,
    });
    for await (const messageStreamEvent of stream) {
      if (messageStreamEvent.delta) {
        res.write(
          `${JSON.stringify({
            message: messageStreamEvent.delta.text,
          })}>>`,
        );
      }
    }

    res.end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/anthropic", async (req, res) => {
  const messages = req.body.messages;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      messages,
    });
    res.json(msg);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/test", async (req, res) => {
  res.json({ message: "Hello, World!" });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
