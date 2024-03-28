//express server
import express from "express";
import path from "path";

const __dirname = path.resolve();
const app = express();

//serve static files from static directory
app.use(express.static("static"));

app.get("/", (req, res) => {
  //return index.html
  res.sendFile(__dirname + "/index.html");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
