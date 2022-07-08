const given = f => f();
const event = require("@await/event");

const delay = timeout => new Promise(resolve => setTimeout(resolve, delay));
const retry = (f, { times, delay: timeout }) =>
    times <= 0 ?
        (() => { throw Error("no more retries") })() :
        f().catch(error => delay(timeout)
            .then(() => retry(f, { times: times - 1, delay: timeout })));

const net = require("net");


module.exports = ({ port, host }) => given((
    socket = net.createConnection(port, host)) =>
    event
    ({
        eventEmitter: socket,
        resolveOn: "connect",
        rejectOn:["error", "close"]
        //, timeout: 1000 * 5
    }).then(() => socket));
