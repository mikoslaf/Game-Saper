//import { uuid } from 'uuidv4';
//setCookie("sessionId", uuid())

const socket = io("https:///");
const sizeX = 20;
const sizeY = 20;
const numberMine = 50;
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
  //console.log(x, y, field);

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
  if (field.mine) {
    showAllMines();
    $(".score").innerHTML = `You Lost!`;
    $(".sapper").onclick = null;
    start = false;
    return false;
  } else if (field.closer_mine == 0) {
    if (!field.show) {
      numberHiddenFields--;
    }
    field.show = true;
    const element = document.getElementById(field.field);
    element.classList.remove("hide");

    offsetMap.forEach((off) => {
      const chech_Y = y + off[0];
      const chech_X = x + off[1];

      if (
        chech_X >= 0 &&
        chech_Y >= 0 &&
        chech_X < sizeX &&
        chech_Y < sizeY
      ) {
        const local_field = map[chech_Y][chech_X];
        if (local_field.closer_mine == 0 && !local_field.show)
          showField(chech_X, chech_Y);
        else if (!local_field.show) {
          numberHiddenFields--;
          local_field.show = true;
          const localElement = document.getElementById(local_field.field);
          localElement.classList.add("mine" + local_field.closer_mine);
          localElement.classList.remove("hide");
        }
      }
    });
  } else {
    if (!field.show) {
      numberHiddenFields--;
      field.show = true;
      const element = document.getElementById(field.field);
      element.classList.remove("hide");
      element.classList.add("mine" + field.closer_mine);
    }
  }
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
      console.log("back");
      map = response;
      resolve();
    });
  });
} 
  // while (count_mine > 0) {
  //   const x = Math.floor(Math.random() * sizeX);
  //   const y = Math.floor(Math.random() * sizeY);
    
  //   //console.log(field_ignored.filter(e=>e==[y,x]));
  //   if (
  //     !map[y][x].mine &&
  //     field_ignored.filter((e) => e[0] == y && e[1] == x).length == 0
  //   ) {
  //     map[y][x].mine = true;
  //     count_mine--;
  //     initNumberOfMines(x, y);
  //   }
  // }


function initNumberOfMines(x, y) {
  offsetMap.forEach((off) => {
    const chech_Y = y + off[0];
    const chech_X = x + off[1];

    if (chech_X >= 0 && chech_Y >= 0 && chech_X < sizeX && chech_Y < sizeY) {
      map[chech_Y][chech_X].closer_mine++;
    }
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