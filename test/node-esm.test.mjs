import { Encoder, Decoder } from '../dist/sctp.node.mjs';
import assert from 'assert';

async function runTest() {
    console.log('Running tests for sctp.js...');

    // 2. Initialize Encoder and Decoder
    const encoder = new Encoder();
    await encoder.init();

    const decoder = new Decoder();
    await decoder.init();

    // 3. Encode a variety of data types
    console.log('Encoding data...');
    encoder.addInt8(-128);
    encoder.addUint8(255);
    encoder.addInt16(-32768);
    encoder.addUint16(65535);
    encoder.addInt32(-2147483648);
    encoder.addUint32(4294967295);
    encoder.addInt64(-9223372036854775808n);
    encoder.addUint64(18446744073709551615n);
    encoder.addFloat32(123.456);
    encoder.addFloat64(987.654321);
    encoder.addShort(10);
    encoder.addVector(new Uint8Array([1, 2, 3, 4, 5]));
    encoder.addUleb128(12345678901234567890n);
    encoder.addSleb128(-1234567890123456789n);

    const encodedData = encoder.build();
    console.log(`Encoded ${encodedData.length} bytes.`, encodedData);

    // 4. Decode the data
    console.log('Decoding data...');
    const decodedFields = decoder.decode(encodedData);

    // 5. Assertions
    console.log('Verifying decoded data...');
    assert.strictEqual(decodedFields.length, 15, 'Should have 15 fields (including EOF)');

    assert.deepStrictEqual(decodedFields[0], { type: 'INT8', value: -128 });
    assert.deepStrictEqual(decodedFields[1], { type: 'UINT8', value: 255 });
    assert.deepStrictEqual(decodedFields[2], { type: 'INT16', value: -32768 });
    assert.deepStrictEqual(decodedFields[3], { type: 'UINT16', value: 65535 });
    assert.deepStrictEqual(decodedFields[4], { type: 'INT32', value: -2147483648 });
    assert.deepStrictEqual(decodedFields[5], { type: 'UINT32', value: 4294967295 });
    assert.deepStrictEqual(decodedFields[6], {
        type: 'INT64',
        value: -9223372036854775808n,
    });
    assert.deepStrictEqual(decodedFields[7], {
        type: 'UINT64',
        value: 18446744073709551615n,
    });
    assert.ok(Math.abs(decodedFields[8].value - 123.456) < 0.001, 'FLOAT32 value mismatch');
    assert.deepStrictEqual(decodedFields[9], {
        type: 'FLOAT64',
        value: 987.654321,
    });
    assert.deepStrictEqual(decodedFields[10], { type: 'SHORT', value: 10 });
    assert.deepStrictEqual(decodedFields[11], {
        type: 'VECTOR',
        value: new Uint8Array([1, 2, 3, 4, 5]),
    });
    assert.deepStrictEqual(decodedFields[12], {
        type: 'ULEB128',
        value: 12345678901234567890n,
    });
    assert.deepStrictEqual(decodedFields[13], {
        type: 'SLEB128',
        value: -1234567890123456789n,
    });
    assert.deepStrictEqual(decodedFields[14], { type: 'EOF' });

    // Test re-initialization
    console.log('Testing re-initialization...');
    const encoder2 = new Encoder();
    await encoder2.init();
    encoder2.addUint32(42);
    const newEncodedData = encoder2.build();

    const decoder2 = new Decoder();
    await decoder2.init();
    const newDecoded = decoder2.decode(newEncodedData);
    assert.deepStrictEqual(newDecoded[0], { type: 'UINT32', value: 42 });

    console.log('All tests passed!');
}

runTest().catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
});
