// special thanks to JMPerez for providing the first JS Spotify API example

var fullAccessToken = '';
var rootDiv = document.getElementById('root');

function login() {
    var CLIENT_ID = 'your client id here';
    var REDIRECT_URI = 'your redirect uri ex: http://000.0.0.0:0000/redirect.html';

    function getLoginURL(scopes) {
        return 'https://accounts.spotify.com/authorize?client_id=' + CLIENT_ID +
            '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
            '&scope=' + encodeURIComponent(scopes.join(' ')) +
            '&response_type=token';
    }

    // call getLoginURL function
    var url = getLoginURL(
        // these are the different permissions, see Spotify API documentation
        ['user-read-private', 'user-read-email', 'user-read-playback-state', 'user-modify-playback-state',
        'user-read-recently-played, user-top-read']
    );

    // dimensions for popup sign in window
    var width = 450,
        height = 730,
        left = (screen.width / 2) - (width / 2),
        top = (screen.height / 2) - (height / 2);

    // add an event listener for a post message from the popup window (sends JSON data)
    window.addEventListener("message", function (event) {
        // this is the last function that gets called
        console.log(event.origin); // your page

        // make sure the origin is from the right page
        if (event.origin === "http://000.0.0.0:0000") {
            var hash = JSON.parse(event.data);

            // make sure the data being sent is the kind that should be sent
            if (hash.type == 'access_token') {
                fullAccessToken = (hash.access_token);

                // call user profile function (below)
                getProfile(fullAccessToken);
            }
        } else {
            alert("Unauthorized origin page has sent a message.");
            return;
        }

    }, false);

    var w = window.open(url,
        'Spotify',
        'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left
    );

}

// get user profile information
function getProfile(aT) {
    var request = new XMLHttpRequest();

    request.open("GET", "https://api.spotify.com/v1/me/", true);
    request.setRequestHeader("Authorization", "Bearer " + aT);
    request.onload = function () {
        var data = JSON.parse(this.response);
        if (request.status >= 200 && request.status < 400) {
            console.log(data);
            writeMeData(data);
        } else {
            alert('An error occurred while getting profile data.');
        }
    }
    request.send();
}

// get information on user's devices
function getPlayerData() {

    var request = new XMLHttpRequest();

    request.open("GET", "https://api.spotify.com/v1/me/player/devices/", true);
    request.setRequestHeader("Authorization", "Bearer " + fullAccessToken);
    request.onload = function () {
        var data = JSON.parse(this.response);
        if (request.status >= 200 && request.status < 400) {
            console.log(data);
            writePlayerData(data);
        } else {
            alert('An error occurred while getting player data.');
        }
    }
    request.send();
}

// get data on most recent songs
function getRecentPlayData() {

    var request = new XMLHttpRequest();

    request.open("GET", "https://api.spotify.com/v1/me/player/recently-played/", true);
    request.setRequestHeader("Authorization", "Bearer " + fullAccessToken);
    request.onload = function () {
        var data = JSON.parse(this.response);
        if (request.status >= 200 && request.status < 400) {
            console.log(data);
            writeRecentPlay(data);
        } else {
            alert('An error occurred while getting your recent tracks.');
        }
    }
    request.send();
}

// get top artist or track data
function getTopData(artOrTrack) {

    var request = new XMLHttpRequest();

    request.open("GET", "https://api.spotify.com/v1/me/top/" + artOrTrack + "?time_range=medium_term", true);
    request.setRequestHeader("Authorization", "Bearer " + fullAccessToken);
    request.onload = function () {
        var data = JSON.parse(this.response);
        if (request.status >= 200 && request.status < 400) {
            console.log(data);
            writeTopData(data);
        } else {
            alert('An error occurred while getting your top artists.');
        }
    }
    request.send();
}

// pop profile data into index.html file
function writeMeData(theData) {
    var hideTheDiv = document.getElementById('hideDiv');
    hideTheDiv.style.display = "none";

    var container1 = document.createElement('div');
    container1.classList.add('w3-container');
    rootDiv.appendChild(container1);

    var userHeading = document.createElement('h1');
    userHeading.textContent = theData.id;
    container1.appendChild(userHeading);

    var followers = document.createElement('p');
    followers.textContent = `Followers: ${theData.followers.total}`;
    container1.appendChild(followers);

    var userPage = document.createElement('a');
    userPage.classList.add('w3-button');
    userPage.classList.add('w3-green');
    userPage.href = theData.external_urls.spotify;
    userPage.textContent = 'Spotify Play';
    container1.appendChild(userPage);

    var container2 = document.createElement('div');
    container2.classList.add('w3-container');
    container2.classList.add('w3-margin');
    rootDiv.appendChild(container2);

    var playerButton = document.createElement('button');
    playerButton.classList.add('w3-button');
    playerButton.classList.add('w3-third');
    playerButton.classList.add('w3-green');
    playerButton.onclick = function () {
        getPlayerData();
        return false;
    };
    playerButton.textContent = 'Your devices';
    container2.appendChild(playerButton);

    var playListButton = document.createElement('button');
    playListButton.classList.add('w3-button');
    playListButton.classList.add('w3-third');
    playListButton.classList.add('w3-green');
    playListButton.onclick = function () {
        getRecentPlayData();
        return false;
    };
    playListButton.textContent = 'Recently played';
    container2.appendChild(playListButton);

    var topArtistButton = document.createElement('button');
    topArtistButton.classList.add('w3-button');
    topArtistButton.classList.add('w3-third');
    topArtistButton.classList.add('w3-green');
    topArtistButton.onclick = function () {
        getTopData("artists");
        return false;
    }
    topArtistButton.textContent = 'Top artists';
    container2.appendChild(topArtistButton);

}

// pop devices data into index.html
function writePlayerData(theData) {
    var devicesContainer = document.createElement('div');
    devicesContainer.classList.add('w3-container');
    devicesContainer.classList.add('w3-green');
    rootDiv.appendChild(devicesContainer);

    var playerDeviceHeading = document.createElement('h2');
    playerDeviceHeading.classList.add('w3-animate-left');
    playerDeviceHeading.textContent = 'Your devices';
    devicesContainer.appendChild(playerDeviceHeading);

    theData.devices.forEach(device => {
        var devBtn = document.createElement('button');
        devBtn.classList.add('w3-bar');
        devBtn.classList.add('w3-button');
        setTimeout(() => {
            devBtn.classList.add('w3-animate-left');
        }, 1500);
        devBtn.textContent = device.name;
        
        // only available for premium spotify members
        devBtn.onclick = function () {
            playDevice(device.id)
        };

        devicesContainer.appendChild(devBtn);
    });
}

// pop recently played songs into index.html
function writeRecentPlay(theData) {
    var musicObjs = theData.items;

    var listDiv = document.createElement('div');
    listDiv.classList.add('w3-container');
    listDiv.classList.add('w3-green');
    rootDiv.appendChild(listDiv);
    musicObjs.forEach(musicObj => {
        var trackName = document.createElement('h3');
        trackName.textContent = `Track: ${musicObj.track.name}`;
        var trackPopularity = document.createElement('h5');
        trackPopularity.classList.add('w3-animate-left');
        trackPopularity.textContent = `popularity: ${musicObj.track.popularity}`;
        listDiv.appendChild(trackName);
        listDiv.appendChild(trackPopularity);
    });
}

// pop top artist data into index.html
function writeTopData(theData) {
    var musicObjs = theData.items;

    var listDivTop = document.createElement('div');
    listDivTop.classList.add('w3-container');
    listDivTop.classList.add('w3-green');
    rootDiv.appendChild(listDivTop);
    musicObjs.forEach(musicObj => {
        var artistName = document.createElement('h3');
        artistName.textContent = `Artist: ${musicObj.name}`;
        var artistImg = document.createElement('img');
        artistImg.classList.add('w3-animate-left');
        artistImg.src = musicObj.images[1].url;
        listDivTop.appendChild(artistName);
        listDivTop.appendChild(artistImg);
    });
}

// only available for premium members (pssshhh)
// choose device to play
function playDevice(dID) {
    console.log('play!');
    var request = new XMLHttpRequest();

    request.open("PUT", "https://api.spotify.com/v1/me/player/play?device_id=" + dID, true);
    // use this if sending json data
    // request.setRequestHeader("Accept","application/json");
    // request.setRequestHeader("Content-Type","application/json");
    request.setRequestHeader("Authorization", "Bearer " + fullAccessToken);
    request.onload = function () {
        var data = JSON.parse(this.response);
        if (request.status >= 200 && request.status < 400) {
            console.log(data);
            
        } else {
            alert('An error occurred while attempting to play your device.');
        }
    }
    request.send();
}