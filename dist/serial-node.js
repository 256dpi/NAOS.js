import {SerialPort as $2MdkL$SerialPort} from "serialport";
import $2MdkL$serialportparserreadline from "@serialport/parser-readline";
import {basename as $2MdkL$basename} from "node:path";




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
                const index = this.waiters.indexOf(resolve);
                if (index >= 0) {
                    this.waiters.splice(index, 1);
                    resolve(null);
                }
            }, timeout);
        });
    }
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
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for(let i = 0; i < bytes.byteLength; i++)binary += String.fromCharCode(bytes[i]);
    return $6b0ddb031a0df909$export$fc336dbfaf62f18f(btoa(binary));
}
function $6b0ddb031a0df909$export$c537b38001c583b7(base64) {
    return new Uint8Array(atob(base64).split("").map((c)=>c.charCodeAt(0)));
}
function $6b0ddb031a0df909$export$ee1b3e54f0441b22(...parts) {
    let size = 0;
    for (const p of parts)size += p.byteLength;
    const buf = new Uint8Array(size);
    let offset = 0;
    for (const p of parts){
        buf.set(p, offset);
        offset += p.byteLength;
    }
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
            size += $6b0ddb031a0df909$export$fc336dbfaf62f18f(arg).byteLength;
            break;
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
    const view = $6b0ddb031a0df909$export$9bcaddb313b2c51f(buffer);
    // write arguments
    let offset = 0;
    for (const [index, arg] of args.entries())switch(fmt.charAt(index)){
        case "s":
            {
                const encoded = $6b0ddb031a0df909$export$fc336dbfaf62f18f(arg);
                buffer.set(encoded, offset);
                offset += encoded.byteLength;
                break;
            }
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
    const view = $6b0ddb031a0df909$export$9bcaddb313b2c51f(buffer);
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
                pos = end + 1;
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
function $6b0ddb031a0df909$export$9bcaddb313b2c51f(buffer) {
    return new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}
function $6b0ddb031a0df909$export$398604a469f7de9a(buf1, buf2) {
    // check lengths
    if (buf1.byteLength !== buf2.byteLength) return false;
    // compare bytes
    for(let i = 0; i < buf1.byteLength; i++){
        if (buf1[i] !== buf2[i]) return false;
    }
    return true;
}


class $aa2d5532cb55e3ab$export$3dc07afe418952bc extends (0, $aa3f839fb81c244d$export$c24e73273208a9bb) {
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
    static parse(data) {
        if (data.length < 4 || data[0] !== 1) return null;
        const view = (0, $6b0ddb031a0df909$export$9bcaddb313b2c51f)(data);
        return new $aa2d5532cb55e3ab$export$f69c19e57285b83a(view.getUint16(1, true), data[3], data.length > 4 ? data.slice(4) : null);
    }
    build() {
        const data = new Uint8Array(4 + this.size());
        const view = (0, $6b0ddb031a0df909$export$9bcaddb313b2c51f)(data);
        view.setUint8(0, 1);
        view.setUint16(1, this.session, true);
        view.setUint8(3, this.endpoint);
        if (this.data) data.set(this.data, 4);
        return data;
    }
}
class $aa2d5532cb55e3ab$export$cfdacaa37f9b4dd7 {
    closed = false;
    doneResolve = null;
    queues = new Set();
    opening = new Map();
    sessions = new Map();
    closing = new Map();
    constructor(tr, device, width, onClose){
        this.tr = tr;
        this.dev = device;
        this.widthValue = width;
        this.onClose = onClose;
        this.done = new Promise((resolve)=>{
            this.doneResolve = resolve;
        });
        const start = this.tr.start((msg)=>{
            for (const queue of this.route(msg))queue.push(msg);
        }, ()=>{
            if (!this.closed) this.close();
        });
        Promise.resolve(start).catch(()=>{
            if (!this.closed) this.close();
        });
    }
    width() {
        return this.widthValue;
    }
    device() {
        return this.dev;
    }
    subscribe(queue) {
        this.queues.add(queue);
    }
    unsubscribe(queue) {
        this.queues.delete(queue);
        for (const [handle, owner] of this.opening.entries())if (owner === queue) this.opening.delete(handle);
        for (const [session, owner] of this.sessions.entries())if (owner === queue) {
            this.sessions.delete(session);
            this.closing.delete(session);
        }
        for (const [session, owner] of this.closing.entries())if (owner === queue) this.closing.delete(session);
    }
    async write(queue, msg) {
        if (!queue) {
            await this.tr.write(msg);
            return;
        }
        if (msg.session !== 0) {
            const owner = this.sessions.get(msg.session);
            if (owner && owner !== queue) throw new Error("wrong owner");
        }
        if (msg.session === 0 && msg.endpoint === 0x0) this.opening.set(msg.data ? (0, $6b0ddb031a0df909$export$f84e8e69fd4488a5)(msg.data) : "", queue);
        if (msg.session !== 0 && msg.endpoint === 0xff) this.closing.set(msg.session, queue);
        try {
            await this.tr.write(msg);
        } catch (err) {
            if (msg.session === 0 && msg.endpoint === 0x0 && this.opening.get(msg.data ? (0, $6b0ddb031a0df909$export$f84e8e69fd4488a5)(msg.data) : "") === queue) this.opening.delete(msg.data ? (0, $6b0ddb031a0df909$export$f84e8e69fd4488a5)(msg.data) : "");
            if (msg.session !== 0 && msg.endpoint === 0xff && this.closing.get(msg.session) === queue) this.closing.delete(msg.session);
            throw err;
        }
    }
    async close() {
        if (this.closed) return;
        this.closed = true;
        try {
            await this.tr.close();
        } finally{
            this.onClose?.();
            this.doneResolve?.();
        }
    }
    route(msg) {
        if (msg.endpoint === 0x0) {
            const owner = this.opening.get(msg.data ? (0, $6b0ddb031a0df909$export$f84e8e69fd4488a5)(msg.data) : "");
            if (owner && this.queues.has(owner)) {
                this.opening.delete(msg.data ? (0, $6b0ddb031a0df909$export$f84e8e69fd4488a5)(msg.data) : "");
                this.sessions.set(msg.session, owner);
                return [
                    owner
                ];
            }
        }
        if (msg.session !== 0) {
            const owner = this.sessions.get(msg.session);
            if (owner && this.queues.has(owner)) {
                if (msg.endpoint === 0xff && msg.size() === 0) {
                    this.sessions.delete(msg.session);
                    this.closing.delete(msg.session);
                }
                return [
                    owner
                ];
            }
            this.sessions.delete(msg.session);
            this.closing.delete(msg.session);
            return [];
        }
        return Array.from(this.queues);
    }
}
async function $aa2d5532cb55e3ab$export$aafa59e2e03f2942(queue, timeout) {
    const msg = await queue.pop(timeout);
    if (!msg) throw new Error("timeout");
    return msg;
}



const $b88665a077501510$var$knownPrefixes = [
    "tty.SLAB",
    "tty.usbserial",
    "tty.usbmodem",
    "ttyUSB"
];
async function $b88665a077501510$export$9771b2cde0fbddb8() {
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
    type() {
        return "Serial";
    }
    name() {
        return $2MdkL$basename(this.path);
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
        // prepare flag
        let closed = false;
        // capture port ref for channel
        const port = this.port;
        const parser = this.port.pipe(new (0, $2MdkL$serialportparserreadline)({
            delimiter: "\n"
        }));
        let onLine = null;
        let onPortClose = null;
        const transport = {
            start: (onData, onClose)=>{
                onLine = (line)=>{
                    if (line.startsWith("NAOS!")) {
                        const data = line.slice(5);
                        const msg = (0, $aa2d5532cb55e3ab$export$f69c19e57285b83a).parse(Uint8Array.from(atob(data), (c)=>c.charCodeAt(0)));
                        if (msg) onData(msg);
                    }
                };
                onPortClose = ()=>{
                    closed = true;
                    onClose();
                };
                parser.on("data", onLine);
                port.on("close", onPortClose);
            },
            write: async (msg)=>{
                const frame = (0, $6b0ddb031a0df909$export$ee1b3e54f0441b22)((0, $6b0ddb031a0df909$export$fc336dbfaf62f18f)("\nNAOS!"), (0, $6b0ddb031a0df909$export$37cc283d8fbd3462)(msg.build()), (0, $6b0ddb031a0df909$export$fc336dbfaf62f18f)("\n"));
                await new Promise((resolve, reject)=>{
                    port.write(frame, (err)=>{
                        if (err) reject(err);
                        else port.drain((err)=>err ? reject(err) : resolve());
                    });
                });
            },
            close: async ()=>{
                closed = true;
                if (onLine) parser.off("data", onLine);
                if (onPortClose) port.off("close", onPortClose);
                await new Promise((resolve, reject)=>{
                    port.close((err)=>{
                        if (err) reject(err);
                        else resolve();
                    });
                });
            }
        };
        this.ch = new (0, $aa2d5532cb55e3ab$export$cfdacaa37f9b4dd7)(transport, this, 1, ()=>{
            this.ch = null;
        });
        return this.ch;
    }
}


export {$b88665a077501510$export$9771b2cde0fbddb8 as serialList, $b88665a077501510$export$875c5c6cbf01e2d8 as NodeSerialDevice};
//# sourceMappingURL=serial-node.js.map
