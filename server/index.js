const { count } = require("console");
const server = require('http').createServer()
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
    }
});

let players = {};//{socket: {ime, prii...}}
let matches = [];
let countMatches = 0;

function createPlayer(ime, socket){
    const player = {
        ime: ime,
        playing: false,
        points: 0
    };
    players[socket] = player;
    return player;
}

function createMatch(player1, player2){
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
        socket.emit("_reset", true);
    });

    socket.on('_data', () => {
        console.log("on _data");
        socket.emit("_data", {
            players,matches,countMatches
        });
    });
    
    socket.on("signin", (req) => { //req = {ime}
        console.log("on signin");
        for(let s in players){
            if(players[s].ime == req.ime){
                socket.emit("signin", {error: "signin", msg: "Player has allready signin."});
                return;
            }
            if(s == socket){
                console.log("error");
                socket.emit("signin", {error: "signin", msg: "Player has allready signin, BUT WITH DIFFERENT NAME."});
                return;
            }
        }
        const player = createPlayer(req.ime,socket);
        socket.emit("signin", player);
    });
    socket.on("signout", (req) => {//req = {ime}
        console.log("on signout");
        for (const s in players) {
            if(players[s].ime == req.ime){
                console.log("signout for");
                socket.emit("signout", players[s]);
                socket.disconnect();
                delete players[s];
                break;
            }
        }
    });
    socket.on("match", (req) => {//req = {ime}
        console.log("on match");

        let player = null;
        for (const s in players) {
            if(players[s].ime == req.ime){
                player = players[s];
                break;
            }
        }

        let player2 = null;
        for (const s in players) {
            if(players[s].ime != req.ime && !players[s].playing){
                player2 = players[s];
                break;
            }
        }

        const match = createMatch(player1, player2);
        matches.push(match);

    })
})

server.listen(3000, () => {
    console.log("Server started...");
})