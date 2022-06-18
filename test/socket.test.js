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

        // create clients
        const client = createClient();
        const client2 = createClient2();
        const client3 = createClient2();

        //check that initial match.length is 0
        client.on("_data", (res) => {

            assert.equal(res.matches.length, 0);


        })
        client.emit("_data");

        // sign in both players
        client.on("signin", (res) => {

            assert.equal(res.ime, req.ime, "On sign in ime must equal to req.ime");

            client2.emit("signin", req2);
        });
        client.emit("signin", req);


        client2.on("signin", (res) => {

            assert.equal(res.ime, req2.ime, "On sign in ime must equal to req2.ime");


            client.emit("match", req);
        });

        //create a match between player1 & player2

        client.on("match", (res) => {

            assert.equal(res["player1"].ime, req.ime);
            assert(res["player1"].playing);

            assert.equal(res["player2"].ime, req2.ime);
            assert(res["player2"].playing);

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

            assert.equal(res.matches.length, 1, "Must equal to 1 after matching players");
            assert.equal(res.usernames[0], req.ime, "The usernames first string should equal players1 name");
            assert.equal(res.usernames[1], req2.ime, "The usernames second string should equal players2 name");
            // reset all data

            client3.emit("_reset");

        });


        client3.on('_reset', (res) => {
            assert(res, "Must equal true");
            client3.emit("_data");

        });

        //test reseted data
        client3.on("_data", res => {

            assert.deepEqual(res.players, {}, "Must be empty");
            assert.deepEqual(res.matches, [], "Must be empty");
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

            assert.equal(res.ime, req.ime, "On sign in ime must equal to req.ime");

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

                assert.equal(res.ime, req.ime, "On sign in ime must equal to req.ime");
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

                assert.equal(res.ime, req1.ime, "On sign in ime must equal to req1.ime");
                client.emit("signin", req2);

            }
            if (count == 2) {

                assert.equal(res.error, "signin");
                assert.equal(res.msg, "Player has allready signin, but with a different name.");
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

            assert.equal(res.ime, req.ime, "On sign in ime must equal to req.ime");

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
            assert.equal(res.ime, req.ime, "On sign in ime must equal to req.ime");
            client2.emit("signin", req2);

        })
        client2.on("signin", (res) => {
            assert.equal(res.ime, req2.ime, "On sign in ime must equal to req2.ime");
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

            assert.equal(res.ime, req.ime, "On sign-out ime must equal to req.ime");

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

            assert.equal(res.ime, req.ime, "On sign-in ime must equal to req.ime");

            client.emit("signout", req);

        })
        client.on("signout", (res) => {

            count++;

            if (count == 1) {
                assert.equal(res.ime, req.ime, "On sign-out ime must equal to req.ime");
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

            assert.equal(res.ime, req.ime, "On sign-in ime must equal to req.ime");
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

describe("on match", () => {
    let waitingPlayer = undefined;
    let waitingPlayer_client = undefined;

    it("should create a match", (done) => {
        // player1 name
        const req = {
            ime: "abc"
        };
        // player2 name
        const req2 = {
            ime: "def"
        }

        // create clients
        const client = createClient();
        const client2 = createClient2();
       

        //check that initial match.length is 0
        client.on("_data", (res) => {

            assert.equal(res.matches.length, 0);


        })
        client.emit("_data");

        // sign in both players
        client.on("signin", (res) => {

            assert.equal(res.ime, req.ime, "On sign in ime must equal to req.ime");

            client2.emit("signin", req2);
        });
        client.emit("signin", req);


        client2.on("signin", (res) => {

            assert.equal(res.ime, req2.ime, "On sign in ime must equal to req2.ime");


            client.emit("match", req);
        });

        //create a match between player1 & player2

        client.on("match", (res) => {

            assert.equal(res["player1"].ime, req.ime);
            assert(res["player1"].playing);

            assert.equal(res["player2"].ime, req2.ime);
            assert(res["player2"].playing);

            client2.emit("_data");

        });
        //test match data
        client2.on("_data", res => {


            assert.equal(res.matches[0].player1.ime, req.ime, "Must be equal to first players name");
            assert(res.matches[0].player1.playing, "Playing must be true");
            assert.equal(res.matches[0].player1.points, 0, "Must be equal to 0 at start of game");

            assert.equal(res.matches[0].player2.ime, req2.ime, "Must be equal to second players name");
            assert(res.matches[0].player2.playing, "Playing must be true");
            assert.equal(res.matches[0].player2.points, 0, "Must be equal to 0 at start of game");

            assert.equal(res.matches.length, 1, "Must equal to 1 after matching players");
            assert.equal(res.usernames[0], req.ime, "The usernames first string should equal players1 name");
            assert.equal(res.usernames[1], req2.ime, "The usernames second string should equal players2 name");
            done();


        });
    });
    it("should wait if no free players available", (done) => {

        const req = {
            ime: "abcd"
        };


        const client = createClient();

        client.on("signin", (res) => {
           
            assert.equal(res.ime, req.ime, "On sign in ime must equal to req.ime");

            client.emit("_data");

        });


        client.on("_data", (res) => {

            assert.equal(res.matches.length, 0, "Must equal to 0 if there is no free player");
            assert.equal(res.usernames[0], req.ime, "The usernames first string should equal players3 name");

            client.emit("match", req);
        })


        client.on("match", (res) => {

            assert.equal(res.error, "match");
            assert.equal(res.msg, "No players available for a game. Please wait...");
            done();

        });

        client.emit("signin", req);
    });


    it("should create two matches", (done) => {


        
        const req = {
            ime: "abc"
        };
        const req2 = {
            ime: "def"
        };
        const req3 = {
            ime: "abcd"
        };
        const req4 = {
            ime: "defg"
        };

        const client1 = createClient();
        const client2 = createClient2();
        const client3 = createClient2();
        const client4 = createClient2();

        //sign-in both players

        client1.on("signin", (res) => {

            assert.equal(res.ime, req.ime, "On sign in ime must equal to req.ime");

            client2.emit("signin", req2);

        });

        client2.on("signin", (res) => {

            assert.equal(res.ime, req2.ime, "On sign in ime must equal to req.ime");


            client2.emit("match", req2);
        })
        // create first match
        client2.on("match", (res) => {
          
            assert.equal(res["player1"].ime, req2.ime);
            assert(res["player1"].playing);

            assert.equal(res["player2"].ime, req.ime);
            assert(res["player2"].playing);
            
            client3.emit("signin", req3);

        });
        //sign-in second pair of players
        client3.on("signin", res => {
          
            assert.equal(res.ime, req3.ime, "On sign in ime must equal to req3.ime");
      
        client4.emit("signin", req4);

        });

        client4.on("signin", res => {

            assert.equal(res.ime, req4.ime, "On sign in ime must equal to req4.ime");
   

        client4.emit("match", req4);
        
        });
        //create second match
        client4.on("match", (res) => {
          
            assert.equal(res["player1"].ime, req4.ime);
            assert(res["player1"].playing);

            assert.equal(res["player2"].ime, req3.ime);
            assert(res["player2"].playing);
            
           
            client4.emit("_data");
        });

        client4.on("_data", (res) => {
         
            // first macth testing
            assert.equal(res.matches[0].player1.ime, req2.ime, "Must be equal to players2 name");
            assert(res.matches[0].player1.playing, "Playing must be true");
            assert.equal(res.matches[0].player1.points, 0, "Must be equal to 0 at start of game");

            assert.equal(res.matches[0].player2.ime, req.ime, "Must be equal to waiting players name");
            assert(res.matches[0].player2.playing, "Playing must be true");
            assert.equal(res.matches[0].player2.points, 0, "Must be equal to 0 at start of game");

            //second match testing
            assert.equal(res.matches[1].player1.ime, req4.ime, "Must be equal to players2 name");
            assert(res.matches[1].player1.playing, "Playing must be true");
            assert.equal(res.matches[1].player1.points, 0, "Must be equal to 0 at start of game");

            assert.equal(res.matches[1].player2.ime, req3.ime, "Must be equal to players1 name");
            assert(res.matches[1].player2.playing, "Playing must be true");
            assert.equal(res.matches[1].player2.points, 0, "Must be equal to 0 at start of game");

            assert.equal(res.matches.length, 2, "Must equal to 2 after second match started");
            
            //testing players
            assert.equal(res.players[client1.id].ime, req.ime, "On signin must equal to player1 ime")
            assert(res.players[client1.id].playing, "On match start must equal true")
            assert.equal(res.players[client1.id].points, 0, "Must be equal to 0 at start of match");

            assert.equal(res.players[client2.id].ime, req2.ime, "On signin must equal to player2 ime")
            assert(res.players[client2.id].playing, "On match start must equal true")
            assert.equal(res.players[client2.id].points, 0, "Must be equal to 0 at start of match");

            assert.equal(res.players[client3.id].ime, req3.ime, "On signin must equal to player1 ime")
            assert(res.players[client3.id].playing, "On match start must equal true")
            assert.equal(res.players[client3.id].points, 0, "Must be equal to 0 at start of match");

            assert.equal(res.players[client4.id].ime, req4.ime, "On signin must equal to player2 ime")
            assert(res.players[client4.id].playing, "On match start must equal true")
            assert.equal(res.players[client4.id].points, 0, "Must be equal to 0 at start of match");

            //testing usernames
            assert.equal(res.usernames[0], req.ime, "The usernames third string should equal players1 name");
            assert.equal(res.usernames[1], req2.ime, "The usernames second string should equal players2 name");
            assert.equal(res.usernames[2], req3.ime, "The usernames third string should equal players1 name");
            assert.equal(res.usernames[3], req4.ime, "The usernames fourth string should equal players2 name");

            done();
           
        })

        client1.emit("signin", req);

    })

})

