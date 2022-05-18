console.log("dada esti in index.js :D");

const animeCards = document.querySelectorAll(".card-img-top");
const animeButton = document.querySelectorAll(".anime-button");

animeCards.forEach((card, index) => {
    card.addEventListener("mouseover", function (event) {
    animeButton[index].style.display = "block";
    });
});

animeCards.forEach((card, index) => {
    card.addEventListener("mouseout", function (event) {
    animeButton[index].style.display = "none";
    });
});

animeCards.forEach((card, index) => {
    card.addEventListener("click", function (event) {
    console.log("click card : " + index);
    });
});