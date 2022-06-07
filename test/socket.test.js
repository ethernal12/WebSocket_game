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
    it("should connect", (done) => {
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
    it("should reset", (done) => {
        client = createClient();
        client.on('_reset', (res) => {
            assert(res);
            client.disconnect();
            done();
        });
        client.emit("_reset");
    })



});

 describe("on signin", () => {

    it("Should create player", (done) => {
        const req = {
            ime: "abc"
        }
        client = createClient();
        client.on("signin", (res) => {
            assert.equal(res.ime, req.ime);
            assert.equal(res.points, 0);
            assert(!res.playing);
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
        client = createClient();
        client.on("signin", (res) => {

            client.emit("signout", req);

        })
        client.on("signout", (res) => {

            assert.equal(res.ime, req.ime);
            assert.equal(res.points, 0);
            assert(!res.playing);
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
