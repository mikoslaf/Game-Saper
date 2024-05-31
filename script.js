const size_X = 20;
const size_Y = 20;
const number_mine = 20;
const $ = (n) => document.querySelector(n);
const offsetMap = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]];
let map = [];

function init() {
  const k = $(".container");
  console.log(k);
  k.style.gridTemplateColumns = `repeat(${size_X}, 1fr)`;
  k.style.gridTemplateRows = `repeat(${size_Y}, 1fr)`;

  map = [];
  for (let x = 0; x < size_Y; x++) {
    map.push([]);
    for (let y = 0; y < size_X; y++) {
      let div = document.createElement("div");
      div.className = "field hide";
      // div.innerHTML = "0";

      div.addEventListener(
        "contextmenu",
        (e) => {
          e.preventDefault();
          console.log(e.target);
          
          let field = map[e.target.getAttribute('y')][e.target.getAttribute('x')];
          field.marked = !field.marked;

          if (e.target.classList.contains("hide")) {
            e.target.classList.remove("hide");
            e.target.classList.add("flag");
          } else {
            if (e.target.classList.contains("flag"))
              e.target.classList.remove("flag");
          }

          return false;
        },
        false
      );
      div.setAttribute('x', x);
      div.setAttribute('y', y);


      const Data_mine = { mine: false, closer_mine: 0, field: div, marked: false };
      map[x].push(Data_mine);
      k.append(div);
    }
  }

  console.log(map);
}

function initMine() {
  if(size_X * size_Y < number_mine)
    throw new Error("The number of mines is too high.")
  let count_mine = number_mine;
  while (count_mine > 0) {
    const x = Math.floor(Math.random() * size_X);
    const y = Math.floor(Math.random() * size_Y);

    if (!map[y][x].mine) {
      map[y][x].mine = true;
      count_mine--;
      initNumberOfMines(x, y);
    }
  }
}

function initNumberOfMines(x, y) {
  offsetMap.forEach((off) => {
    const chech_Y = y + off[0];
    const chech_X = x + off[1];

    if (chech_X >= 0 && chech_Y >= 0 && chech_X < size_X && chech_Y < size_Y ) {
      map[chech_Y][chech_X].closer_mine++;
    }
  });
}

function ShowMap() {
  map.forEach((row) => {
    row.forEach((field) => {
      let div = field.field;
      if(field.mine || field.closer_mine > 0) {
        div.classList.remove("hide");
        if(field.mine) {
          div.classList.add("mine");
        } else {
          div.classList.add("mine" + field.closer_mine);
        }
      }
    });
  });
}

init();

initMine();

//ShowMap();