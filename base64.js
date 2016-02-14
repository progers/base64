// Base64 encoding and decoding.
//
// Requires:
//   include/buffer/buffer.js
//
// Buffer's base64 decoder does a best-effort without throwing. This
// async abstraction is intended for future features.

function asyncToBase64(value, encoding, onSuccess, onError) {
    try {
        var result = new buffer.Buffer(value, encoding).toString('base64');
        onSuccess(result);
    } catch (error) {
        onError('Failed to convert (' + error + ').');
    }
}

function asyncFromBase64(value, encoding, onSuccess, onError) {
    try {
        var result = new buffer.Buffer(value, 'base64').toString(encoding);
        onSuccess(result);
    } catch (error) {
        onError('Failed to convert (' + error + ').');
    }
}