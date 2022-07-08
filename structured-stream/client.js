const given = f => f();
const event = require("@await/event");

const toRead = require("./to-read");
const toWrite = require("./to-write");
const connect = require("./connect");

const Stream = require("stream");


module.exports = async function (source, handlers)
{
    const stream = source instanceof Stream ?
        source :
        await connect(source);

    const connection = { read: toRead(stream), write: toWrite(stream) };
    const { read } = connection;

    if (typeof handlers.start === "function")
        await handlers.start(connection);

    while (true)
    {
        if (await done(stream)) {
            return console.error("FINISHED NORMALLY");
}
        const name = await read.string();

        if (!hasOwnProperty.call(handlers, name))
            throw Error(`Handler (${ name }) not found`);

        await handlers[name](connection);
    }
}

// FIXME: In-between errors?...
async function done(stream)
{
    if (stream.readableLength > 0)
        return false;

    if (!stream.readable)
        return true;

    const { name } = await event(
    {
        eventEmitter: stream,
        resolveOn: ["readable", "finish", "close"],
        rejectOn: ["error"]
    });

    // Node emits a final "readable" event before sending "end"... for some
    // reason. So what we're saying here is that we're for sure done if we're
    // not "readable", but if we are and there aren't any bytes to read, then we
    // have to continue waiting. Theoretically for an incoming "end".
    return  name !== "readable" ||
            stream.readableLength === 0 && await done(stream);
}