const socket = io("https:///");
const sizeX = 10;
const sizeY = 10;
const numberMine = 10;
const $ = (n) => document.querySelector(n);
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
let map = [];
let default_mines = { isMineGenarated: false, x: -1, y: -1 };
let start = false;
let startTime = 0;

function init() {
  const container = $(".container");
  container.style.gridTemplateColumns = `repeat(${sizeX}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${sizeY}, 1fr)`;

  map = [];
  for (let y = 0; y < sizeY; y++) {
    map.push([]);
    for (let x = 0; x < sizeX; x++) {
      let div = document.createElement("div");
      div.className = "field hide";
      div.setAttribute("x", x);
      div.setAttribute("y", y);
      const newId = x.toString() + "&" + y.toString();
      div.setAttribute("id", newId);

      div.addEventListener("click", (e) => {
        const x = parseInt(e.target.getAttribute("x"));
        const y = parseInt(e.target.getAttribute("y"));
        showField(x, y);
      });

      div.addEventListener(
        "contextmenu",
        (e) => {
          e.preventDefault();
          socket.emit("updateFlag", x, y, (response) => {
            if (response) e.target.classList.add("flag");
            else e.target.classList.remove("flag");
          });

          showScore();
          return false;
        },
        false
      );

      map[y].push({
        mine: false,
        marked: false,
        show: false,
        closer_mine: 0,
        field: newId,
      });

      container.appendChild(div);
    }
  }
  socket.emit("initMap", map, numberMine);
  showScore();
}

async function showField(x, y) {
  if (!default_mines.isMineGenarated) {
    default_mines.isMineGenarated = true;
    default_mines.x = x;
    default_mines.y = y;

    start = true;
    startTime = new Date();

    await initMine();
  }

  socket.emit("showField", x, y, (response) => {
    if (response.status === "lost") {
      $(".score").innerHTML = `You Lost!`;
      $(".sapper").onclick = null;
      start = false;
    }

    for (const [key, value] of Object.entries(response.result)) {
      const div = document.getElementById(key);
      div.classList.remove("hide");
      if (value === -1) div.classList.add("mine");
      else if (value !== 0) div.classList.add("mine" + value);
    }
  });

  showScore();
}

async function initMine() {
  if (sizeX * sizeY < numberMine)
    throw new Error("The number of mines is too high.");

  let field_ignored = [[default_mines.y, default_mines.x]];

  offsetMap.forEach((off) => {
    const chech_Y = default_mines.y + off[0];
    const chech_X = default_mines.x + off[1];
    field_ignored.push([chech_Y, chech_X]);
  });

  return new Promise((resolve, reject) => {
    socket.emit("initMine", numberMine, field_ignored, (response) => {
      if (response) {
        resolve();
      } else {
        reject(new Error("Failed to initialize mines on the server"));
      }
    });
  });
}

function showScore() {
  socket.emit("showScore", (response) => {
    if (response.status) {
      $(".score").innerHTML = `You Won!`;
      $(".sapper").onclick = null;
      start = false;
    } else if (start || startTime === 0) {
      $(".score-fields").innerHTML = `Fields: ${response.fields}`;
      $(".score-flags").innerHTML = `Flags: ${response.flags}`;
    }
  });
}

setInterval(() => {
  if (start) {
    let currentTime = new Date();
    let second = ((currentTime - startTime) / 1000).toFixed(0);
    $(".time").innerHTML = second.padStart(3, "0");
  }
}, 500);

init();
