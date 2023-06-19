// Logging
/**
 * Use instead of console.log
 * If the first argument is 's' (for success) it will be green
 * If it's 'f' (for failure) it will be red
 */
function log(){
    if(arguments[0]=="s"){
        arguments[0] = "\x1b[32m%s\x1b[0m";
    }
    if(arguments[0]=="f"){
        arguments[0] = "\x1b[31m%s\x1b[0m";
    }
    if(arguments[0]=="server"){
        arguments[0] = "\x1b[34m\x1b[1mServer:\x1b[0m %s\x1b[0m";
        if(arguments[1]=="user"){
            arguments[1] = "\x1b[35mUser";
            arguments[2] = "\x1b[35m\x1b[1m" + arguments[2] + "\x1b[0m";
        }
    }
    console.log.apply(console, arguments);
}
// Server

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
require('dotenv').config();

// const { v4 } = require("uuid");

// Databases
const mysql = require('mysql2/promise');

async function SQLConnection(){
    return await mysql.createConnection({
        host: process.env.MYSQL_Host,
        user: process.env.MYSQL_User,
        password: process.env.MYSQL_Pass,
        database: process.env.MYSQL_DB
    });
}

async function testSQLConnection(){
    var con
    try {
        con = await SQLConnection();
        await con.connect();
    } catch (error) {
        log("f", "MySQL Database offline");
        throw error;
    }
    con.end()
    log("s", "MySQL Database online");
}

testSQLConnection()

// Server app

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/pages/home.html');
});

app.get('/app', (req, res) => {
    res.sendFile(__dirname + '/client/pages/app.html');
});

app.get('/assets*', (req, res) => {
    res.sendFile(__dirname + '/client/' + req.url);
});

io.on('connection', (socket) => {
    console.log('A user connected');
    var UID;
    socket.on('logon', async (sessionCookie, callback) => {
        if(typeof callback != "function"){
            return;
        }
        if(!sessionCookie || sessionCookie.length != 26){
            callback(null, "Invalid request!");
            return;
        }
        if(UID){
            callback(null, "Already logged on");
            return;
        }

        UID = await logon(sessionCookie);
        
        if(UID == -1 || !UID){
            callback(null, "Unlogged session id!");
            return;
        }
        socket.join(UID);
        callback("success")
    });

    // socket.on('')

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});
server.listen(3000, () => {
    console.log('Listening on *:3000');
});




/**
 * To login a user with his PHP Cookie
 * If UID is -1 that means user is not logged
 * @param {*} cookie PHP Session ID
 * @returns User ID
 */
async function logon(cookie){
    var UID = -1;
    var con = SQLConnection();
    con = await SQLConnection();
    await con.connect;
    const result = await con.query("SELECT uid FROM sessions WHERE session="+con.escape(cookie));
    if(result){
        if(result[0][0]){
            UID = await result[0][0].uid;
        }
    }
    con.end();
    return UID;
}