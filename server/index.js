const { count } = require("console");
const server = require('http').createServer()
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
    }
});

let players = {}; //{socketId: {ime, playing...}}
let usernames = [];
let matches = [];
let countMatches = 0;

function createPlayer(ime, socketId) {
    const player = {
        ime: ime,
        playing: false,
        points: 0
    };
    players[socketId] = player;
    usernames.push(ime);
    return player;
}

function createMatch(player1, player2) {
    countMatches++;
    player1.playing = true;
    player2.playing = true;
    const match = {
        match: countMatches,
        player1: player1,
        player2: player2
    };
    matches.push(match);
    return match;
}

io.on('connection', (socket) => {

    socket.on('_reset', () => {
        console.log("on _reset");
        players = {};
        matches = [];
        usernames = [];
        countMatches = 0;
        socket.emit("_reset", true);
    });

    socket.on('_data', () => {
        console.log("on _data");
        socket.emit("_data", {
            players, matches, countMatches, usernames
        });
    });


    socket.on("signin", (req) => { //req = {ime}
        console.log(socket.id);
        console.log("on signin");
        for (let s in players) {
            // only give an error if the same socketId with the same name
            if (players[s].ime == req.ime && socket.id == s) {

                console.log("sign in error");
                socket.emit("signin", { error: "signin", msg: "Player has allready signin." });
                return;
            }

            if (s == socket.id) {
                console.log("error");
                socket.emit("signin", { error: "signin", msg: "Player has allready signin, BUT WITH DIFFERENT NAME." });
                return;
            }
            // check if the new name is in the array, than give an error
            for (let i = 0; i < usernames.length; i++) {
                console.log("name check");

                if (req.ime == usernames[i]) {

                    console.log("duplicate name error");
                    socket.emit("signin", { error: "signin", msg: "This username is allready in use by different client." });
                    return;

                }
            }

        }
        const player = createPlayer(req.ime, socket.id);

        socket.emit("signin", player);
    });


    socket.on("signout", (req) => {//req = {ime}
        console.log("on signout");

        let signedIn = false; //check if player is NOT signed in
        for (const s in players) { //check if player is signed in

            if (players[s].ime == req.ime && socket.id == s) {

                console.log("signout for");
                signedIn = true;
                socket.emit("signout", players[s]);
                delete players[s];
                //
                for (var i = usernames.length - 1; i >= 0; i--) {
                    if (usernames[i] === req.ime) {
                        console.log("found the username and deleted");
                        usernames.splice(i, 1);
                        break;
                    }
                }

            }


        }

        if (!signedIn) {
            console.log("signout error");
            socket.emit("signout", { error: "signout", msg: "Player cannot signout if not signed in." });

        }



    });
    socket.on("match", (req) => {//req = {ime}
        console.log("on match");

        let player1 = null;
        for (const s in players) {
            if (players[s].ime == req.ime) {
                console.log("player 1 ok");
                player1 = players[s];
                break;
            }
        }

        let player2 = null;
        let playerFree = false;
        for (const s in players) {
            if (players[s].ime != req.ime && players[s].playing) {
                console.log("no free player");
                socket.emit("match", { error: "match", msg: "No players available for a game. Please wait..." });
                break;
            }

            if (players[s].ime != req.ime && !players[s].playing) {
                console.log("free player");
                player2 = players[s];
                playerFree = true;
                break;
            }
        }
        if (playerFree) {
            console.log("free player");
            const match = createMatch(player1, player2);
            matches.push(match);
            socket.emit("match", match);

        }



    })

})

server.listen(3000, () => {
    console.log("Server started...");
})
