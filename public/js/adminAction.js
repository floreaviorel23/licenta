console.log("Admin Action Page");

function addGenreAnime(i) {
    let oldInput = document.getElementById(`input_${i}`);

    if (oldInput.value && oldInput.value != '' && i < 10) {
        //oldInput.setAttribute('disabled', '');

        let oldButton = document.getElementById(`add_button_${i}`);
        oldButton.style.display = 'none';

        let animeGenresDiv = document.querySelector(".anime-genres-div");

        let newCol10 = document.createElement('DIV');
        let newCol2 = document.createElement('DIV');

        animeGenresDiv.appendChild(newCol10);
        animeGenresDiv.appendChild(newCol2);

        i++;
        newCol10.innerHTML = `<input class="mt-1 form-control border rounded border-1" list="dataListOptions" id="input_${i}" placeholder="Enter genre" name="genres"><datalist id="dataListOptions"><option value="Action"></option><option value="Adventure"></option><option value="Fantasy"></option><option value="Drama"></option></datalist>`;
        newCol10.classList.add('col-10');


        newCol2.innerHTML = `<button id='add_button_${i}' class="w-100 mt-1 rounded btn btn-primary" type="button" onclick="addGenreAnime(${i})">Add</button>`
        newCol2.classList.add('col-2');
    }

}


function addCharacterAnime(i) {
    let oldInput = document.getElementById(`input_character_${i}`);

    if (oldInput.value && oldInput.value != '' && i < 10) {
        //oldInput.setAttribute('disabled', '');

        let oldButton = document.getElementById(`add_button_char_${i}`);
        oldButton.style.display = 'none';

        let animeCharactersDiv = document.querySelector(".anime-characters-div");

        let newColChar = document.createElement('DIV');
        let newColVA = document.createElement('DIV');
        let newCol2 = document.createElement('DIV');

        animeCharactersDiv.appendChild(newColChar);
        animeCharactersDiv.appendChild(newColVA);
        animeCharactersDiv.appendChild(newCol2);

        i++;
        newColChar.innerHTML = `<input class="mt-1 form-control border rounded border-1" type="text" id="input_character_${i}" placeholder="Enter character UUID" name="characters">`
        newColChar.classList.add('col-5');

        newColVA.innerHTML = `<input class="mt-1 form-control border rounded border-1" type="text" id="input_va_${i}" placeholder="Enter voice actor UUID" name="va">`
        newColVA.classList.add('col-5');


        newCol2.innerHTML = `<button class="w-100 mt-1 rounded btn btn-primary" type="button" id="add_button_char_${i}" onclick="addCharacterAnime(${i})">Add</button>`
        newCol2.classList.add('col-2');
    }

}