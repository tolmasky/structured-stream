const UInt32 = { };
const i =
{ 
    BufferCreate: Buffer.alloc,
    BufferByteLength: Buffer.byteLength,
};

module.exports = socket => function write()
{try {
    const writes = Array.prototype.map.call(
        arguments,
        item =>
            typeof item === "number" ?
                [item, UInt32] :
            typeof item === "string" ?
                [i.BufferByteLength(item, "utf-8"), item] :
                [item.length, item]);
    const buffer = i.BufferCreate(writes
        .reduce((total, [length, mData]) =>
            total + 4 + (mData === UInt32 ? 0 : length), 0));

    writes.reduce(function (offset, [number, mData])
    {
        buffer.writeUInt32BE(number, offset);

        if (mData === UInt32)
            return offset + 4;

        if (typeof mData === "string")
            buffer.write(mData, offset + 4);
        else
            mData.copy(buffer, offset + 4);

        return offset + 4 + number;
    }, 0);

    socket.write(buffer);} catch (e) { console.log(arguments) }
}
