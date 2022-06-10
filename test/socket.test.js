let io = require('socket.io-client');
let assert = require('assert');


function createClient() {
    let client = io("ws://localhost:3000");
    client.emit("_reset");
    return client;
}
// when creating client2 don`t reset data
function createClient2() {
    let client = io("ws://localhost:3000");
    return client;
}

describe("on connection", () => {
    it("should connect client ", (done) => {
        client = createClient();
        client.on('connect', () => {

            assert(client.connected);
            client.disconnect();
        });
        client.on('disconnect', () => {
            done();
        });
    })



});
describe("on reset", () => {

    it("should signin players, create a match and reset data", (done) => {
        // player1 name
        const req = {
            ime: "abc"
        };
        // player2 name
        const req2 = {
            ime: "def"
        }

        let countMatches = null;

        // create clients
        const client = createClient();
        const client2 = createClient2();
        const client3 = createClient2();

        //get initial countMatches number for testing
        client.on("_data", (res) => {
            countMatches = res.countMatches;


        })
        client.emit("_data");

        // sign in both players
        client.on("signin", (res) => {
            client2.emit("signin", req2);
        });
        client.emit("signin", req);



        client2.on("signin", (res) => {

            client2.emit("match", req);
        });

        //create a match between player1 & player2

        client2.on("match", (res) => {

            client2.emit("_data");

        });
        //test _data populate
        client2.on("_data", res => {

            assert.equal(res.matches[0].player1.ime, req.ime, "Must be equal to first players name");
            assert(res.matches[0].player1.playing, "Playing must be true");
            assert.equal(res.matches[0].player1.points, 0, "Must be equal to 0 at start of game");

            assert.equal(res.matches[0].player2.ime, req2.ime, "Must be equal to second players name");
            assert(res.matches[0].player2.playing, "Playing must be true");
            assert.equal(res.matches[0].player2.points, 0, "Must be equal to 0 at start of game");

            assert.equal(res.countMatches, countMatches + 1, "Must equal to initial match number + 1");
            assert.equal(res.usernames[0], req.ime, "The usernames first string should equal players1 name");
            assert.equal(res.usernames[1], req2.ime, "The usernames second string should equal players2 name");
            // reset all data

            client3.emit("_reset");

        });


        client3.on('_reset', (res) => {

            client3.emit("_data");

        });

        //test reseted data
        client3.on("_data", res => {

            assert.deepEqual(res.players, {}, "Must be empty");
            assert.deepEqual(res.matches, [], "Must be empty");
            assert.equal(res.countMatches, 0, "Must be zero");
            assert.deepEqual(res.usernames, [], "Must be empty");
            done();
        });


    })

});

describe("on signin", () => {

    it("Should create player", (done) => {
        const req = {
            ime: "abc"
        }
        client = createClient();
        client.on("signin", (res) => {
            client.emit("_data");
        })
        client.on("_data", res => {

            assert.equal(res.players[client.id].ime, req.ime, "Should equal to req name");
            assert(!res.players[client.id].playing, "Should equal to false");
            done();

        })
        client.emit("signin", req);

    });

    it("Should not create player if already signin", (done) => {
        const req = {
            ime: "abc"
        }
        client = createClient();
        let count = 0;
        client.on("signin", (res) => {
            count++;

            if (count == 1) {
                client.emit("signin", req);
            }
            if (count == 2) {
                assert.equal(res.error, "signin");
                assert.equal(res.msg, "Player has allready signin.");
                done();
            }

        })
        client.emit("signin", req);

    });

    it("Should not create player if different name but same socket", (done) => {
        const req1 = {
            ime: "abc"
        }
        const req2 = {
            ime: "bca"
        }
        client = createClient();
        let count = 0;
        client.on("signin", (res) => {
            count++;
            if (count == 1) {
                client.emit("signin", req2);
            }
            if (count == 2) {
                assert.equal(res.error, "signin");
                assert.equal(res.msg, "Player has allready signin, BUT WITH DIFFERENT NAME.");
                done();
            }

        })
        client.emit("signin", req1);


    });

    it("Should not sign in with different socket with a username that allready exists", (done) => {
        const req = {
            ime: "abc"
        }


        const client = createClient();
        const client2 = createClient2();

        client.on("signin", (res) => {

            client2.emit("signin", req);

        })
        client2.on("signin", (res) => {

            assert.equal(res.error, "signin");
            assert.equal(res.msg, "This username is allready in use by different client.");
            done();

        })

        client.emit("signin", req);

    });
});

describe("on signout", () => {
    it("Should be able to signout", (done) => {
        const req = {
            ime: "er3"
        }
        const req2 = {
            ime: "er35"
        }

        const client = createClient();
        const client2 = createClient2();

        //sign in two players
        client.on("signin", (res) => {

            client2.emit("signin", req2);

        })
        client2.on("signin", (res) => {

            client.emit("_data");

        })

        client.on("_data", (res) => {

            assert.equal(res.players[client.id].ime, req.ime, "On signin must equal to player1 ime")
            assert(!res.players[client.id].playing, "On signin must equal false")
            assert.equal(res.players[client.id].points, 0, "Must be equal to 0 at signin");

            assert.equal(res.players[client2.id].ime, req2.ime, "On signin must equal to player2 ime")
            assert(!res.players[client2.id].playing, "On signin must equal false")
            assert.equal(res.players[client2.id].points, 0, "Must be equal to 0 at signin");

            client.emit("signout", req);
        })

        //only sign out player1
        client.on("signout", res => {

            client2.emit("_data");
        });

        client2.on("_data", (res) => {


            for (let i in res.players) {

                assert.notEqual(res.players[i].ime, req.ime, "Must NOT equal to signed out player");
            }
            for (let index = 0; index < res.usernames.length; index++) {

                assert.notEqual(res.usernames[index], req.ime, "Must NOT equal to signed out player");

            }

            done();

        })

        client.emit("signin", req);
    })
    it("Should get error if user tries to signout but is not signed-in.", (done) => {
        const req = {
            ime: "er3"
        }
        client = createClient();

        client.on("signout", (res) => {

            assert.equal(res.error, "signout");
            assert.equal(res.msg, "Player cannot signout if not signed in.");
            done();

        })
        client.emit("signout", req);


    });
    it("Should get error if user has allready signout", (done) => {

        const req = {
            ime: "er3"
        }
        client = createClient();
        let count = 0;
        client.on("signin", (res) => {

            client.emit("signout", req);

        })
        client.on("signout", (res) => {

            count++;

            if (count == 1) {
                client.emit("signout", req);

            }

            if (count == 2) {

                assert.equal(res.error, "signout");
                assert.equal(res.msg, "Player cannot signout if not signed in.");
                done();
            }

        })

        client.emit("signin", req);
    });


    it("Should get error if user uses different name for signout", (done) => {

        const req = {
            ime: "er3"
        }
        const req2 = {
            ime: "er4"
        }
        const client = createClient();

        client.on("signin", (res) => {

            client.emit("signout", req2);

        })
        client.on("signout", (res) => {

            assert.equal(res.error, "signout");
            assert.equal(res.msg, "Player cannot signout if not signed in.");
            done();

        })


        client.emit("signin", req);

    })
})

// describe("on match", () => {
//     it("should be able to get in match", () => { });
//     it("should wait if not free player is available", () => { });
// })