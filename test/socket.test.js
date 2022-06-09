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

// describe("on connection", () => {
//     it("should connect client 1", (done) => {
//         client = createClient();
//         client.on('connect', () => {
          
//             assert(client.connected);
//             client.disconnect();
//         });
//         client.on('disconnect', () => {
//             done();
//         });
//     })
//     it("should connect client 2", (done) => {
//         client2 = createClient2();
//         client2.on('connect', () => {
           
//             assert(client2.connected);
//             client2.disconnect();
//         });
//         client2.on('disconnect', () => {
//             done();
//         });
//     })


// });
describe("on signin and on reset", () => {

    it("should signin players, create a match and reset data", (done) => {

        const req = {
            ime: "abc"
        };
    
        client = createClient();

        client.on("signin", (res) => {
            client2.emit("signin", req2);
        });
        client.emit("signin", req);
    
    
        const req2 = {
            ime: "def"
        }
    
        client2 = createClient2();

        client2.on("signin", (res) => {
            client2.emit("match", req);
        });
    
    
    
        client2.on("match", (res) => {
            client2.emit("_data");
            
        });
    
        client2.on("_data", res => {
            assert.equal(res.players[client.id].ime, req.ime, "Must be equal first players name");
            assert.equal(res.players[client2.id].ime, req2.ime, "Must be equal second players name");
            console.log(res.matches["match"]);
            // assert.equal(res.matches, [], "Must be empty");
            // assert.equal(res.countMatches, 0, "Must be zero");
            // assert.equal(res.usernames, [], "Must be empty");   
            done();
            });
   
//    client2.on("_data", res => {
//         console.log(res.players);
//         done();
//         });

//     client2.emit("_data");



        // client = createClient();

        // let count = 0;
        // client.on('_reset', (res) => {
        //     console.log(res);
        //     count++;
        //     if(count == 1){
        //         client.emit("_data");
        //     }           
          
        // });
        

        // client.on("_data", res => {
        //     assert.deepEqual(res.players, {}, "Must be empty");
        //     assert.deepEqual(res.matches, [], "Must be empty");
        //     assert.equal(res.countMatches, 0, "Must be zero");
        //     assert.deepEqual(res.usernames, [], "Must be empty");           
        //     done();
        // });
       
        // client.emit("_reset");
    })

});

//  describe("on signin", () => {

//     it("Should create player", (done) => {
//         const req = {
//             ime: "abc"
//         }
//         client = createClient();
//         client.on("signin", (res) => {
//             assert.equal(res.ime, req.ime);
//             assert.equal(res.points, 0);
//             assert(!res.playing);
//             done();
//         })
//         client.emit("signin", req);

//     });

//     it("Should not create player if already signin", (done) => {
//         const req = {
//             ime: "abc"
//         }
//         client = createClient();
//         let count = 0;
//         client.on("signin", (res) => {
//             count++;

//             if (count == 1) {
//                 client.emit("signin", req);
//             }
//             if (count == 2) {
//                 assert.equal(res.error, "signin");
//                 assert.equal(res.msg, "Player has allready signin.");
//                 done();
//             }

//         })
//         client.emit("signin", req);

//     });

//     it("Should not create player if different name but same socket", (done) => {
//         const req1 = {
//             ime: "abc"
//         }
//         const req2 = {
//             ime: "bca"
//         }
//         client = createClient();
//         let count = 0;
//         client.on("signin", (res) => {
//             count++;
//             if (count == 1) {
//                 client.emit("signin", req2);
//             }
//             if (count == 2) {
//                 assert.equal(res.error, "signin");
//                 assert.equal(res.msg, "Player has allready signin, BUT WITH DIFFERENT NAME.");
//                 done();
//             }

//         })
//         client.emit("signin", req1);


//     });

//     it("Should not sign in with different socket with a username that allready exists", (done) => {
//         const req = {
//             ime: "abc"
//         }
       

//         const client = createClient();
//         const client2 = createClient2();



//         client.on("signin", (res) => {

//             client2.emit("signin", req);

//         })
//         client2.on("signin", (res) => {
            
//             assert.equal(res.error, "signin");
//             assert.equal(res.msg, "This username is allready in use by different client.");
//             done();

//         })

//         client.emit("signin", req);

//     });
// });

// describe("on signout", () => {
//     it("Should be able to signout", (done) => {
//         const req = {
//             ime: "er3"
//         }
//         client = createClient();
//         client.on("signin", (res) => {

//             client.emit("signout", req);

//         })
//         client.on("signout", (res) => {

//             assert.equal(res.ime, req.ime);
//             assert.equal(res.points, 0);
//             assert(!res.playing);
//             done();

//         })

//         client.emit("signin", req);
//     })
//     it("Should get error if user tries to signout but is not signed-in.", (done) => {
//         const req = {
//             ime: "er3"
//         }
//         client = createClient();

//         client.on("signout", (res) => {

//             assert.equal(res.error, "signout");
//             assert.equal(res.msg, "Player cannot signout if not signed in.");
//             done();

//         })
//         client.emit("signout", req);


//     });
//     it("Should get error if user has allready signout", (done) => {

//         const req = {
//             ime: "er3"
//         }
//         client = createClient();
//         let count = 0;
//         client.on("signin", (res) => {

//             client.emit("signout", req);

//         })
//         client.on("signout", (res) => {

//             count++;

//             if (count == 1) {
//                 client.emit("signout", req);

//             }

//             if (count == 2) {

//                 assert.equal(res.error, "signout");
//                 assert.equal(res.msg, "Player cannot signout if not signed in.");
//                 done();
//             }

//         })

//         client.emit("signin", req);
//     });


//     it("Should get error if user uses different name for signout", (done) => {

//         const req = {
//             ime: "er3"
//         }
//         const req2 = {
//             ime: "er4"
//         }
//         const client = createClient();



//         client.on("signin", (res) => {

//             client.emit("signout", req2);



//         })
//         client.on("signout", (res) => {
            
//             assert.equal(res.error, "signout");
//             assert.equal(res.msg, "Player cannot signout if not signed in.");
//             done();

//         })



//         client.emit("signin", req);

//     })
// })

// describe("on match", () => {
//     it("should be able to get in match", () => { });
//     it("should wait if not free player is available", () => { });
// })