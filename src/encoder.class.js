/**
 * @module sctp
 */

import encoderWasmModule from './sctp.mvp.enc.wasm';

let wasmModule = null;

/**
 * @class SctpEncoderImpl
 * @private
 * @description Wraps the SCTP WASM encoder module to provide a simple JavaScript interface for encoding data.
 */
class SctpEncoderImpl {
    /**
     * @private
     * @param {WebAssembly.Instance} instance The WASM instance.
     * @param {WebAssembly.Memory} memory The WASM memory.
     */
    constructor(instance, memory) {
        this.instance = instance;
        this.memory = memory;
    }

    /**
     * Initializes the encoder's internal buffer.
     * This method must be called before any other methods.
     * @param {number} [initialCapacity=1024] The initial capacity of the encoder buffer.
     */
    init(initialCapacity = 1024) {
        this.instance.exports.sctp_encoder_init(initialCapacity);
    }

    /**
     * Adds an 8-bit signed integer to the buffer.
     * @param {number} value
     */
    addInt8(value) {
        this.instance.exports.sctp_encoder_add_int8(value);
    }
    /**
     * Adds an 8-bit unsigned integer to the buffer.
     * @param {number} value
     */
    addUint8(value) {
        this.instance.exports.sctp_encoder_add_uint8(value);
    }
    /**
     * Adds a 16-bit signed integer to the buffer.
     * @param {number} value
     */
    addInt16(value) {
        this.instance.exports.sctp_encoder_add_int16(value);
    }
    /**
     * Adds a 16-bit unsigned integer to the buffer.
     * @param {number} value
     */
    addUint16(value) {
        this.instance.exports.sctp_encoder_add_uint16(value);
    }
    /**
     * Adds a 32-bit signed integer to the buffer.
     * @param {number} value
     */
    addInt32(value) {
        this.instance.exports.sctp_encoder_add_int32(value);
    }
    /**
     * Adds a 32-bit unsigned integer to the buffer.
     * @param {number} value
     */
    addUint32(value) {
        this.instance.exports.sctp_encoder_add_uint32(value);
    }
    /**
     * Adds a 64-bit signed integer to the buffer.
     * @param {bigint} value
     */
    addInt64(value) {
        this.instance.exports.sctp_encoder_add_int64(value);
    }
    /**
     * Adds a 64-bit unsigned integer to the buffer.
     * @param {bigint} value
     */
    addUint64(value) {
        this.instance.exports.sctp_encoder_add_uint64(value);
    }
    /**
     * Adds a ULEB128-encoded unsigned integer to the buffer.
     * @param {bigint} value
     */
    addUleb128(value) {
        this.instance.exports.sctp_encoder_add_uleb128(value);
    }
    /**
     * Adds an SLEB128-encoded signed integer to the buffer.
     * @param {bigint} value
     */
    addSleb128(value) {
        this.instance.exports.sctp_encoder_add_sleb128(value);
    }
    /**
     * Adds a 32-bit float to the buffer.
     * @param {number} value
     */
    addFloat32(value) {
        this.instance.exports.sctp_encoder_add_float32(value);
    }
    /**
     * Adds a 64-bit float to the buffer.
     * @param {number} value
     */
    addFloat64(value) {
        this.instance.exports.sctp_encoder_add_float64(value);
    }
    /**
     * Adds a "short" value (0-15).
     * @param {number} value
     */
    addShort(value) {
        this.instance.exports.sctp_encoder_add_short(value);
    }

    /**
     * Adds a byte vector to the buffer.
     * @param {Uint8Array} data The byte array to add.
     */
    addVector(data) {
        const length = data.length;
        const ptr = this.instance.exports.sctp_encoder_add_vector(length);
        new Uint8Array(this.memory.buffer, ptr, length).set(data);
    }

    /**
     * Finalizes the encoded data, adds an EOF marker, and returns the resulting buffer.
     * This method should be called after all data has been added to the encoder.
     * @returns {Uint8Array} A copy of the encoded data.
     */
    build() {
        if (!this.instance) throw new Error('Encoder not initialized.');
        this.instance.exports.sctp_encoder_add_eof();
        return this.getBytes();
    }

    /**
     * Returns the encoded data without an EOF marker.
     * @returns {Uint8Array} A copy of the encoded data.
     */
    getBytes() {
        if (!this.instance) throw new Error('Encoder not initialized.');
        const dataPtr = this.instance.exports.sctp_encoder_data();
        const size = this.instance.exports.sctp_encoder_size();
        return new Uint8Array(this.memory.buffer, dataPtr, size).slice();
    }

}

/**
 * Creates a new SctpEncoderImpl instance.
 * This function compiles the WebAssembly module on its first run and reuses it for subsequent calls.
 * @returns {Promise<SctpEncoderImpl>} A promise that resolves to a new encoder instance.
 */
export async function SctpEncoder() {
    if (!wasmModule) {
        wasmModule = await WebAssembly.compile(encoderWasmModule);
    }
    const importObject = {
        env: {
            __lea_log: (ptr) => {
                const mem = new Uint8Array(memory.buffer);
                let end = ptr;
                while (mem[end] !== 0) {
                    end++;
                }
                const message = new TextDecoder('utf-8').decode(mem.subarray(ptr, end));
                console.error(`sctp.mvp.enc.wasm: ${message}`);
            },
        },
    };
    const instance = await WebAssembly.instantiate(wasmModule, importObject);
    const memory = instance.exports.memory;
    return new SctpEncoderImpl(instance, memory);
}
