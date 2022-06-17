console.log('Hello Anime Page');

window.onload = (event) => {
    let page = document.querySelector('.page1');
    if (!page) {
        setTimeout(() => {
            let element = document.querySelector(".reviewsDiv");
            element.scrollIntoView({ behavior: "smooth" });
        }, "200")
    }
};