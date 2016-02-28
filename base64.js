'use strict';
// Async base64 encoding and decoding
//   Bundles TextEncoderLite and b64.js for utf8 and typed array support.
//   See: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding

function asyncToBase64(value, encoding, onSuccess, onError) {
    try {
        switch (encoding) {
            case 'ascii':
                var result = window.btoa(value);
                onSuccess(result);
                break;
            case 'utf8':
                value = Base64Utils.encodeToUtf8Array(value);
                // Fall through into byte array case.
            case undefined:
                var result = Base64Utils.uint8ToBase64(value);
                onSuccess(result);
                break;
            default:
                onError('Unknown encoding \'' + encoding + '\'.');
        }
    } catch (error) {
        if (error.name === 'InvalidCharacterError') {
            onError('Couldn\'t convert non-latin1 characters to base64.');
        } else if (error.message) {
            onError('Couldn\'t convert to base64 because ' + error.message + '.');
        } else {
            onError('Couldn\'t convert to base64 because ' + error + '.');
        }
    }
}

function asyncFromBase64(value, encoding, onSuccess, onError) {
    try {
        switch (encoding) {
            case 'ascii':
                var result = window.atob(Base64Utils.cleanupBase64(value));
                onSuccess(result);
                break;
            case 'utf8':
                var utf8ByteArray = Base64Utils.b64ToByteArray(Base64Utils.cleanupBase64(value));
                var result = Base64Utils.decodeFromUtf8Array(utf8ByteArray);
                onSuccess(result);
                break;
            default:
                onError('Unknown encoding \'' + encoding + '\'.');
        }
    } catch (error) {
        if (error.name == 'InvalidCharacterError') {
            onError('Couldn\'t convert because the base64 decodes to non-latin1 characters.');
        } else if (error.message) {
            onError('Couldn\'t convert from base64 because ' + error.message + '.');
        } else {
            onError('Couldn\'t convert from base64 because ' + error + '.');
        }
    }
}

// Utility helper functions:
//     cleanupBase64, uint8ToBase64, b64ToByteArray, encodeToUtf8Array, decodeFromUtf8Array
function Base64Utils() {
}

// Remove invalid characters and correct padding to accept more liberal input.
// This is modified from https://github.com/feross/buffer/blob/master/index.js by feross et. al.
Base64Utils.cleanupBase64 = function(dirty) {
    // Trim whitespace.
    dirty = dirty.trim ? dirty.trim() : dirty.replace(/^\s+|\s+$/g, '');

    // Remove anything outside our range.
    var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
    dirty = dirty.replace(INVALID_BASE64_RE, '');

    if (dirty.length < 2)
        return '';

    // Ensure padding is correct.
    while (dirty.length % 4 !== 0)
        dirty = dirty + '=';

    return dirty;
}

// b64.js from https://github.com/beatgammit/base64-js by beatgammit, feross, and others.
// Modified to only export uint8ToBase64 and b64ToByteArray.
//
// The MIT License (MIT)
// 
// Copyright (c) 2014
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
;(function (exports) {
    var i, code, lookup, revLookup, Arr;

    function initIfNeeded() {
        if (code !== undefined)
            return;

        code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        lookup = [];
        for (i = 0; i < code.length; i++)
            lookup[i] = code[i];
        revLookup = [];
        for (i = 0; i < code.length; ++i)
            revLookup[code.charCodeAt(i)] = i;
        revLookup['-'.charCodeAt(0)] = 62;
        revLookup['_'.charCodeAt(0)] = 63;
        Arr = (typeof Uint8Array !== 'undefined') ? Uint8Array : Array;
    }

    function decode(elt) {
        var v = revLookup[elt.charCodeAt(0)];
        return v !== undefined ? v : -1;
    }

    function b64ToByteArray(b64) {
        initIfNeeded();

        var i, j, l, tmp, placeHolders, arr;

        if (b64.length % 4 > 0)
            throw new Error('the length is not a multiple of 4');

        // the number of equal signs (place holders)
        // if there are two placeholders, than the two characters before it
        // represent one byte
        // if there is only one, then the three characters before it represent 2 bytes
        // this is just a cheap hack to not do indexOf twice
        var len = b64.length;
        placeHolders = b64.charAt(len - 2) === '=' ? 2 : b64.charAt(len - 1) === '=' ? 1 : 0;

        // base64 is 4/3 + up to two characters of the original data
        arr = new Arr(b64.length * 3 / 4 - placeHolders);

        // if there are placeholders, only get up to the last complete 4 chars
        l = placeHolders > 0 ? b64.length - 4 : b64.length;

        var L = 0;

        function push(v) {
            arr[L++] = v;
        }

        for (i = 0, j = 0; i < l; i += 4, j += 3) {
            tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3));
            push((tmp & 0xFF0000) >> 16);
            push((tmp & 0xFF00) >> 8);
            push(tmp & 0xFF);
        }

        if (placeHolders === 2) {
            tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4);
            push(tmp & 0xFF);
        } else if (placeHolders === 1) {
            tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2);
            push((tmp >> 8) & 0xFF);
            push(tmp & 0xFF);
        }
        return arr;
    }

    function encode(num) {
        return lookup[num];
    }

    function tripletToBase64(num) {
        return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F);
    }

    function encodeChunk(uint8, start, end) {
        var temp;
        var output = [];
        for (var i = start; i < end; i += 3) {
            temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
            output.push(tripletToBase64(temp));
        }
        return output.join('');
    }

    function uint8ToBase64(uint8) {
        initIfNeeded();

        var i;
        var extraBytes = uint8.length % 3; // if we have 1 byte left, pad 2 bytes
        var output = '';
        var parts = [];
        var temp, length;
        var maxChunkLength = 16383; // must be multiple of 3

        // go through the array every three bytes, we'll deal with trailing stuff later
        for (i = 0, length = uint8.length - extraBytes; i < length; i += maxChunkLength)
            parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > length ? length : (i + maxChunkLength)));

        // pad the end with zeros, but make sure to not forget the extra bytes
        switch (extraBytes) {
            case 1:
                temp = uint8[uint8.length - 1];
                output += encode(temp >> 2);
                output += encode((temp << 4) & 0x3F);
                output += '==';
                break;
            case 2:
                temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
                output += encode(temp >> 10);
                output += encode((temp >> 4) & 0x3F);
                output += encode((temp << 2) & 0x3F);
                output += '=';
                break;
            default:
                break;
        }

        parts.push(output);
        return parts.join('');
    }

    exports.uint8ToBase64 = uint8ToBase64;
    exports.b64ToByteArray = b64ToByteArray;
}(Base64Utils));

// TextEncoderLite from https://github.com/coolaj86/TextEncoderLite/blob/master/index.js by
// coolaj86, feross, and others.
// Modified to only export encodeToUtf8Array and decodeFromUtf8Array.
//
// The MIT License (MIT)
// 
// Copyright (c) Feross Aboukhadijeh, and other contributors.
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
;(function (exports) {
    function utf8ToBytes(string, units) {
        units = units || Infinity;
        var codePoint;
        var length = string.length;
        var leadSurrogate = null;
        var bytes = [];

        for (var i = 0; i < length; i++) {
            codePoint = string.charCodeAt(i);

            // is surrogate component
            if (codePoint > 0xD7FF && codePoint < 0xE000) {
                // last char was a lead
                if (leadSurrogate) {
                    // 2 leads in a row
                    if (codePoint < 0xDC00) {
                        if ((units -= 3) > -1)
                            bytes.push(0xEF, 0xBF, 0xBD);
                        leadSurrogate = codePoint;
                        continue;
                    } else {
                        // valid surrogate pair
                        codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000;
                        leadSurrogate = null;
                    }
                } else {
                    // no lead yet
                    if (codePoint > 0xDBFF) {
                        // unexpected trail
                        if ((units -= 3) > -1)
                            bytes.push(0xEF, 0xBF, 0xBD);
                        continue;
                    } else if (i + 1 === length) {
                        // unpaired lead
                        if ((units -= 3) > -1)
                            bytes.push(0xEF, 0xBF, 0xBD);
                        continue;
                    } else {
                        // valid lead
                        leadSurrogate = codePoint;
                        continue;
                    }
                }
            } else if (leadSurrogate) {
                // valid bmp char, but last char was a lead
                if ((units -= 3) > -1)
                    bytes.push(0xEF, 0xBF, 0xBD);
                leadSurrogate = null;
            }

            // encode utf8
            if (codePoint < 0x80) {
                if ((units -= 1) < 0)
                    break;
                bytes.push(codePoint);
            } else if (codePoint < 0x800) {
                if ((units -= 2) < 0)
                    break;
                bytes.push(
                    codePoint >> 0x6 | 0xC0,
                    codePoint & 0x3F | 0x80
                    );
            } else if (codePoint < 0x10000) {
                if ((units -= 3) < 0)
                    break;
                bytes.push(
                    codePoint >> 0xC | 0xE0,
                    codePoint >> 0x6 & 0x3F | 0x80,
                    codePoint & 0x3F | 0x80
                    );
            } else if (codePoint < 0x200000) {
                if ((units -= 4) < 0)
                    break;
                bytes.push(
                    codePoint >> 0x12 | 0xF0,
                    codePoint >> 0xC & 0x3F | 0x80,
                    codePoint >> 0x6 & 0x3F | 0x80,
                    codePoint & 0x3F | 0x80
                    );
            } else {
                throw new Error('Invalid code point');
            }
        }
        return bytes;
    }

    function utf8Slice(buf, start, end) {
        var res = '';
        var tmp = '';
        end = Math.min(buf.length, end || Infinity);
        start = start || 0;
        for (var i = start; i < end; i++) {
            if (buf[i] <= 0x7F) {
                res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i]);
                tmp = '';
            } else {
                tmp += '%' + buf[i].toString(16);
            }
        }
        return res + decodeUtf8Char(tmp);
    }

    function decodeUtf8Char(str) {
        try {
            return decodeURIComponent(str);
        } catch (err) {
            return String.fromCharCode(0xFFFD); // UTF 8 invalid char
        }
    }

    exports.encodeToUtf8Array = function(str) {
        var result;
        if ('undefined' === typeof Uint8Array)
            result = utf8ToBytes(str);
        else
            result = new Uint8Array(utf8ToBytes(str));
        return result;
    }

    exports.decodeFromUtf8Array = function(bytes) {
        return utf8Slice(bytes, 0, bytes.length);
    }
}(Base64Utils));
