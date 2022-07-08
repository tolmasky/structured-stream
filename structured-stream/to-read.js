const { min } = Math;
const event = require("@await/event");
const readable = stream => event(
{
    eventEmitter: stream,
    resolveOn: "readable",
    rejectOn: ["error", "end"]
});

const readUInt32BE = async (stream) =>
    (await read(4, stream)).readUInt32BE(0);

const readFramedString = async function (stream)
{
    const bytes = await readFramedBuffer(stream);

    return bytes === null ? "" : bytes.toString();
}

const readFramedBuffer = async (stream) =>
    await read(await readUInt32BE(stream), stream);

module.exports = stream =>
({
    boolean: () => !!readUInt32BE(stream),
    UInt32BE: () => readUInt32BE(stream),
    string: () => readFramedString(stream),
    buffer: () => readFramedBuffer(stream),
    JSON: async () => JSON.parse(await readFramedString(stream)),
    async strings()
    {
        var index = 0;
        const count = await readUInt32BE(stream);
        const strings = [];

        for (; index < count; ++index)
            strings[index] = await readFramedString(stream);

        return strings;
    }
});

const read = (function ()
{
    return async function read(amount, stream)
    {
        const collected = await collect(amount, stream);

        return collected.length === 1 ?
            collected[0] :
            Buffer.concat(collected, amount);
    };

    async function collect(amount, stream)
    {
        if (!stream.readable)
            throw Error("Stream is not readable");

        const available = stream.readableLength;

        if (available <= 0)
        {
            await readable(stream);
    
            return collect(amount, stream);
        }

        const data = stream.read(min(amount, available));
        const remaining = amount - available;

        return remaining <= 0 ?
            [data] :
            [data, ...await collect(remaining, stream)];
    }
})();

