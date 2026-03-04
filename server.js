
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, "public")));

let players = {};

wss.on("connection", ws => {
  ws.on("message", msg => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "join") {
        players[data.name] = { gold: 0 };
        broadcast();
      }

      if (data.type === "correct") {
        if (players[data.name]) players[data.name].gold += 1;
        broadcast();
      }

      if (data.type === "steal") {
        const target = data.target;
        if (players[target] && players[target].gold > 0) {
          players[target].gold -= 1;
          players[data.name].gold += 1;
        }
        broadcast();
      }

    } catch(e){}
  });
});

function broadcast(){
  const payload = JSON.stringify({ type:"update", players });
  wss.clients.forEach(c => c.readyState === 1 && c.send(payload));
}

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("Ocean Hotel Live Game running on port " + PORT);
});
