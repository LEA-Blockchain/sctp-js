<!--
giturl: https://github.com/LEA-Blockchain/sctp-js.git
name: sctp
version: 1.3.0
description: A JavaScript library for encoding and decoding data using the Simple Compact Transaction Protocol (SCTP).
-->

# @leachain/sctp

[![npm version](https://img.shields.io/npm/v/@leachain/sctp)](https://www.npmjs.com/package/@leachain/sctp)
[![License](https://img.shields.io/github/license/LEA-Blockchain/sctp-js)](https://github.com/LEA-Blockchain/sctp-js/blob/main/LICENSE)

A JavaScript library for encoding and decoding data using the Simple Compact Transaction Protocol (SCTP), powered by WebAssembly for native speed.

## Features

-   **High-Performance**: Utilizes WebAssembly for fast and efficient binary serialization.
-   **Rich Data Types**: Supports a wide range of types, including integers, floats, vectors, and LEB128-encoded numbers.
-   **Cross-Platform**: Works seamlessly in both Node.js and modern browser environments.
-   **Simple API**: Provides an intuitive and easy-to-use interface for both encoding and decoding.

## Installation

```sh
npm install @leachain/sctp
```

## Usage

The `Encoder` and `Decoder` classes must be instantiated and then initialized asynchronously before use.

### ES Modules (ESM)

```javascript
import { Encoder, Decoder } from '@leachain/sctp';
import assert from 'assert';

async function main() {
  // --- Encoder ---
  const encoder = new Encoder();
  await encoder.init();

  encoder.addUint32(123456);
  encoder.addShort(10);
  encoder.addVector(new Uint8Array([1, 2, 3, 4, 5]));

  const encodedData = encoder.build();

  // --- Decoder ---
  const decoder = new Decoder();
  await decoder.init();

  const decodedFields = decoder.decode(encodedData);

  console.log(decodedFields);
  // Expected output:
  // [
  //   { type: 'UINT32', value: 123456 },
  //   { type: 'SHORT', value: 10 },
  //   { type: 'VECTOR', value: Uint8Array(5) [ 1, 2, 3, 4, 5 ] },
  //   { type: 'EOF' }
  // ]
}

main();
```

### CommonJS (CJS)

```javascript
const { Encoder, Decoder } = require('@leachain/sctp');
const assert = require('assert');

async function main() {
  // --- Encoder ---
  const encoder = new Encoder();
  await encoder.init();

  encoder.addUint32(123456);
  encoder.addShort(10);
  encoder.addVector(new Uint8Array([1, 2, 3, 4, 5]));

  const encodedData = encoder.build();

  // --- Decoder ---
  const decoder = new Decoder();
  await decoder.init();

  const decodedFields = decoder.decode(encodedData);

  console.log(decodedFields);
}

main();
```

## API Reference

### `Encoder`

A class for encoding a sequence of data fields into a compact byte stream.

#### `new Encoder()`

Creates a new `Encoder` instance.

#### `async init(initialCapacity?)`

-   `initialCapacity` `<number>` (Optional) The initial capacity of the encoder buffer in bytes. Defaults to `1024`.

Initializes the underlying WebAssembly module. This method must be called before any other methods.

#### `add<Type>(value)`

The `Encoder` provides methods for adding various data types.

| Method          | Parameter Type | Description                               |
| --------------- | -------------- | ----------------------------------------- |
| `addInt8`       | `number`       | Appends an 8-bit signed integer.          |
| `addUint8`      | `number`       | Appends an 8-bit unsigned integer.        |
| `addInt16`      | `number`       | Appends a 16-bit signed integer.          |
| `addUint16`     | `number`       | Appends a 16-bit unsigned integer.        |
| `addInt32`      | `number`       | Appends a 32-bit signed integer.          |
| `addUint32`     | `number`       | Appends a 32-bit unsigned integer.        |
| `addInt64`      | `bigint`       | Appends a 64-bit signed integer.          |
| `addUint64`     | `bigint`       | Appends a 64-bit unsigned integer.        |
| `addFloat32`    | `number`       | Appends a 32-bit float.                   |
| `addFloat64`    | `number`       | Appends a 64-bit float (double).          |
| `addShort`      | `number`       | Appends a small integer (0-15).           |
| `addVector`     | `Uint8Array`   | Appends a variable-length byte array.     |
| `addUleb128`    | `bigint`       | Appends a ULEB128-encoded integer.        |
| `addSleb128`    | `bigint`       | Appends an SLEB128-encoded integer.       |

#### `build()`

-   **Returns** `<Uint8Array>`

Finalizes the encoding process, adds an `EOF` marker, and returns a `Uint8Array` containing the complete byte stream.

#### `getBytes()`

-   **Returns** `<Uint8Array>`

Returns the encoded data without an `EOF` marker.

### `Decoder`

A class for decoding a byte stream back into its original sequence of data fields.

#### `new Decoder()`

Creates a new `Decoder` instance.

#### `async init()`

Initializes the underlying WebAssembly module. This method must be called before `decode()`.

#### `decode(encodedData)`

-   `encodedData` `<Uint8Array>` The byte stream to decode.
-   **Returns** `Array<{type: string, value: any}>`

Decodes the provided `Uint8Array` and returns an array of field objects. Each object contains a `type` (string) and its corresponding `value`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any bugs, features, or improvements.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.