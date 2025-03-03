const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

mongoose.connect('mongodb://127.0.0.1:27017/docsDB')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));


const DocumentSchema = new mongoose.Schema({ content: String });
const Document = mongoose.model("Document", DocumentSchema);

app.use(cors());
app.use(express.json());

// API to get the document
app.get("/document", async (req, res) => {
  let doc = await Document.findOne();
  if (!doc) {
    doc = new Document({ content: "" });
    await doc.save();
  }
  res.json(doc);
});

// WebSocket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("update", async (content) => {
    await Document.updateOne({}, { content });
    io.emit("update", content);
  });
cosole.log("starting");
  socket.on("disconnect", () => console.log("User disconnected:", socket.id));
});

server.listen(5000, () => console.log("Server running on port 5000"));
