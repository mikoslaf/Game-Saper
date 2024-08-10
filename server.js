const express = require("express");
const socketio = require("socket.io");
require("dotenv").config();

let fs = require("fs");
let https = require("https");
let privateKey = fs.readFileSync("key.key", "utf8");
let certificate = fs.readFileSync("key.crt", "utf8");

let credentials = { key: privateKey, cert: certificate };

const app = express();
let server = https.createServer(credentials, app);

app.use(express.static(__dirname + "/public"));

server.listen(process.env.porthttps, () => {
  console.log(
    "Server started: https://localhost:" + process.env.porthttps + "/"
  );
});

const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let clientDB = {};

const offsetMap = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

io.on("connection", (client) => {
  console.log("Client connected:", client.id);

  if (!(client.id in clientDB)) {
    clientDB[client.id] = {
      map: [],
      numberMine: 0,
      number_flags: 0,
      number_hidden_fields: 0,
    };
  }

  client.on("initMap", (map, numberMine) => {
    clientDB[client.id].map = map;
    clientDB[client.id].numberMine = numberMine;
    clientDB[client.id].number_hidden_fields =
      map.length * map[0].length - numberMine;
  });

  client.on("initMine", (numberMine, field_ignored, callback) => {
    const sizeX = clientDB[client.id].map[0].length;
    const sizeY = clientDB[client.id].map.length;

    while (numberMine > 0) {
      const x = Math.floor(Math.random() * sizeX);
      const y = Math.floor(Math.random() * sizeY);

      if (
        !clientDB[client.id].map[y][x].mine &&
        field_ignored.filter((e) => e[0] === y && e[1] === x).length === 0
      ) {
        clientDB[client.id].map[y][x].mine = true;
        numberMine--;
        offsetMap.forEach((off) => {
          const check_Y = y + off[0];
          const check_X = x + off[1];

          if (
            check_X >= 0 &&
            check_Y >= 0 &&
            check_X < sizeX &&
            check_Y < sizeY
          ) {
            clientDB[client.id].map[check_Y][check_X].closer_mine++;
          }
        });
      }
    }

    callback(clientDB[client.id].map);
  });

  client.on("showScore", (callback) => {
    if (
      clientDB[client.id].number_hidden_fields === 0 &&
      clientDB[client.id].number_flags === clientDB[client.id].numberMine
    ) {
      callback({
        status: true,
      });
    }
    callback({
      status: false,
      fields: clientDB[client.id].number_hidden_fields,
      flags: clientDB[client.id].numberMine - clientDB[client.id].number_flags,
    });
  });

  client.on("updateFlag", (x, y, callaback) => {
    const field = clientDB[client.id].map[y][x];
    if (
      field.show ||
      (!field.marked &&
        clientDB[client.id].number_flags >= clientDB[client.id].numberMine)
    )
      return false;
    field.marked = !field.marked;
    if (field.marked) {
      clientDB[client.id].number_flags++;
      callaback(true);
    } else {
      clientDB[client.id].number_flags--;
      callaback(false);
    }
  });

  client.on("showField", (x, y, callback) => {
    const data = showField(x, y, clientDB[client.id].map);

    callback(data);
  });

  function showField(x, y, map, result = {}) {
    const field = map[y][x];

    if (field.marked) {
      return {
        status: "Marked",
        result: result,
      };
    }

    if (field.mine) {
      map.forEach((row) => {
        row.forEach((e) => {
          if (e.mine && !e.marked) {
            result[e.field] = -1;
          }
        });
      });
      return {
        status: "lost",
        result: result,
      };
    } else if (field.closer_mine === 0) {
      if (!field.show) {
        clientDB[client.id].number_hidden_fields--;
      }
      field.show = true;
      result[field.field] = 0;

      offsetMap.forEach((off) => {
        const check_Y = y + off[0];
        const check_X = x + off[1];

        if (
          check_X >= 0 &&
          check_Y >= 0 &&
          check_X < map[0].length &&
          check_Y < map.length
        ) {
          const local_field = map[check_Y][check_X];
          if (
            local_field.closer_mine === 0 &&
            !local_field.show &&
            !local_field.marked
          ) {
            const data = showField(check_X, check_Y, map, result);
            result = { ...result, ...data.result };
          } else if (!local_field.show && !local_field.marked) {
            clientDB[client.id].number_hidden_fields--;
            local_field.show = true;
            result[local_field.field] = local_field.closer_mine;
          }
        }
      });

      return {
        status: "play",
        result: result,
      };
    } else {
      if (!field.show) {
        clientDB[client.id].number_hidden_fields--;
        field.show = true;
        result[field.field] = field.closer_mine;
        return {
          status: "play",
          result: result,
        };
      }
    }
    return {
      status: "missing",
      result: result,
    };
  }
});
