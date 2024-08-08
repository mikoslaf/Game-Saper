const express = require("express"); // pobieramy klase express do serwera www
const socketio = require("socket.io"); // import biblioteki socketio
// const moment = require('moment');
require("dotenv").config();

// const moment = require('moment'); Baza danych

let fs = require("fs");
let https = require("https");
let privateKey = fs.readFileSync("key.key", "utf8");
let certificate = fs.readFileSync("key.crt", "utf8");

let credentials = { key: privateKey, cert: certificate };

const app = express(); // pobieram instancje serwera

let server = https.createServer(credentials, app);

// definiuje statyczny katalog na pliki, dostępny w sieci
app.use(express.static(__dirname + "/public"));

// otwieramy port 80 dla serwera WWW
server.listen(process.env.porthttps, () => {
  console.log("serwer start: https://localhost:" + process.env.porthttps + "/");
});

// dodanie soketów do komunikacji online
const io = socketio(server, {
  // zgoda na komunikacje z innych adresów internetoweych cors(GET, POST)
  cors: {
    origin: "*", // adresy dozwolone
    methods: ["GET", "POST"], // metody komunikacji
    credentials: true,
  },
});

let clientDB = Map();

// CID('idsoketu') z ClientDB.filter(e=>e.socketid == 'idsoketu')[0]
const CID = (socketid) => clientDB.filter((e) => e.socketid == socketid)[0];
const KID = (idKlienta) => clientDB.filter((e) => e.id == idKlienta)[0];
// function CID1(socketid){
//     return ClientDB.filter(e=>e.socketid == socketid)[0];
// }

function findClientById(socketList, clientId) {
  for (const [socketId, socket] of socketList.entries()) {
    if (socket.data.clientId === clientId) {
      return socket;
    }
  }
  return null; // Zwróć null, jeśli klient o danym id nie został znaleziony
}

function loadmesseges(place) {
  db.all(
    'SELECT * FROM messeges WHERE place = "' + place + '" ORDER BY data DESC LIMIT 50',
    (err, row) => {
      if (err) {
        console.error("Błąd podczas wykonywania zapytania:", err);
        return;
      }

      if (row) {
        io.sockets.emit("loadmesseges", place, row);
      }
    }
  );
}

io.on("connection", (client) => {
  console.log("Klient nawiązał połączenie", client.id);

  if(!clientDB.has(client.id)) {
    clientDB.set(client.id, {
      map: [],
      number_flags: 0,
      number_hidden_fields: 0, 
    });
  }

  client.on("initMap", (sizeX, sizeY, numberMine) => {
      
  });

  // client.on("login", (name, password) => {
  //   console.log("Loguje się " + name);
  //   db.get(
  //     'SELECT name, password FROM users WHERE name = "' + name + '"',
  //     (err, row) => {
  //       if (err) {
  //         console.error("Błąd podczas wykonywania zapytania:", err);
  //         return;
  //       }

  //       if (row) {
  //         if (row.password == password) io.sockets.emit("loginIN", name);
  //         else io.sockets.emit("loginerror");
  //       } else {
  //         const new_accont = db.prepare(
  //           "INSERT INTO users (name, password) VALUES (?, ?)"
  //         );
  //         new_accont.run(name, password);
  //         new_accont.finalize();
  //         io.sockets.emit("loginIN", name);
  //       }
  //     }
  //   );
  // });

  // client.on("wiadomosc", (wiadomosc, userid) => {
  //   let client = CID(client.id);
  //   if (client) {

  //     //console.log(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));

  //     const current_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      
  //     if (userid == "Wszyscy") {
  //       io.sockets.emit("wiadomosc", wiadomosc, client.Klient, current_date);

  //       const new_messeg = db.prepare(
  //         "INSERT INTO messeges (sender, place, messege, data) VALUES (?, ?, ?, ?)"
  //       );
  //       new_messeg.run(client.Klient, "Wszyscy", wiadomosc, current_date);
  //       new_messeg.finalize();


  //     } else {
  //       let odbiorca = KID(userid);
  //       if (odbiorca) {
  //         const foundSocket = findClientById(io.sockets.sockets, userid);
  //         if (foundSocket)
  //           foundSocket.emit("wiadomosc", wiadomosc, client.Klient, current_date, true);
  //         client.emit("wiadomosc", wiadomosc, client.Klient, current_date);

  //         const new_messeg = db.prepare(
  //           "INSERT INTO messeges (sender, place, messege, data) VALUES (?, ?, ?, ?)"
  //         );
  //         new_messeg.run(client.Klient, odbiorca.Klient, wiadomosc, current_date);
  //         new_messeg.finalize();
  //       }
  //     }
  //   }
  // });

  // client.on("witaj", (klientNazwa, idKlienta) => {
  //   console.log("Witaj", klientNazwa, idKlienta);
  //   if (!idKlienta) return;
  //   if (!klientNazwa) return;

  //   let client = KID(idKlienta);
  //   //   console.log(client);
  //   if (!client) {
  //     clientDB.push({
  //       Klient: klientNazwa,
  //       id: idKlienta,
  //       socketid: client.id,
  //     });
  //   } else {
  //     client.Klient = klientNazwa;
  //     client.socketid = client.id;
  //   }
  //   // console.log("Client BD", ClientDB);
  //   loadmesseges("Wszyscy");
  //   io.sockets.emit("goscie", clientDB);
  // });

  // client.on("loadmessegs_server", (place) => {
  //   loadmesseges(place);
  // });
});

/**
 * funkcja licznika odwiedzin dostępna pod adresem http://host/licznik
 *
 * @param {Request} - dane które przychodzą
 * @param {Response} - dane wyjściowe
 */
app.get("/licznik", (req, resp) => {
  // odpowiedź serwera z json, w nim liczba odwiedzin od startu serwera
  //resp.send({ licznik: ++LicznikOdw });
});
