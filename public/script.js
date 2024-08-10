//import { uuid } from 'uuidv4';
//setCookie("sessionId", uuid())

const socket = io("https:///");
const sizeX = 5;
const sizeY = 5;
const numberMine = 20;
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
let numberFlags = 0;
let numberHiddenFields = sizeX * sizeY - numberMine;
const showScore = () => {
  if (numberHiddenFields == 0 && numberFlags == numberMine) {
    $(".score").innerHTML = `You Won!`;
    $(".sapper").onclick = null;
    start = false;
  } else if(start || startTime == 0){
    $(".score-fields").innerHTML = `Fields: ${numberHiddenFields}`;
    $(".score-flags").innerHTML = `Flags: ${numberMine - numberFlags}`;
  }
};
let start = false;
let startTime = 0; 

function init() {
  const container = $(".container");
  container.style.gridTemplateColumns = `repeat(${sizeX}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${sizeY}, 1fr)`;

  showScore();
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
          let field =
            map[e.target.getAttribute("y")][e.target.getAttribute("x")];
          if (field.show || (!field.marked && numberFlags >= numberMine))
            return false;
          field.marked = !field.marked;
          if (field.marked) {
            e.target.classList.add("flag");
            numberFlags++;
          } else {
            e.target.classList.remove("flag");
            numberFlags--;
          }
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
  socket.emit("initMap", map);
}

function showAllMines() {
  map.forEach((y) => {
    y.forEach((e) => {
      if (e.mine && !e.marked) {
        const element = document.getElementById(e.field);
        element.classList.remove("hide");
        element.classList.add("mine");
      }
    });
  });
}

async function showField(x, y) {
  const field = map[y][x];
  console.log("field", x, y);
  
  if (!default_mines.isMineGenarated) {
    default_mines.isMineGenarated = true;
    default_mines.x = x;
    default_mines.y = y;

    start = true;
    startTime = new Date();

    await initMine();
  }
  if (field.marked) {
    return;
  }

  console.log("test");
  
  socket.emit('showField123', x, y, (response) => {
    console.log("backField");
    if(response.status == "lost") {
          $(".score").innerHTML = `You Lost!`;
          $(".sapper").onclick = null;
          start = false;
    }

    for (const [key, value] of Object.entries(response.result)) {
      console.log(`${key}: ${value}`);
      const div = document.getElementById(key);
      div.classList.remove("hide");
      if(value == -1)
        div.classList.add("mine");
      else if(value != 0)
        div.classList.add("mine"+value);
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
  
  return new Promise((resolve) => {
    socket.emit('initMine', numberMine, field_ignored, (response) => {
      console.log("back - mines");
      map = response;
      resolve();
    });
  });
} 

function ShowMap() {
  map.forEach((row) => {
    row.forEach((field) => {
      let div = document.getElementById(field.field);
      if (field.mine || field.closer_mine > 0) {
        div.classList.remove("hide");
        if (field.mine) {
          div.classList.add("mine");
        } else {
          div.classList.add("mine" + field.closer_mine);
        }
      }
    });
  });
}

setInterval(() => {
  if(start) {
    let currentTime = new Date();
    let second = ((currentTime - startTime)/1000).toFixed(0);
    $(".time").innerHTML = second.padStart(3, "0");
  }
}, 500);

init();

//initMine();

//ShowMap();

socket.on("loadMap", (serverMap) => {
  map = serverMap;
  console.log("jest");
});