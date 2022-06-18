console.log('Hello Anime Page');

let animeTitle = document.querySelector('.top-level-container').dataset.animetitle;
//console.log(animeTitle);

window.onload = (event) => {
    let page = document.querySelector('.page1');
    if (!page) {
        setTimeout(() => {
            let element = document.querySelector(".reviewsDiv");
            element.scrollIntoView({ behavior: "smooth" });
        }, "200")
    }
};



function addToWatchlistAction() {
    let addButton = document.querySelector('.addButtonDiv');
    addButton.remove();

    let animeLeftDiv = document.querySelector('.animeLeftDiv');

    let addToWatchlistDiv = document.createElement('div');
    animeLeftDiv.appendChild(addToWatchlistDiv);

    addToWatchlistDiv.innerHTML = `<div class="addToWatchlist">
    <form action="/anime/addToWatchlist/${animeTitle}" class='form-div' method="POST">
        <div class="mt-3">
            <label class="form-label" for="status">Status</label>
            <select class="form-select select-status" onChange="selectedStatusChanged()" name="status">
                <option value="" disabled selected="selected">Select a status</option>
                <option value="Completed">Completed</option>
                <option value="Currently watching">Currently watching</option>
                <option value="Planning to watch">Planning to watch</option>
                <option value="Dropped">Dropped</option>
            </select>
        </div>
    </form>
    <button class="btn btn-sm btn-cancel btn-danger mt-2" onclick="cancelAddToWatchlist()" type="button">Cancel</button>
    </div>`;
}

let ratingDiv = undefined;
let submitDiv = undefined;
function selectedStatusChanged() {
    let selected = document.querySelector(".select-status").value;

    if (selected == 'Completed' || selected == 'Currently watching' || selected == 'Planning to watch' || selected == 'Dropped') {
        let formDiv = document.querySelector('.form-div');

        if (selected == 'Completed' || selected == 'Currently watching' || selected == 'Dropped') {
            if (ratingDiv == undefined) {
                ratingDiv = document.createElement('div');


                var selectStatus = document.querySelector(".select-status");

                insertAfter(selectStatus, ratingDiv);
                //formDiv.appendChild(ratingDiv);

                ratingDiv.classList.add('mt-3')
                ratingDiv.innerHTML = `<label class="form-label" for="rating">Rating</label>
            <select class="form-select select-rating"  name="rating">
                <option value="Select a rating" disabled  selected="selected">Select a rating (optional)</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
            </select>`;
            }
        }
        else if (selected == 'Planning to watch') {
            if (ratingDiv != undefined) {
                ratingDiv.remove();
                ratingDiv = undefined;
            }
        }

        if (submitDiv == undefined) {
            submitDiv = document.createElement('div');
            formDiv.appendChild(submitDiv);
            submitDiv.classList.add('mt-3');
            submitDiv.innerHTML = `<button class="btn btn-primary" type="submit">Submit</button>`;
        }
    }
}


function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function cancelAddToWatchlist() {

    let addToWatchlist = document.querySelector('.addToWatchlist');
    addToWatchlist.remove();

    let animeLeftDiv = document.querySelector('.animeLeftDiv');
    let newButtonDiv = document.createElement('div');
    animeLeftDiv.appendChild(newButtonDiv);

    newButtonDiv.innerHTML = `
    <div class="addButtonDiv d-flex justify-content-center my-3">
    <button class="btn btn-primary rounded" onclick='addToWatchlistAction()' type="button">Add to Watchlist</button>
    </div>`;
    ratingDiv = undefined;
    submitDiv = undefined;
}


function showAddCommentForm() {
    const addCommentForm = document.querySelector(".add-comment-form");

    addCommentForm.innerHTML = `
    <div class="col-lg-4 empty-space"></div>
    <div class="content col-lg-4 border border-3 border-dark rounded px-4 py-3">
      <div>
        <h3>Add new comment</h3>
        <hr/>
      </div>
      <form action="/anime/add-new-comment/${animeTitle}" method="POST">
        <div class="mb-3">
        </div>
        <div class="mb-3">
          <label for="floatingTextarea">Comment</label>
          <div class="form-floating"></div>
          <textarea class="form-control" name="message" placeholder="Leave a comment here"></textarea>
        </div>
        <button class="btn btn-primary" type="submit" name="submit" value="submit">Submit</button>
      </form>
    </div>
    <div class="col-lg-4 empty-space"></div>`;

}


function deleteComment(comUuid) {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        const commentDiv = document.getElementById(comUuid);
        commentDiv.remove();
    }
    xhttp.open("DELETE", `http://localhost:3000/anime/delete-comment/${comUuid}/${animeTitle}`);
    xhttp.send();
}
