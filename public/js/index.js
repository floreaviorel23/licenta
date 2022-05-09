console.log("dada esti in index.js");

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