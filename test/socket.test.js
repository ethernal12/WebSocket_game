let io = require('socket.io-client');
let assert = require('assert');
const { equal } = require('assert');

function createClient() {
    let client = io("ws://localhost:3000");
    client.emit("_reset");
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
            if(count == 1){
                client.emit("signin", req);
            }
            if(count == 2){
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
            if(count == 1){
                client.emit("signin", req2);
            }
            if(count == 2){
                assert.equal(res.error, "signin");
                assert.equal(res.msg, "Player has allready signin, BUT WITH DIFFERENT NAME.");
                done();
            }
            
        })
        client.emit("signin", req1);
       
        
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
    it("Should get error if user has not signin.", () => {});
    it("Should get error if user has allready signout", () => {});
    it("Should get error if user uses different name for signout", () => {})
})

describe("on match", () => {
    it("should be able to get in match", () => {});
    it("should wait if not free player is available", () => {});
})