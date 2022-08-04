const given = f => f();
const event = require("@await/event");

const delay = timeout => new Promise(resolve => setTimeout(resolve, delay));
const retry = (f, { times, delay: timeout }) =>
    times <= 0 ?
        (() => { throw Error("no more retries") })() :
        f().catch(error => delay(timeout)
            .then(() => retry(f, { times: times - 1, delay: timeout })));

const net = require("net");


// FIXME: Should we set `keepAlive` to `true` (and `keepAliveInitialDelay`) by
// default?
module.exports = options => given((
    socket = net.connect(options)) =>
    event
    ({
        eventEmitter: socket,
        resolveOn: "connect",
        rejectOn:["error", "close"]
        //, timeout: 1000 * 5
    }).then(() => socket));
