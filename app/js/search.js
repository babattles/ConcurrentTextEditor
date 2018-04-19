var searchBtn = document.getElementById("searchBtn");
var searchCloseBtn = document.getElementById("searchCloseBtn");
var searchWindow = document.getElementById("searchWindow");
var searchInput = document.getElementById("searchInput");
var submitSearchBtn = document.getElementById("submitSearchBtn");
var radioEmail = document.getElementById("radioEmail");
var radioUsername = document.getElementById("radioUsername");

var newDiv = document.createElement("div");

searchBtn.addEventListener("click", function () {
    searchWindow.classList.toggle("hidden");
    clearSearch();
});

submitSearchBtn.addEventListener("click", function () {
    var input = searchInput.value;
    if (input === "") {
        alert("Must enter search terms");
        return;
    }
    if (radioEmail.checked) {
        database.ref().child('users').orderByChild('email').equalTo(input).once('value', function (snap) {
            if (snap.numChildren() == 1) {
                snap.forEach(function (child) {
                    var result = child.val();
                    if (result) {
                        // close the window
                        searchWindow.classList.toggle("hidden");
                        clearSearch();
                        // add the username to the invite box
                        var usernameField = document.getElementById("username");
                        usernameField.value = result.username;
                        return;
                    } else {
                        alert("No user found with given email");
                        return;
                    }
                });
            }
        });
    } else if (radioUsername.checked) {
        clearSearch();
        var div = document.getElementById("searchWindow");
        var label = document.createElement("label");
        label.innerHTML = "Results";
        label.style.color = "white";
        newDiv.appendChild(label);
        var list = document.createElement("list");
        database.ref().child('users').orderByChild('username').startAt(input).endAt(input + "\uf8ff").once('value', function (snap) {
            snap.forEach(function (child) {
                var result = child.val();
                var li = document.createElement("li");
                li.textContent = result.username;
                li.value = result.username;
                li.style.color = "blue";
                li.style.background = "gray";
                li.style.cursor = "copy"
                li.onclick = function () {
                    // close the window
                    searchWindow.classList.toggle("hidden");
                    clearSearch();
                    // add the username to the invite box
                    var usernameField = document.getElementById("username");
                    usernameField.value = result.username;
                    // clear results list
                    div.removeChild(newDiv);
                    return;
                }
                list.appendChild(li);
            });
            if (list.childElementCount) {
                newDiv.appendChild(list);
                div.appendChild(newDiv);
            } else {
                alert("No results for the provided search string");
                clearSearch();
                return;
            }
        });
    } else {
        alert("You must first select Email or Username");
        return;
    }
});

searchCloseBtn.addEventListener("click", function () {
    searchWindow.classList.toggle("hidden");
    clearSearch();
});

var clearSearch = function () {
    searchInput.value = "";
    radioEmail.checked = false;
    radioUsername.check = false;
    while (newDiv.firstChild) {
        newDiv.removeChild(newDiv.firstChild);
    }
}