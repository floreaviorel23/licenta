console.log("You're on profile page :D");

function addNewFriend(userName) {
    console.log('add friend');
    let addFriendDiv = document.querySelector(".addFriendDiv");

    addFriendDiv.innerHTML = `<form action="/profile/add-new-friend" class="form-inline" method="POST">
    <div class="form-group mb-2 w-100">
      <label for="newFriend"></label>
      <input type="text" name="newFriend" placeholder="Enter friend username">
    </div>
    <button type="submit" class="btn btn-sm rounded btn-primary ms-1">Add</button>
    <button class="btn btn-sm btn-cancel rounded btn-danger" onclick="cancelAddNewFriend('${userName}')" type="button">Cancel</button>
    </form>
    `;

}

function cancelAddNewFriend(userName) {
    console.log('cancel');
    let addFriendDiv = document.querySelector(".addFriendDiv");

    addFriendDiv.innerHTML = `<button class="btn btn-info btn-edit rounded editDiv" type="button" onclick="addNewFriend('${userName}')" aria-label="Edit">Add Friend<svg class="ms-3 icon icon-tabler icon-tabler-friends" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><circle cx="7" cy="5" r="2"></circle><path d="M5 22v-5l-1 -1v-4a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4l-1 1v5"></path><circle cx="17" cy="5" r="2"></circle><path d="M15 22v-4h-2l2 -6a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1l2 6h-2v4"></path></svg></button>`
}