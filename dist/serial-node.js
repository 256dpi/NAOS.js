import {SerialPort as $2MdkL$SerialPort} from "serialport";
import $2MdkL$serialportparserreadline from "@serialport/parser-readline";



class $aa3f839fb81c244d$export$c24e73273208a9bb {
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


class $aa2d5532cb55e3ab$export$3dc07afe418952bc extends (0, $aa3f839fb81c244d$export$c24e73273208a9bb) {
}
class $aa2d5532cb55e3ab$export$6b278a59f65cf1eb {
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
class $aa2d5532cb55e3ab$export$f69c19e57285b83a {
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
async function $aa2d5532cb55e3ab$export$aafa59e2e03f2942(queue, timeout) {
    // read from queue
    const data = await queue.pop(timeout);
    if (!data) throw new Error("timeout");
    // check length and version
    if (data.length < 4 || data[0] !== 1) throw new Error("invalid message");
    // get view
    const view = new DataView(data.buffer);
    return new $aa2d5532cb55e3ab$export$f69c19e57285b83a(view.getUint16(1, true), data[3], data.length > 4 ? data.slice(4) : null);
}
async function $aa2d5532cb55e3ab$export$68d8715fc104d294(ch, msg) {
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


const $6b0ddb031a0df909$var$utf8Enc = new TextEncoder();
const $6b0ddb031a0df909$var$utf8Dec = new TextDecoder();
function $6b0ddb031a0df909$export$fc336dbfaf62f18f(string) {
    return $6b0ddb031a0df909$var$utf8Enc.encode(string);
}
function $6b0ddb031a0df909$export$f84e8e69fd4488a5(buffer) {
    return $6b0ddb031a0df909$var$utf8Dec.decode(buffer);
}
function $6b0ddb031a0df909$export$37cc283d8fbd3462(buffer) {
    return $6b0ddb031a0df909$export$fc336dbfaf62f18f(btoa(String.fromCharCode(...new Uint8Array(buffer))));
}
function $6b0ddb031a0df909$export$c537b38001c583b7(base64) {
    return new Uint8Array(atob(base64).split("").map((c)=>c.charCodeAt(0)));
}
function $6b0ddb031a0df909$export$ee1b3e54f0441b22(buf1, buf2) {
    const buf = new Uint8Array(buf1.byteLength + buf2.byteLength);
    buf.set(buf1, 0);
    buf.set(buf2, buf1.byteLength);
    return buf;
}
function $6b0ddb031a0df909$export$4385e60b38654f68(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for(let i = 0; i < length; i++){
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}
function $6b0ddb031a0df909$export$66b0e5ed4f34432a(length) {
    return crypto.getRandomValues(new Uint8Array(length));
}
async function $6b0ddb031a0df909$export$e10eb67e19628714(key, challenge) {
    // import HMAC key
    const cryptoKey = await crypto.subtle.importKey("raw", key, {
        name: "HMAC",
        hash: {
            name: "SHA-256"
        }
    }, false, [
        "sign"
    ]);
    // generate the HMAC
    const res = await crypto.subtle.sign("HMAC", cryptoKey, challenge);
    return new Uint8Array(res);
}
function $6b0ddb031a0df909$export$dd4f63edb9ba1490(file) {
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
function $6b0ddb031a0df909$export$2a703dbb0cb35339(fmt, ...args) {
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
            buffer.set($6b0ddb031a0df909$export$fc336dbfaf62f18f(arg), offset);
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
function $6b0ddb031a0df909$export$417857010dc9287f(fmt, buffer) {
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
                result.push($6b0ddb031a0df909$export$f84e8e69fd4488a5(buffer.slice(pos, end)));
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
function $6b0ddb031a0df909$export$398604a469f7de9a(buf1, buf2) {
    // check lengths
    if (buf1.byteLength !== buf2.byteLength) return false;
    // compare bytes
    const view1 = new DataView(buf1.buffer);
    const view2 = new DataView(buf2.buffer);
    let i = buf1.byteLength;
    while(i--){
        if (view1.getUint8(i) !== view2.getUint8(i)) return false;
    }
    return true;
}


const $b88665a077501510$var$knownPrefixes = [
    "tty.SLAB",
    "tty.usbserial",
    "tty.usbmodem",
    "ttyUSB"
];
async function $b88665a077501510$export$3f628d5f6f2c283b() {
    const ports = await (0, $2MdkL$SerialPort).list();
    // get paths, sort reverse to list combined ports with serial port first
    const paths = ports.map((p)=>p.path).sort().reverse();
    // filter to known prefixes
    return paths.filter((path)=>$b88665a077501510$var$knownPrefixes.some((prefix)=>path.includes(prefix)));
}
class $b88665a077501510$export$875c5c6cbf01e2d8 {
    port = null;
    ch = null;
    constructor(path, baudRate = 115200){
        this.path = path;
        this.baudRate = baudRate;
    }
    id() {
        return `serial/${this.path}`;
    }
    async open() {
        // check channel
        if (this.ch) throw new Error("channel already open");
        // open port
        this.port = await new Promise((resolve, reject)=>{
            const port = new (0, $2MdkL$SerialPort)({
                path: this.path,
                baudRate: this.baudRate
            }, (err)=>{
                if (err) reject(err);
                else resolve(port);
            });
        });
        // create list
        const subscribers = new (0, $aa2d5532cb55e3ab$export$6b278a59f65cf1eb)();
        // parse lines and dispatch NAOS frames
        const parser = this.port.pipe(new (0, $2MdkL$serialportparserreadline)({
            delimiter: "\n"
        }));
        parser.on("data", (line)=>{
            if (line.startsWith("NAOS!")) {
                const data = line.slice(5);
                subscribers.dispatch(Uint8Array.from(atob(data), (c)=>c.charCodeAt(0)));
            }
        });
        // prepare flag
        let closed = false;
        // handle close
        this.port.on("close", ()=>{
            closed = true;
            if (this.ch) this.ch = null;
        });
        // capture port ref for channel
        const port = this.port;
        // create channel
        this.ch = {
            name: ()=>"serial",
            valid: ()=>!closed,
            width: ()=>1,
            subscribe: (q)=>{
                subscribers.add(q);
            },
            unsubscribe: (queue)=>{
                subscribers.drop(queue);
            },
            write: async (data)=>{
                const frame = new Uint8Array([
                    ...(0, $6b0ddb031a0df909$export$fc336dbfaf62f18f)("NAOS!"),
                    ...(0, $6b0ddb031a0df909$export$37cc283d8fbd3462)(data.buffer),
                    ...(0, $6b0ddb031a0df909$export$fc336dbfaf62f18f)("\n")
                ]);
                await new Promise((resolve, reject)=>{
                    port.write(frame, (err)=>{
                        if (err) reject(err);
                        else port.drain((err)=>err ? reject(err) : resolve());
                    });
                });
            },
            close: async ()=>{
                closed = true;
                this.ch = null;
                await new Promise((resolve, reject)=>{
                    port.close((err)=>{
                        if (err) reject(err);
                        else resolve();
                    });
                });
            }
        };
        return this.ch;
    }
}


export {$b88665a077501510$export$3f628d5f6f2c283b as listSerialPorts, $b88665a077501510$export$875c5c6cbf01e2d8 as NodeSerialDevice};
//# sourceMappingURL=serial-node.js.map
