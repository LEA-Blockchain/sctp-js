import { createShim } from '@leachain/vm-shim';
import wasmBytecode from './sctp.dec.wasm';

let wasmModule;

const typeMap = {
    INT8: 0,
    UINT8: 1,
    INT16: 2,
    UINT16: 3,
    INT32: 4,
    UINT32: 5,
    INT64: 6,
    UINT64: 7,
    ULEB128: 8,
    SLEB128: 9,
    FLOAT32: 10,
    FLOAT64: 11,
    SHORT: 12,
    VECTOR: 13,
    EOF: 15,
};

const typeIdToName = Object.fromEntries(Object.entries(typeMap).map(([name, id]) => [id, name]));

/**
 * @class Decoder
 * @description Wraps the SCTP WASM decoder module to provide a simple JavaScript interface for decoding data.
 */
export class Decoder {
    constructor() {
        this.instance = null;
        this.memory = null;
    }

    async init() {
        if (!wasmModule) {
            wasmModule = await WebAssembly.compile(wasmBytecode);
        }
        const shim = createShim();
        const instance = await WebAssembly.instantiate(wasmModule, shim.importObject);
        shim.bindInstance(instance);
        this.instance = instance;
        this.memory = this.instance.exports.memory;
        return this;
    }

    /**
     * Decodes a buffer of SCTP-encoded data.
     * @param {Uint8Array} encodedData The byte array to decode.
     * @returns {Array<{type: string, value: any}>} An array of decoded field objects, each with a `type` and `value`.
     */
    decode(encodedData) {
        if (!this.instance) throw new Error('Decoder not initialized.');

        const bufferPtr = this.instance.exports.__lea_malloc(encodedData.length);
        if (bufferPtr === 0) {
            throw new Error('Failed to allocate memory in WASM for decoder.');
        }

        new Uint8Array(this.memory.buffer, bufferPtr, encodedData.length).set(encodedData);

        const decoderPtr = this.instance.exports.sctp_decoder_from_buffer(bufferPtr, encodedData.length);

        const decodedFields = [];
        while (this.instance.exports.sctp_decoder_next(decoderPtr) !== typeMap.EOF) {
            const dec = new DataView(this.memory.buffer);
            const lastType = dec.getUint32(decoderPtr + 12, true);
            const lastValuePtr = decoderPtr + 16;
            const lastSize = dec.getUint32(decoderPtr + 24, true);
            const typeName = typeIdToName[lastType];
            const view = new DataView(this.memory.buffer);
            let value;

            switch (typeName) {
                case 'INT8':
                    value = view.getInt8(lastValuePtr);
                    break;
                case 'UINT8':
                    value = view.getUint8(lastValuePtr);
                    break;
                case 'INT16':
                    value = view.getInt16(lastValuePtr, true);
                    break;
                case 'UINT16':
                    value = view.getUint16(lastValuePtr, true);
                    break;
                case 'INT32':
                    value = view.getInt32(lastValuePtr, true);
                    break;
                case 'UINT32':
                    value = view.getUint32(lastValuePtr, true);
                    break;
                case 'INT64':
                    value = view.getBigInt64(lastValuePtr, true);
                    break;
                case 'UINT64':
                    value = view.getBigUint64(lastValuePtr, true);
                    break;
                case 'FLOAT32':
                    value = view.getFloat32(lastValuePtr, true);
                    break;
                case 'FLOAT64':
                    value = view.getFloat64(lastValuePtr, true);
                    break;
                case 'SHORT':
                    value = view.getUint8(lastValuePtr);
                    break;
                case 'VECTOR': {
                    const ptr = view.getUint32(lastValuePtr, true);
                    value = new Uint8Array(this.memory.buffer, ptr, lastSize).slice();
                    break;
                }
                case 'ULEB128':
                    value = view.getBigUint64(lastValuePtr, true);
                    break;
                case 'SLEB128':
                    value = view.getBigInt64(lastValuePtr, true);
                    break;
                default:
                    // This case should ideally not be hit if the WASM module is correct.
                    throw new Error(`Unknown SCTP type ID: ${lastType}`);
            }
            decodedFields.push({ type: typeName, value });
        }
        decodedFields.push({ type: 'EOF' });
        this.instance.exports.__lea_allocator_reset();
        return decodedFields;
    }
}
