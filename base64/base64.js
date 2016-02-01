// UTF-8 base64 encoding and decoding.
//
// Requires:
//   include/buffer/buffer.js
//
// Buffer's base64 decoder does a best-effort without throwing. This
// async abstraction is intended for future features.

function asyncToBase64(value, onSuccess, onError) {
    try {
        var result = new buffer.Buffer(value, 'utf8').toString('base64');
        onSuccess(result);
    } catch (error) {
        onError('Failed to convert (' + error + ').');
    }
}

function asyncFromBase64(value, onSuccess, onError) {
    try {
        var result = new buffer.Buffer(value, 'base64').toString('utf8');
        onSuccess(result);
    } catch (error) {
        onError('Failed to convert (' + error + ').');
    }
}