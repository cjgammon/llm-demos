//express server
import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

//import Anthropic from "@anthropic-ai/sdk";

dotenv.config();

const __dirname = path.resolve();
const app = express();

const genAI = new GoogleGenerativeAI(process.env["GEMINI_API_KEY"]);

/*
const anthropic = new Anthropic({
  apiKey: process.env["ANTHROPIC_API_KEY"],
});
*/

//serve static files from static directory
app.use("/static", express.static(path.join(__dirname, "/static")));
app.use(express.json());

/*
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
*/

/*
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
*/

function convertMessagesToHistory(messages) {
  return messages.map((message) => {
    return {
      role: message.role == "assistant" ? "model" : message.role,
      parts: [{ text: message.content }],
    };
  });
}

app.post("/api/google", async (req, res) => {
  const messages = req.body.messages;

  const history = convertMessagesToHistory(messages);
  const prompt = history.pop();

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const chat = model.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 1024,
    },
  });

  const msg = prompt.parts[0].text;

  const result = await chat.sendMessage(msg);
  const response = await result.response;
  const text = response.text();
  res.json({
    content: [
      {
        role: "assistant",
        text: text,
      },
    ],
  });
});

app.post("/stream/google", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const messages = req.body.messages;

  try {
    const history = convertMessagesToHistory(messages);
    const prompt = history.pop();

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 1024,
      },
    });

    const msg = prompt.parts[0].text;

    //const result = await model.generateContentStream([text]);
    const result = await chat.sendMessageStream(msg);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(
        `${JSON.stringify({
          message: chunkText,
        })}>>`,
      );
    }

    res.end();
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
