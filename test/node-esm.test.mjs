import { SctpEncoder, SctpDecoder } from '@leachain/sctp';
import assert from 'assert';

async function runTest() {
    console.log('Running tests for sctp.js...');

    // 2. Initialize Encoder and Decoder
    const encoder = await SctpEncoder();
    encoder.init();

    const decoder = await SctpDecoder();

    // 3. Encode a variety of data types
    console.log('Encoding data...');
    encoder.addInt32(-123456);
    encoder.addUint32(123456);
    encoder.addInt64(-1234567890123456789n);
    encoder.addUint64(1234567890123456789n);
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
    assert.strictEqual(decodedFields.length, 11, 'Should have 11 fields (including EOF)');

    assert.deepStrictEqual(decodedFields[0], { type: 'INT32', value: -123456 });
    assert.deepStrictEqual(decodedFields[1], { type: 'UINT32', value: 123456 });
    assert.deepStrictEqual(decodedFields[2], { type: 'INT64', value: -1234567890123456789n });
    assert.deepStrictEqual(decodedFields[3], { type: 'UINT64', value: 1234567890123456789n });
    // Use approx equal for floats
    assert.ok(Math.abs(decodedFields[4].value - 123.456) < 0.001, 'FLOAT32 value mismatch');
    assert.deepStrictEqual(decodedFields[5], { type: 'FLOAT64', value: 987.654321 });
    assert.deepStrictEqual(decodedFields[6], { type: 'SHORT', value: 10 });
    assert.deepStrictEqual(decodedFields[7], { type: 'VECTOR', value: new Uint8Array([1, 2, 3, 4, 5]) });
    assert.deepStrictEqual(decodedFields[8], { type: 'ULEB128', value: 12345678901234567890n });
    assert.deepStrictEqual(decodedFields[9], { type: 'SLEB128', value: -1234567890123456789n });
    assert.deepStrictEqual(decodedFields[10], { type: 'EOF' });

    // Test re-initialization
    console.log('Testing re-initialization...');
    const encoder2 = await SctpEncoder();
    encoder2.init();
    encoder2.addInt8(42);
    const newEncodedData = encoder2.build();

    const decoder2 = await SctpDecoder();
    const newDecoded = decoder2.decode(newEncodedData);
    assert.deepStrictEqual(newDecoded[0], { type: 'INT8', value: 42 });

    console.log('All tests passed!');
}

runTest().catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
});
