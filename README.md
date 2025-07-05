# @leachain/sctp

> Wrapper for the SCTP WASM library providing encoding and decoding capabilities.

This library provides a simple interface to the LEA SCTP (Simple Composite Type Encoding) WASM modules for efficient binary encoding and decoding of data.

## Installation

```bash
npm install @leachain/sctp
```

## Usage

The library can be used in both Node.js and browser environments. The `SctpEncoder` and `SctpDecoder` must be initialized asynchronously.

### Node.js (ESM)

```javascript
import { SctpEncoder, SctpDecoder } from '@leachain/sctp';

async function main() {
  const encoder = await SctpEncoder();
  encoder.init(2048); // Optionally provide an initial buffer size in bytes

  // Add fields to the encoder
  encoder.addInt32(-123);
  encoder.addFloat64(123.456);
  encoder.addVector(new Uint8Array([1, 2, 3]));

  const encoded = encoder.build();

  const decoder = await SctpDecoder();
  const decoded = decoder.decode(encoded);

  console.log(decoded);
  // Expected output:
  // [
  //   { type: 'INT32', value: -123 },
  //   { type: 'FLOAT64', value: 123.456 },
  //   { type: 'VECTOR', value: Uint8Array [ 1, 2, 3 ] },
  //   { type: 'EOF' }
  // ]
}

main();
```

### Node.js (CJS)

```javascript
const { SctpEncoder, SctpDecoder } = require('@leachain/sctp');

async function main() {
  const encoder = await SctpEncoder();
  encoder.init(2048); // Optionally provide an initial buffer size in bytes

  // Add fields to the encoder
  encoder.addInt32(-123);
  encoder.addFloat64(123.456);
  encoder.addVector(new Uint8Array([1, 2, 3]));

  const encoded = encoder.build();

  const decoder = await SctpDecoder();
  const decoded = decoder.decode(encoded);

  console.log(decoded);
  // Expected output:
  // [
  //   { type: 'INT32', value: -123 },
  //   { type: 'FLOAT64', value: 123.456 },
  //   { type: 'VECTOR', value: Uint8Array [ 1, 2, 3 ] },
  //   { type: 'EOF' }
  // ]
}

main();
```

### Browser

```html
<script src="https://unpkg.com/@leachain/sctp/dist/sctp.web.min.js"></script>
<script>
  async function main() {
    const { SctpEncoder, SctpDecoder } = LEA_SCTP;

    const encoder = await SctpEncoder();
    encoder.init(2048); // Optionally provide an initial buffer size in bytes

    // Add fields to the encoder
    encoder.addInt32(-123);
    encoder.addFloat64(123.456);
    encoder.addVector(new Uint8Array([1, 2, 3]));

    const encoded = encoder.build();

    const decoder = await SctpDecoder();
    const decoded = decoder.decode(encoded);

    console.log(decoded);
    // Expected output:
    // [
    //   { type: 'INT32', value: -123 },
    //   { type: 'FLOAT64', value: 123.456 },
    //   { type: 'VECTOR', value: Uint8Array [ 1, 2, 3 ] },
    //   { type: 'EOF' }
    // ]
  }

  main();
</script>
```

## API

For detailed API documentation, please refer to the [JSDoc generated documentation](https://lea-blockchain.github.io/sctp-js).

## License

[MIT](LICENSE)
