const size_X = 20;
const size_Y = 20;
const number_mine = 20;
const $ = (n) => document.querySelector(n);

function init() {
  const k = $(".container");
  console.log(k);
  k.style.gridTemplateColumns = `repeat(${size_X}, 1fr)`;
  k.style.gridTemplateRows = `repeat(${size_Y}, 1fr)`;

  let template = [];
  for (let x = 0; x < size_Y; x++) {
    template.push([]);
    for (let y = 0; y < size_X; y++) {

      let div = document.createElement("div");
      div.className = "field hide";
      // div.innerHTML = "0";

      div.addEventListener(
        "contextmenu",
        (e) => {
          e.preventDefault();
          console.log(e.target);
          if(e.target.classList.contains("hide")){
            e.target.classList.remove("hide");
            e.target.classList.add("flag");
          } else {
            if(e.target.classList.contains("flag"))
                e.target.classList.remove("flag");
          }

          return false
        },
        false
      );

      let Data_mine = { mine: false, closer_mine: 0, field: div };
      template[x].push(Data_mine);
      k.append(div);
    }
  }

  console.log(template);
}

init();
