import {Queue as $hgUW1$Queue} from "async-await-queue";

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}
var $9224a2c5eeae1672$exports = {};

$parcel$export($9224a2c5eeae1672$exports, "bleRequest", () => $9224a2c5eeae1672$export$b699ee72de2ebcbd);
$parcel$export($9224a2c5eeae1672$exports, "BLEDevice", () => $9224a2c5eeae1672$export$926ab273976713de);
var $99f74415292121e0$exports = {};

$parcel$export($99f74415292121e0$exports, "Queue", () => $99f74415292121e0$export$3dc07afe418952bc);
$parcel$export($99f74415292121e0$exports, "QueueList", () => $99f74415292121e0$export$6b278a59f65cf1eb);
$parcel$export($99f74415292121e0$exports, "Message", () => $99f74415292121e0$export$f69c19e57285b83a);
$parcel$export($99f74415292121e0$exports, "read", () => $99f74415292121e0$export$aafa59e2e03f2942);
$parcel$export($99f74415292121e0$exports, "write", () => $99f74415292121e0$export$68d8715fc104d294);
var $89603ac6c30e3b84$exports = {};

$parcel$export($89603ac6c30e3b84$exports, "AsyncQueue", () => $89603ac6c30e3b84$export$c24e73273208a9bb);
class $89603ac6c30e3b84$export$c24e73273208a9bb {
    queue = [];
    waiters = [];
    push(item) {
        // add to back
        this.queue.push(item);
        // process queue
        while(this.waiters.length > 0 && this.queue.length > 0){
            const resolve = this.waiters.shift();
            resolve(this.queue.shift());
        }
    }
    pop(timeout) {
        // check if there is an item in the queue
        if (this.queue.length > 0) return Promise.resolve(this.queue.shift());
        return new Promise((resolve)=>{
            // add waiter
            this.waiters.push(resolve);
            // handle timeout
            if (timeout > 0) setTimeout(()=>{
                if (this.waiters.includes(resolve)) {
                    const index = this.waiters.indexOf(resolve);
                    this.waiters.splice(index, 1);
                    resolve(null);
                }
            }, timeout);
        });
    }
}


class $99f74415292121e0$export$3dc07afe418952bc extends (0, $89603ac6c30e3b84$export$c24e73273208a9bb) {
}
class $99f74415292121e0$export$6b278a59f65cf1eb {
    queues = [];
    /**
   * Adds a queue to the list.
   */ add(queue) {
        if (!this.queues.includes(queue)) this.queues.push(queue);
    }
    /**
   * Removes a queue from the list.
   */ drop(queue) {
        const index = this.queues.indexOf(queue);
        if (index >= 0) this.queues.splice(index, 1);
    }
    /**
   * Dispatches data to all queues.
   */ dispatch(data) {
        for (let queue of this.queues)queue.push(data);
    }
}
class $99f74415292121e0$export$f69c19e57285b83a {
    constructor(session, endpoint, data){
        this.session = session;
        this.endpoint = endpoint;
        this.data = data;
    }
    /**
   * Returns the size of the message.
   */ size() {
        return this.data?.length ?? 0;
    }
}
async function $99f74415292121e0$export$aafa59e2e03f2942(queue, timeout) {
    // read from queue
    const data = await queue.pop(timeout);
    if (!data) throw new Error("timeout");
    // check length and version
    if (data.length < 4 || data[0] !== 1) throw new Error("invalid message");
    // get view
    const view = new DataView(data.buffer);
    return new $99f74415292121e0$export$f69c19e57285b83a(view.getUint16(1, true), data[3], data.length > 4 ? data.slice(4) : null);
}
async function $99f74415292121e0$export$68d8715fc104d294(ch, msg) {
    // prepare data
    const data = new Uint8Array(4 + msg.size());
    const view = new DataView(data.buffer);
    view.setUint8(0, 1); // version
    view.setUint16(1, msg.session, true);
    view.setUint8(3, msg.endpoint);
    if (msg.data) data.set(msg.data, 4);
    // write data
    await ch.write(data);
}


const $9224a2c5eeae1672$var$svcUUID = "632fba1b-4861-4e4f-8103-ffee9d5033b5";
const $9224a2c5eeae1672$var$charUUID = "0360744b-a61b-00ad-c945-37f3634130f3";
async function $9224a2c5eeae1672$export$b699ee72de2ebcbd() {
    // request device
    let dev;
    try {
        dev = await navigator.bluetooth.requestDevice({
            filters: [
                {
                    services: [
                        $9224a2c5eeae1672$var$svcUUID
                    ]
                }
            ]
        });
    } catch (err) {
    // ignore
    }
    if (!dev) return null;
    return new $9224a2c5eeae1672$export$926ab273976713de(dev);
}
class $9224a2c5eeae1672$export$926ab273976713de {
    svc = null;
    char = null;
    ch = null;
    constructor(dev){
        // store device
        this.dev = dev;
        // close open chanel if disconnected
        this.dev.addEventListener("gattserverdisconnected", ()=>{
            if (this.ch) {
                this.ch.close();
                this.ch = null;
            }
        });
    }
    id() {
        return "ble/" + this.dev.id;
    }
    async open() {
        // check channel
        if (this.ch) throw new Error("channel already open");
        // connect, if not connected already
        if (!this.dev.gatt.connected) await this.dev.gatt.connect();
        // get service and characteristic if not available
        if (!this.svc) {
            this.svc = await this.dev.gatt.getPrimaryService($9224a2c5eeae1672$var$svcUUID);
            this.char = await this.svc.getCharacteristic($9224a2c5eeae1672$var$charUUID);
            if (!this.char) throw new Error("missing characteristic");
        }
        // create list
        const subscribers = new (0, $99f74415292121e0$export$6b278a59f65cf1eb)();
        // prepare handler
        const handler = ()=>{
            const data = new Uint8Array(this.char.value.buffer);
            subscribers.dispatch(data);
        };
        // subscribe to messages
        this.char.addEventListener("characteristicvaluechanged", handler);
        await this.char.startNotifications();
        // prepare flag
        let closed = false;
        // create channel
        this.ch = {
            name: ()=>"ble",
            valid: ()=>{
                return this.dev.gatt.connected && !closed;
            },
            subscribe: (q)=>{
                subscribers.add(q);
            },
            unsubscribe (queue) {
                subscribers.drop(queue);
            },
            write: async (data)=>{
                await this.char.writeValueWithoutResponse(data);
            },
            close: ()=>{
                this.char.removeEventListener("characteristicvaluechanged", handler);
                this.ch = null;
                closed = true;
            }
        };
        return this.ch;
    }
}



var $189005054305d286$exports = {};

$parcel$export($189005054305d286$exports, "statPath", () => $189005054305d286$export$3cc322771f0aca5b);
$parcel$export($189005054305d286$exports, "listDir", () => $189005054305d286$export$d00618d8d97ebf68);
$parcel$export($189005054305d286$exports, "readFile", () => $189005054305d286$export$72c04af63de9061a);
$parcel$export($189005054305d286$exports, "readFileRange", () => $189005054305d286$export$ec88705ee4409f46);
$parcel$export($189005054305d286$exports, "writeFile", () => $189005054305d286$export$552bfb764b5cd2b4);
$parcel$export($189005054305d286$exports, "renamePath", () => $189005054305d286$export$e355e6d7686ffc32);
$parcel$export($189005054305d286$exports, "removePath", () => $189005054305d286$export$5c4e774b0e27d36b);
$parcel$export($189005054305d286$exports, "sha256File", () => $189005054305d286$export$3b8a92549237260e);
var $fab42eb3dee39b5b$exports = {};

$parcel$export($fab42eb3dee39b5b$exports, "toBuffer", () => $fab42eb3dee39b5b$export$fc336dbfaf62f18f);
$parcel$export($fab42eb3dee39b5b$exports, "toString", () => $fab42eb3dee39b5b$export$f84e8e69fd4488a5);
$parcel$export($fab42eb3dee39b5b$exports, "toBase64", () => $fab42eb3dee39b5b$export$37cc283d8fbd3462);
$parcel$export($fab42eb3dee39b5b$exports, "fromBase64", () => $fab42eb3dee39b5b$export$c537b38001c583b7);
$parcel$export($fab42eb3dee39b5b$exports, "concat", () => $fab42eb3dee39b5b$export$ee1b3e54f0441b22);
$parcel$export($fab42eb3dee39b5b$exports, "random", () => $fab42eb3dee39b5b$export$4385e60b38654f68);
$parcel$export($fab42eb3dee39b5b$exports, "requestFile", () => $fab42eb3dee39b5b$export$dd4f63edb9ba1490);
$parcel$export($fab42eb3dee39b5b$exports, "pack", () => $fab42eb3dee39b5b$export$2a703dbb0cb35339);
$parcel$export($fab42eb3dee39b5b$exports, "unpack", () => $fab42eb3dee39b5b$export$417857010dc9287f);
const $fab42eb3dee39b5b$var$utf8Enc = new TextEncoder();
const $fab42eb3dee39b5b$var$utf8Dec = new TextDecoder();
function $fab42eb3dee39b5b$export$fc336dbfaf62f18f(string) {
    return $fab42eb3dee39b5b$var$utf8Enc.encode(string);
}
function $fab42eb3dee39b5b$export$f84e8e69fd4488a5(buffer) {
    return $fab42eb3dee39b5b$var$utf8Dec.decode(buffer);
}
function $fab42eb3dee39b5b$export$37cc283d8fbd3462(buffer) {
    return $fab42eb3dee39b5b$export$fc336dbfaf62f18f(btoa(String.fromCharCode(...new Uint8Array(buffer))));
}
function $fab42eb3dee39b5b$export$c537b38001c583b7(base64) {
    return new Uint8Array(atob(base64).split("").map((c)=>c.charCodeAt(0)));
}
function $fab42eb3dee39b5b$export$ee1b3e54f0441b22(buf1, buf2) {
    const buf = new Uint8Array(buf1.byteLength + buf2.byteLength);
    buf.set(buf1, 0);
    buf.set(buf2, buf1.byteLength);
    return buf;
}
function $fab42eb3dee39b5b$export$4385e60b38654f68(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for(let i = 0; i < length; i++){
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}
function $fab42eb3dee39b5b$export$dd4f63edb9ba1490(file) {
    return new Promise((resolve, reject)=>{
        const r = new FileReader();
        r.onload = ()=>{
            resolve(r.result);
        };
        r.onerror = (event)=>{
            reject(event);
        };
        r.readAsArrayBuffer(file);
    });
}
function $fab42eb3dee39b5b$export$2a703dbb0cb35339(fmt, ...args) {
    // calculate size
    let size = 0;
    for (const [index, arg] of args.entries())switch(fmt.charAt(index)){
        case "s":
        case "b":
            size += arg.length;
            break;
        case "o":
            size += 1;
            break;
        case "h":
            size += 2;
            break;
        case "i":
            size += 4;
            break;
        case "q":
            size += 8;
            break;
        default:
            throw new Error("invalid format");
    }
    // create buffer and view
    const buffer = new Uint8Array(size);
    const view = new DataView(buffer.buffer);
    // write arguments
    let offset = 0;
    for (const [index, arg] of args.entries())switch(fmt.charAt(index)){
        case "s":
            buffer.set($fab42eb3dee39b5b$export$fc336dbfaf62f18f(arg), offset);
            offset += arg.length;
            break;
        case "b":
            buffer.set(arg, offset);
            offset += arg.length;
            break;
        case "o":
            view.setUint8(offset, arg);
            offset += 1;
            break;
        case "h":
            view.setUint16(offset, arg, true);
            offset += 2;
            break;
        case "i":
            view.setUint32(offset, arg, true);
            offset += 4;
            break;
        case "q":
            view.setBigUint64(offset, arg, true);
            offset += 8;
            break;
        default:
            throw new Error("invalid format");
    }
    return buffer;
}
function $fab42eb3dee39b5b$export$417857010dc9287f(fmt, buffer) {
    // get view
    const view = new DataView(buffer.buffer);
    // prepare result
    const result = [];
    // read arguments
    let pos = 0;
    for (const code of fmt)switch(code){
        case "s":
            {
                let end = buffer.indexOf(0, pos);
                if (end === -1) end = buffer.length;
                result.push($fab42eb3dee39b5b$export$f84e8e69fd4488a5(buffer.slice(pos, end)));
                pos = end;
                break;
            }
        case "b":
            result.push(buffer.slice(pos));
            pos = buffer.length;
            break;
        case "o":
            result.push(buffer[pos]);
            pos += 1;
            break;
        case "h":
            result.push(view.getUint16(pos, true));
            pos += 2;
            break;
        case "i":
            result.push(view.getUint32(pos, true));
            pos += 4;
            break;
        case "q":
            result.push(view.getBigUint64(pos, true));
            pos += 8;
            break;
        default:
            throw new Error(`Invalid format code: ${code}`);
    }
    return result;
}


const $189005054305d286$var$fsEndpoint = 0x3;
async function $189005054305d286$export$3cc322771f0aca5b(session, path) {
    // send command
    const cmd = (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("os", 0, path);
    await $189005054305d286$var$send(session, cmd, false);
    // await reply
    const reply = await $189005054305d286$var$receive(session, false);
    // verify "info" reply
    if (reply.length !== 6 || reply[0] !== 1) throw new Error("invalid message");
    // unpack "info" reply
    const args = (0, $fab42eb3dee39b5b$export$417857010dc9287f)("oi", reply.slice(1));
    return {
        name: "",
        isDir: args[0] === 1,
        size: args[1]
    };
}
async function $189005054305d286$export$d00618d8d97ebf68(session, dir) {
    // send command
    const cmd = (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("os", 1, dir);
    await $189005054305d286$var$send(session, cmd, false);
    // prepare infos
    const infos = [];
    while(true){
        // await reply
        const reply = await $189005054305d286$var$receive(session, true);
        if (!reply) return infos;
        // verify "info" reply
        if (reply.byteLength < 7 || reply[0] !== 1) throw new Error("invalid message");
        // unpack "info" reply
        const args = (0, $fab42eb3dee39b5b$export$417857010dc9287f)("ois", reply.slice(1));
        // add info
        infos.push({
            name: args[2],
            isDir: args[0] == 1,
            size: args[1]
        });
    }
}
async function $189005054305d286$export$72c04af63de9061a(session, file, report = null) {
    // stat file
    const info = await $189005054305d286$export$3cc322771f0aca5b(session, file);
    // prepare data
    const data = new Uint8Array(info.size);
    // read file in chunks of 5 KB
    let offset = 0;
    while(offset < info.size){
        // determine length
        const length = Math.min(5000, info.size - offset);
        // read range
        let range = await $189005054305d286$export$ec88705ee4409f46(session, file, offset, length, (pos)=>{
            if (report) report(offset + pos);
        });
        // append range
        data.set(range, offset);
        offset += range.byteLength;
    }
    return data;
}
async function $189005054305d286$export$ec88705ee4409f46(session, file, offset, length, report = null) {
    // send "open" command
    let cmd = (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("oos", 2, 0, file);
    await $189005054305d286$var$send(session, cmd, true);
    // send "read" command
    cmd = (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("oii", 3, offset, length);
    await $189005054305d286$var$send(session, cmd, false);
    // prepare data
    let data = new Uint8Array(length);
    // prepare counter
    let count = 0;
    while(true){
        // await reply
        let reply = await $189005054305d286$var$receive(session, true);
        if (!reply) break;
        // verify "chunk" reply
        if (reply.byteLength <= 5 || reply[0] !== 2) throw new Error("invalid message");
        // get offset
        let replyOffset = (0, $fab42eb3dee39b5b$export$417857010dc9287f)("i", reply.slice(1))[0];
        // verify offset
        if (replyOffset !== offset + count) throw new Error("invalid message");
        // append data
        data.set(new Uint8Array(reply.buffer.slice(5)), count);
        // increment
        count += reply.byteLength - 5;
        // report length
        if (report) report(count);
    }
    // send "close" command
    cmd = (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("o", 5);
    await $189005054305d286$var$send(session, cmd, true);
    return data;
}
async function $189005054305d286$export$552bfb764b5cd2b4(session, file, data, report = null) {
    // send "create" command (create & truncate)
    let cmd = (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("oos", 2, 5, file);
    await $189005054305d286$var$send(session, cmd, true);
    // TODO: Dynamically determine channel MTU?
    // write data in 500-byte chunks
    let num = 0;
    let offset = 0;
    while(offset < data.byteLength){
        // determine chunk size and chunk data
        let chunkSize = Math.min(500, data.byteLength - offset);
        let chunkData = data.slice(offset, offset + chunkSize);
        // determine mode
        let acked = num % 10 === 0;
        // prepare "write" command (acked or silent & sequential)
        cmd = (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("ooib", 4, acked ? 0 : 3, offset, chunkData);
        // send "write" command
        await $189005054305d286$var$send(session, cmd, false);
        // receive ack or "error" replies
        if (acked) await $189005054305d286$var$receive(session, true);
        // increment offset
        offset += chunkSize;
        // report offset
        if (report) report(offset);
        // increment count
        num += 1;
    }
    // send "close" command
    cmd = (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("o", 5);
    await $189005054305d286$var$send(session, cmd, true);
}
async function $189005054305d286$export$e355e6d7686ffc32(session, from, to) {
    // send command
    let cmd = (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("osos", 6, from, 0, to);
    await $189005054305d286$var$send(session, cmd, false);
    // await reply
    await $189005054305d286$var$receive(session, true);
}
async function $189005054305d286$export$5c4e774b0e27d36b(session, path) {
    // send command
    let cmd = (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("os", 7, path);
    await $189005054305d286$var$send(session, cmd, true);
}
async function $189005054305d286$export$3b8a92549237260e(session, file) {
    // send command
    let cmd = (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("os", 8, file);
    await $189005054305d286$var$send(session, cmd, false);
    // await reply
    let reply = await $189005054305d286$var$receive(session, false);
    // verify "chunk" reply
    if (reply.byteLength !== 33 || reply[0] !== 3) throw new Error("invalid message");
    // return hash
    return new Uint8Array(reply.buffer.slice(1));
}
/* Helpers */ async function $189005054305d286$var$receive(session, expectAck, timeout = 5000) {
    // receive reply
    let [data] = await session.receive($189005054305d286$var$fsEndpoint, expectAck, timeout);
    if (!data) return null;
    // handle errors
    if (data[0] === 0) throw new Error("posix error: " + data[1]);
    return data;
}
async function $189005054305d286$var$send(session, data, awaitAck, timeout = 5000) {
    // send command
    await session.send($189005054305d286$var$fsEndpoint, data, awaitAck ? timeout : 0);
}


var $d41f8f42b7b1f821$exports = {};

$parcel$export($d41f8f42b7b1f821$exports, "makeHTTPDevice", () => $d41f8f42b7b1f821$export$de43e2bbe0f84dac);
$parcel$export($d41f8f42b7b1f821$exports, "HTTPDevice", () => $d41f8f42b7b1f821$export$a947a71ad4d6575);

function $d41f8f42b7b1f821$export$de43e2bbe0f84dac(addr) {
    return new $d41f8f42b7b1f821$export$a947a71ad4d6575(addr);
}
class $d41f8f42b7b1f821$export$a947a71ad4d6575 {
    ch = null;
    constructor(address){
        // store address
        this.address = address;
    }
    id() {
        return "http/" + this.address;
    }
    async open() {
        // check channel
        if (this.ch) throw new Error("channel already open");
        // create socket
        const socket = new WebSocket("ws://" + this.address);
        // await connections
        await new Promise((resolve, reject)=>{
            socket.onopen = resolve;
            socket.onerror = reject;
        });
        // create list
        const subscribers = new (0, $99f74415292121e0$export$6b278a59f65cf1eb)();
        // handle messages
        socket.onmessage = async (msg)=>{
            const data = new Uint8Array(await msg.data.arrayBuffer());
            subscribers.dispatch(data);
        };
        // create channel
        this.ch = {
            name: ()=>"http",
            valid () {
                return true;
            },
            subscribe: (q)=>{
                subscribers.add(q);
            },
            unsubscribe (queue) {
                subscribers.drop(queue);
            },
            write: async (data)=>{
                socket.send(data);
            },
            close: ()=>{
                socket.close();
                this.ch = null;
            }
        };
        return this.ch;
    }
}


var $eb2d9580c7f35431$exports = {};

$parcel$export($eb2d9580c7f35431$exports, "ManagedDevice", () => $eb2d9580c7f35431$export$86abcda9a311d473);

var $5f0bc7af558cc661$exports = {};

$parcel$export($5f0bc7af558cc661$exports, "Status", () => $5f0bc7af558cc661$export$96e9906d6d93a972);
$parcel$export($5f0bc7af558cc661$exports, "Session", () => $5f0bc7af558cc661$export$1fb4852a55678982);


let $5f0bc7af558cc661$export$96e9906d6d93a972;
(function(Status) {
    Status[Status["locked"] = 1] = "locked";
})($5f0bc7af558cc661$export$96e9906d6d93a972 || ($5f0bc7af558cc661$export$96e9906d6d93a972 = {}));
class $5f0bc7af558cc661$export$1fb4852a55678982 {
    static async open(ch) {
        // prepare queue
        const queue = new (0, $99f74415292121e0$export$3dc07afe418952bc)();
        // subscribe to channel
        ch.subscribe(queue);
        // prepare handle
        let handle = (0, $fab42eb3dee39b5b$export$4385e60b38654f68)(16);
        // begin session
        await (0, $99f74415292121e0$export$68d8715fc104d294)(ch, new (0, $99f74415292121e0$export$f69c19e57285b83a)(0, 0, (0, $fab42eb3dee39b5b$export$fc336dbfaf62f18f)(handle)));
        // await reply
        let sid;
        for(;;){
            const reply = await (0, $99f74415292121e0$export$aafa59e2e03f2942)(queue, 10000);
            if (reply.endpoint === 0 && (0, $fab42eb3dee39b5b$export$f84e8e69fd4488a5)(reply.data) === handle) {
                sid = reply.session;
                break;
            }
        }
        return new $5f0bc7af558cc661$export$1fb4852a55678982(sid, ch, queue);
    }
    constructor(id, ch, qu){
        this.id = id;
        this.ch = ch;
        this.qu = qu;
    }
    async ping(timeout) {
        // write command
        await (0, $99f74415292121e0$export$68d8715fc104d294)(this.ch, new (0, $99f74415292121e0$export$f69c19e57285b83a)(this.id, 0xfe, null));
        // read reply
        const msg = await this.read(timeout);
        // verify reply
        if (msg.endpoint !== 0xfe || msg.size() !== 1) throw new Error("invalid message");
        else if (msg.data[0] !== 1) throw new Error("session error: " + msg.data[0]);
    }
    async query(endpoint, timeout) {
        // write command
        await (0, $99f74415292121e0$export$68d8715fc104d294)(this.ch, new (0, $99f74415292121e0$export$f69c19e57285b83a)(this.id, endpoint, null));
        // read reply
        const msg = await this.read(timeout);
        // verify message
        if (msg.endpoint !== 0xfe || msg.data.byteLength !== 1) throw new Error("invalid message");
        return msg.data[0] === 1;
    }
    async receive(endpoint, expectAck, timeout) {
        // await message
        const msg = await this.read(timeout);
        // handle ack
        if (msg.endpoint === 0xfe) {
            // check size
            if (msg.size() !== 1) throw new Error("invalid ack size: " + msg.size());
            // check if OK
            if (msg.data[0] === 1) {
                if (expectAck) return [
                    null,
                    true
                ];
                else throw new Error("unexpected ack");
            }
            throw $5f0bc7af558cc661$var$parseError(msg.data[0]);
        }
        // check endpoint
        if (msg.endpoint !== endpoint) throw new Error("unexpected endpoint: " + msg.endpoint);
        return [
            msg.data,
            false
        ];
    }
    async send(endpoint, data, ackTimeout) {
        // write message
        await (0, $99f74415292121e0$export$68d8715fc104d294)(this.ch, new (0, $99f74415292121e0$export$f69c19e57285b83a)(this.id, endpoint, data));
        // return if timeout is zero
        if (ackTimeout === 0) return;
        // await reply
        const msg = await this.read(ackTimeout);
        // check reply
        if (msg.data.byteLength !== 1 || msg.endpoint !== 0xfe) throw new Error("invalid message");
        else if (msg.data[0] !== 1) throw $5f0bc7af558cc661$var$parseError(msg.data[0]);
    }
    async status(timeout) {
        // write command
        let cmd = (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("o", 0);
        await this.send(0xfd, cmd, 0);
        // wait reply
        const [reply] = await this.receive(0xfd, false, timeout);
        // verify reply
        if (reply.length !== 1) throw new Error("invalid message");
        // unpack status
        let status = (0, $fab42eb3dee39b5b$export$417857010dc9287f)("o", reply)[0];
        return status;
    }
    async unlock(password, timeout) {
        // prepare command
        let cmd = (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("os", 1, password);
        await this.send(0xfd, cmd, 0);
        // wait reply
        const [reply] = await this.receive(0xfd, false, timeout);
        // verify reply
        if (reply.length !== 1) throw new Error("invalid message");
        return reply[0] === 1;
    }
    async end(timeout) {
        // write command
        await (0, $99f74415292121e0$export$68d8715fc104d294)(this.ch, new (0, $99f74415292121e0$export$f69c19e57285b83a)(this.id, 0xff, null));
        // read reply
        const msg = await this.read(timeout);
        // verify reply if available
        if (msg && (msg.endpoint !== 0xff || msg.size() > 0)) throw new Error("invalid message");
        // unsubscribe from channel
        this.ch.unsubscribe(this.qu);
    }
    async read(timeout) {
        for(;;){
            const msg = await (0, $99f74415292121e0$export$aafa59e2e03f2942)(this.qu, timeout);
            if (msg.session === this.id) return msg;
        }
    }
}
function $5f0bc7af558cc661$var$parseError(num) {
    switch(num){
        case 1:
            return new Error("invalid session");
        case 2:
            return new Error("invalid endpoint");
        case 3:
            return new Error("invalid data");
        default:
            return new Error("expected ack");
    }
}


class $eb2d9580c7f35431$export$86abcda9a311d473 {
    password = null;
    queue = new (0, $hgUW1$Queue)();
    constructor(device){
        // set device
        this.device = device;
        // start pinger
        this.pinger = setInterval(async ()=>{
            if (this.active()) await this.useSession(async (session)=>{
                await session.ping(1000);
            });
        }, 5000);
    }
    async activate() {
        // check state
        if (this.active()) return;
        // open channel
        this.channel = await this.device.open();
    }
    active() {
        return this.channel != null;
    }
    async locked() {
        // check state
        if (!this.active()) throw new Error("device not active");
        // get status
        let status;
        await this.useSession(async (session)=>{
            status = await session.status(1000);
        });
        return (status & (0, $5f0bc7af558cc661$export$96e9906d6d93a972).locked) != 0;
    }
    async unlock(password) {
        // check state
        if (!this.active()) throw new Error("device not active");
        // unlock
        let unlocked;
        await this.useSession(async (session)=>{
            unlocked = await session.unlock(password, 1000);
        });
        // store password if unlocked
        if (unlocked) this.password = password;
        return unlocked;
    }
    async newSession() {
        // check state
        if (!this.active()) throw new Error("device not active");
        // open new session
        const session = await (0, $5f0bc7af558cc661$export$1fb4852a55678982).open(this.channel);
        // get session status
        let status = await session.status(1000);
        // try to unlock if password is available and locked
        if (this.password && status & (0, $5f0bc7af558cc661$export$96e9906d6d93a972).locked) await session.unlock(this.password, 1000);
        return session;
    }
    async useSession(fn) {
        await this.queue.run(async ()=>{
            // check state
            if (!this.active()) throw new Error("device not active");
            // open session if absent
            if (!this.session) this.session = await this.newSession();
            // yield session
            try {
                await fn(this.session);
            } catch (e) {
                // close session
                this.session.end(1000).then();
                this.session = null;
                // rethrow
                throw e;
            }
        });
    }
    async deactivate() {
        // check state
        if (!this.active()) return;
        // capture state
        let channel = this.channel;
        let session = this.session;
        // clear state
        this.channel = null;
        this.session = null;
        // end session
        try {
            await session.end(1000);
        } catch (e) {
        // ignore
        }
        // close channel
        channel.close();
    }
    async stop() {
        // deactivate
        await this.deactivate();
        // stop pinger
        clearInterval(this.pinger);
        // clear device
        this.device = null;
    }
}


var $50b2a1fcb8a69e99$exports = {};

$parcel$export($50b2a1fcb8a69e99$exports, "ParamType", () => $50b2a1fcb8a69e99$export$426dc07f493a4c47);
$parcel$export($50b2a1fcb8a69e99$exports, "ParamMode", () => $50b2a1fcb8a69e99$export$e64bf06489774cd7);
$parcel$export($50b2a1fcb8a69e99$exports, "getParam", () => $50b2a1fcb8a69e99$export$ecf541e09a511845);
$parcel$export($50b2a1fcb8a69e99$exports, "setParam", () => $50b2a1fcb8a69e99$export$260ce70ca30cd65);
$parcel$export($50b2a1fcb8a69e99$exports, "listParams", () => $50b2a1fcb8a69e99$export$2428fb4221ce57da);
$parcel$export($50b2a1fcb8a69e99$exports, "readParam", () => $50b2a1fcb8a69e99$export$a44436b1b8efd60b);
$parcel$export($50b2a1fcb8a69e99$exports, "writeParam", () => $50b2a1fcb8a69e99$export$eb49a0586a768c1b);
$parcel$export($50b2a1fcb8a69e99$exports, "collectParams", () => $50b2a1fcb8a69e99$export$bf720df32fb7816d);
$parcel$export($50b2a1fcb8a69e99$exports, "clearParam", () => $50b2a1fcb8a69e99$export$8ec074d96e3cb6b5);

const $50b2a1fcb8a69e99$var$paramsEndpoint = 0x01;
let $50b2a1fcb8a69e99$export$426dc07f493a4c47;
(function(ParamType) {
    ParamType[ParamType["raw"] = 0] = "raw";
    ParamType[ParamType["string"] = 1] = "string";
    ParamType[ParamType["bool"] = 2] = "bool";
    ParamType[ParamType["long"] = 3] = "long";
    ParamType[ParamType["double"] = 4] = "double";
    ParamType[ParamType["action"] = 5] = "action";
})($50b2a1fcb8a69e99$export$426dc07f493a4c47 || ($50b2a1fcb8a69e99$export$426dc07f493a4c47 = {}));
let $50b2a1fcb8a69e99$export$e64bf06489774cd7;
(function(ParamMode) {
    ParamMode[ParamMode["volatile"] = 1] = "volatile";
    ParamMode[ParamMode["system"] = 2] = "system";
    ParamMode[ParamMode["application"] = 4] = "application";
    ParamMode[ParamMode["locked"] = 16] = "locked";
})($50b2a1fcb8a69e99$export$e64bf06489774cd7 || ($50b2a1fcb8a69e99$export$e64bf06489774cd7 = {}));
async function $50b2a1fcb8a69e99$export$ecf541e09a511845(s, name, timeout = 5000) {
    // prepare command
    const cmd = (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("os", 0, name);
    // send command
    await s.send($50b2a1fcb8a69e99$var$paramsEndpoint, cmd, 0);
    // receive value
    const [data] = await s.receive($50b2a1fcb8a69e99$var$paramsEndpoint, false, timeout);
    return data;
}
async function $50b2a1fcb8a69e99$export$260ce70ca30cd65(s, name, value, timeout = 5000) {
    // prepare command
    const cmd = (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("osob", 1, name, 0, value);
    // send command
    await s.send($50b2a1fcb8a69e99$var$paramsEndpoint, cmd, timeout);
}
async function $50b2a1fcb8a69e99$export$2428fb4221ce57da(s, timeout = 5000) {
    // send command
    await s.send($50b2a1fcb8a69e99$var$paramsEndpoint, (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("o", 2), 0);
    // prepare list
    const list = [];
    for(;;){
        // receive reply or return list on ack
        const [reply, ack] = await s.receive($50b2a1fcb8a69e99$var$paramsEndpoint, true, timeout);
        if (ack) break;
        // verify reply
        if (reply.length < 4) throw new Error("Invalid reply");
        // parse reply
        const ref = reply[0];
        const type = reply[1];
        const mode = reply[2];
        const name = (0, $fab42eb3dee39b5b$export$f84e8e69fd4488a5)(reply.slice(3));
        // TODO: Check type and mode.
        // append info
        list.push({
            ref: ref,
            type: type,
            mode: mode,
            name: name
        });
    }
    return list;
}
async function $50b2a1fcb8a69e99$export$a44436b1b8efd60b(s, ref, timeout = 5000) {
    // send command
    await s.send($50b2a1fcb8a69e99$var$paramsEndpoint, (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("oo", 3, ref), 0);
    // receive value
    const [data] = await s.receive($50b2a1fcb8a69e99$var$paramsEndpoint, false, timeout);
    return data;
}
async function $50b2a1fcb8a69e99$export$eb49a0586a768c1b(s, ref, value, timeout = 5000) {
    // prepare command
    const cmd = (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("oob", 4, ref, value);
    // send command
    await s.send($50b2a1fcb8a69e99$var$paramsEndpoint, cmd, timeout);
}
async function $50b2a1fcb8a69e99$export$bf720df32fb7816d(s, refs, since, timeout = 5000) {
    // prepare map
    let map = (BigInt(1) << BigInt(64)) - BigInt(1);
    if (refs.length > 0) {
        map = BigInt(0);
        for (const ref of refs)map |= BigInt(1) << BigInt(ref);
    }
    // prepare command
    const cmd = (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("oqq", 5, map, since);
    // send command
    await s.send($50b2a1fcb8a69e99$var$paramsEndpoint, cmd, 0);
    // prepare list
    const list = [];
    for(;;){
        // receive reply or return list on ack
        const [reply, ack] = await s.receive($50b2a1fcb8a69e99$var$paramsEndpoint, true, timeout);
        if (ack) break;
        // verify reply
        if (reply.length < 9) throw new Error("Invalid reply");
        // parse reply
        const view = new DataView(reply.buffer);
        const ref = reply[0];
        const age = view.getBigUint64(1, true);
        const value = reply.slice(9);
        // append info
        list.push({
            ref: ref,
            age: age,
            value: value
        });
    }
    return list;
}
async function $50b2a1fcb8a69e99$export$8ec074d96e3cb6b5(s, ref, timeout = 5000) {
    // send command
    await s.send($50b2a1fcb8a69e99$var$paramsEndpoint, (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("oo", 6, ref), timeout);
}



var $f1b85200f32d8427$exports = {};

$parcel$export($f1b85200f32d8427$exports, "serialRequest", () => $f1b85200f32d8427$export$989790aac965fb4);
$parcel$export($f1b85200f32d8427$exports, "SerialDevice", () => $f1b85200f32d8427$export$61b0d7921fd6a089);


async function $f1b85200f32d8427$export$989790aac965fb4(baudRate = 115200) {
    // request port
    let port;
    try {
        port = await navigator.serial.requestPort();
    } catch (err) {
    // ignore
    }
    if (!port) return null;
    return new $f1b85200f32d8427$export$61b0d7921fd6a089(port, baudRate);
}
class $f1b85200f32d8427$export$61b0d7921fd6a089 {
    ch = null;
    constructor(port, baudRate){
        // store port and baud rate
        this.port = port;
        this.baudRate = baudRate;
        // close open chanel if disconnected
        this.port.addEventListener("disconnect", ()=>{
            if (this.ch) {
                this.ch.close();
                this.ch = null;
            }
        });
    }
    id() {
        return "serial/" + this.port.getInfo().usbProductId;
    }
    async open() {
        // check channel
        if (this.ch) throw new Error("channel already open");
        // connect, if not connected already
        if (!this.port.readable) await this.port.open({
            baudRate: this.baudRate
        });
        // create list
        const subscribers = new (0, $99f74415292121e0$export$6b278a59f65cf1eb)();
        // create reader
        const reader = this.port.readable.getReader();
        // read data
        const read = async ()=>{
            try {
                let buffer = "";
                while(true){
                    // read data
                    const { done: done , value: value  } = await reader.read();
                    if (done) {
                        console.log("done");
                        break;
                    }
                    // Decode the chunk and add it to the buffer
                    buffer += (0, $fab42eb3dee39b5b$export$f84e8e69fd4488a5)(value);
                    // Split the buffer into lines
                    let lines = buffer.split("\n");
                    // Process all complete lines
                    for(let i = 0; i < lines.length - 1; i++)if (lines[i].startsWith("NAOS!")) {
                        const data = lines[i].slice(5);
                        subscribers.dispatch(Uint8Array.from(atob(data), (c)=>c.charCodeAt(0)));
                    }
                    // Save the last incomplete line back to the buffer
                    buffer = lines[lines.length - 1];
                }
            } catch (err) {
                console.error("Error reading stream:", err);
            } finally{
                reader.releaseLock();
            }
        };
        // start reading
        read().then();
        // create writer
        const writer = this.port.writable.getWriter();
        // create channel
        this.ch = {
            name: ()=>"serial",
            valid () {
                return true;
            },
            subscribe: (q)=>{
                subscribers.add(q);
            },
            unsubscribe (queue) {
                subscribers.drop(queue);
            },
            write: async (data)=>{
                await writer.write((0, $fab42eb3dee39b5b$export$fc336dbfaf62f18f)("NAOS!"));
                await writer.write((0, $fab42eb3dee39b5b$export$37cc283d8fbd3462)(data));
                await writer.write((0, $fab42eb3dee39b5b$export$fc336dbfaf62f18f)("\n"));
            },
            close: ()=>{
                writer.close();
                writer.releaseLock();
                reader.cancel();
                reader.releaseLock();
                this.ch = null;
            }
        };
        return this.ch;
    }
}



var $e1163a73e33a3ccf$exports = {};

$parcel$export($e1163a73e33a3ccf$exports, "update", () => $e1163a73e33a3ccf$export$722fbec263ad908a);

const $e1163a73e33a3ccf$var$updateEndpoint = 0x2;
async function $e1163a73e33a3ccf$export$722fbec263ad908a(session, data, report = null, timeout = 30000) {
    // send "begin" command
    let cmd = (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("oi", 0, data.length);
    await session.send($e1163a73e33a3ccf$var$updateEndpoint, cmd, 0);
    // receive reply
    let [reply] = await session.receive($e1163a73e33a3ccf$var$updateEndpoint, false, timeout);
    // verify reply
    if (reply.length !== 1 && reply[0] !== 0) throw new Error("invalid message");
    // TODO: Dynamically determine channel MTU.
    // write data in 500-byte chunks
    let num = 0;
    let offset = 0;
    while(offset < data.length){
        // determine chunks size
        let chunkSize = Math.min(500, data.length - offset);
        let chunkData = data.slice(offset, offset + chunkSize);
        // determine acked
        let acked = num % 10 == 0;
        // send "write" command
        cmd = (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("oob", 1, acked ? 1 : 0, chunkData);
        await session.send($e1163a73e33a3ccf$var$updateEndpoint, cmd, acked ? timeout : 0);
        // increment offset
        offset += chunkSize;
        // report offset
        if (report) report(offset);
        // increment counter
        num++;
    }
    // send "finish" command
    cmd = (0, $fab42eb3dee39b5b$export$2a703dbb0cb35339)("o", 3);
    await session.send($e1163a73e33a3ccf$var$updateEndpoint, cmd, 0);
    // receive reply
    [reply] = await session.receive($e1163a73e33a3ccf$var$updateEndpoint, false, timeout);
    // verify reply
    if (reply.length !== 1 && reply[0] !== 1) throw new Error("invalid message");
}





export {$9224a2c5eeae1672$export$b699ee72de2ebcbd as bleRequest, $9224a2c5eeae1672$export$926ab273976713de as BLEDevice, $99f74415292121e0$export$3dc07afe418952bc as Queue, $99f74415292121e0$export$6b278a59f65cf1eb as QueueList, $99f74415292121e0$export$f69c19e57285b83a as Message, $99f74415292121e0$export$aafa59e2e03f2942 as read, $99f74415292121e0$export$68d8715fc104d294 as write, $189005054305d286$export$3cc322771f0aca5b as statPath, $189005054305d286$export$d00618d8d97ebf68 as listDir, $189005054305d286$export$72c04af63de9061a as readFile, $189005054305d286$export$ec88705ee4409f46 as readFileRange, $189005054305d286$export$552bfb764b5cd2b4 as writeFile, $189005054305d286$export$e355e6d7686ffc32 as renamePath, $189005054305d286$export$5c4e774b0e27d36b as removePath, $189005054305d286$export$3b8a92549237260e as sha256File, $d41f8f42b7b1f821$export$de43e2bbe0f84dac as makeHTTPDevice, $d41f8f42b7b1f821$export$a947a71ad4d6575 as HTTPDevice, $eb2d9580c7f35431$export$86abcda9a311d473 as ManagedDevice, $50b2a1fcb8a69e99$export$426dc07f493a4c47 as ParamType, $50b2a1fcb8a69e99$export$e64bf06489774cd7 as ParamMode, $50b2a1fcb8a69e99$export$ecf541e09a511845 as getParam, $50b2a1fcb8a69e99$export$260ce70ca30cd65 as setParam, $50b2a1fcb8a69e99$export$2428fb4221ce57da as listParams, $50b2a1fcb8a69e99$export$a44436b1b8efd60b as readParam, $50b2a1fcb8a69e99$export$eb49a0586a768c1b as writeParam, $50b2a1fcb8a69e99$export$bf720df32fb7816d as collectParams, $50b2a1fcb8a69e99$export$8ec074d96e3cb6b5 as clearParam, $89603ac6c30e3b84$export$c24e73273208a9bb as AsyncQueue, $f1b85200f32d8427$export$989790aac965fb4 as serialRequest, $f1b85200f32d8427$export$61b0d7921fd6a089 as SerialDevice, $5f0bc7af558cc661$export$96e9906d6d93a972 as Status, $5f0bc7af558cc661$export$1fb4852a55678982 as Session, $e1163a73e33a3ccf$export$722fbec263ad908a as update, $fab42eb3dee39b5b$export$fc336dbfaf62f18f as toBuffer, $fab42eb3dee39b5b$export$f84e8e69fd4488a5 as toString, $fab42eb3dee39b5b$export$37cc283d8fbd3462 as toBase64, $fab42eb3dee39b5b$export$c537b38001c583b7 as fromBase64, $fab42eb3dee39b5b$export$ee1b3e54f0441b22 as concat, $fab42eb3dee39b5b$export$4385e60b38654f68 as random, $fab42eb3dee39b5b$export$dd4f63edb9ba1490 as requestFile, $fab42eb3dee39b5b$export$2a703dbb0cb35339 as pack, $fab42eb3dee39b5b$export$417857010dc9287f as unpack};
//# sourceMappingURL=main.js.map
