
var allEncodings = ['utf8', 'ascii'];

function asyncToBase64InAllEncodings(value, onSuccess, onFailure) {
    for (var encoding in allEncodings)
        asyncToBase64(value, allEncodings[encoding], onSuccess, onFailure);
}

function asyncFromBase64InAllEncodings(value, onSuccess, onFailure) {
    for (var encoding in allEncodings)
        asyncFromBase64(value, allEncodings[encoding], onSuccess, onFailure);
}

var nonLatin1CharacterError = 'Couldn\'t convert non-latin1 characters to base64.';

QUnit.test('Unicode encoding', function( assert ) {
    assert.expect(8);
    var done = assert.async(8);

    // Example from https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
    asyncToBase64(
        '✓ à la mode',
        'utf8',
        function success(result) {
            assert.equal(result, '4pyTIMOgIGxhIG1vZGU=', 'Various unicode characters (MDN)');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncToBase64(
        '✓ à la mode',
        'ascii',
        function success(result) { assert.ok(false, result); },
        function failure(error) {
            assert.equal(error, nonLatin1CharacterError, 'Non-ascii string cannot be converted using ascii encoding.');
            done();
        }
    );

    // Example from https://github.com/feross/buffer/blob/master/test/to-string.js
    asyncToBase64(
        'Ձאab',
        'utf8',
        function success(result) {
            assert.equal(result, '1YHXkGFi', 'Various unicode characters (Feross)');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncToBase64(
        'Ձאab',
        'ascii',
        function success(result) { assert.ok(false, result); },
        function failure(error) {
            assert.equal(error, nonLatin1CharacterError, 'Non-ascii string cannot be converted using ascii encoding.');
            done();
        }
    );

    asyncToBase64(
        '你好我是菲利普',
        'utf8',
        function success(result) {
            assert.equal(result, '5L2g5aW95oiR5piv6I+y5Yip5pmu', 'A Chinese sentence');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncToBase64(
        '你好我是菲利普',
        'ascii',
        function success(result) { assert.ok(false, result); },
        function failure(error) {
            assert.equal(error, nonLatin1CharacterError, 'Non-ascii string cannot be converted using ascii encoding.');
            done();
        }
    );

    asyncToBase64(
        '✈🍯✈🌂✈🔥✈🐔✈',
        'utf8',
        function success(result) {
            assert.equal(result, '4pyI8J+Nr+KciPCfjILinIjwn5Sl4pyI8J+QlOKciA==', 'Various unicode emoji');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncToBase64(
        '✈🍯✈🌂✈🔥✈🐔✈',
        'ascii',
        function success(result) { assert.ok(false, result); },
        function failure(error) {
            assert.equal(error, nonLatin1CharacterError, 'Non-ascii string cannot be converted using ascii encoding.');
            done();
        }
    );
});

// These tests are from mathiasbynens in:
// https://github.com/mathiasbynens/base64/blob/master/tests/tests.js
QUnit.test('Simple base64 encoding', function( assert ) {
    assert.expect(12);
    var done = assert.async(12);

    asyncToBase64InAllEncodings(
        '\0\x01\x02\x03\x04\x05\x06\x07\b\t\n\x0B\f\r\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\x7F',
        function success(result) {
            assert.equal(result, 'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn8=', 'All possible octets');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncToBase64InAllEncodings(
        'a',
        function success(result) {
            assert.equal(result, 'YQ==', 'Two padding characters');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncToBase64InAllEncodings(
        'aa',
        function success(result) {
            assert.equal(result, 'YWE=', 'One padding character');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncToBase64InAllEncodings(
        'aaa',
        function success(result) {
            assert.equal(result, 'YWFh', 'No padding characters');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncToBase64InAllEncodings(
        'foo\0',
        function success(result) {
            assert.equal(result, 'Zm9vAA==', 'U+0000');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncToBase64InAllEncodings(
        'foo\0\0',
        function success(result) {
            assert.equal(result, 'Zm9vAAA=', 'U+0000');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );
});

QUnit.test('Control character encoding', function( assert ) {
    assert.expect(10);
    var done = assert.async(10);

    asyncToBase64InAllEncodings(
        '\t\t\t\t\t',
        function success(result) {
            assert.equal(result, 'CQkJCQk=', 'Five tabs');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    // Ensure newlines are not converted to crlf (which would return YQ0KDQoNCg0KDQph).
    asyncToBase64InAllEncodings(
        'a\n\n\n\n\na',
        function success(result) {
            assert.equal(result, 'YQoKCgoKYQ==', 'Five newlines surrounded by a\'s');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    // Ensure a single newline is not converted to crlf (which would return YQ0KYQ==).
    asyncToBase64InAllEncodings(
        'a\na',
        function success(result) {
            assert.equal(result, 'YQph', 'One newline surrounded by a\'s');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    // Ensure a newline by itself can be encoded.
    // In addition to crlf conversions, some online encoders have trouble with a single newline.
    asyncToBase64InAllEncodings(
        '\n',
        function success(result) {
            assert.equal(result, 'Cg==', 'One lonely newline');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncToBase64InAllEncodings(
        '\r',
        function success(result) {
            assert.equal(result, 'DQ==', 'One lonely linefeed');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );
});

QUnit.test('Unicode encoding and decoding round trip', function( assert ) {
    assert.expect(9);
    var done = assert.async(9);

    asyncToBase64(
        '你好我是菲利普',
        'utf8',
        function success(result) {
            assert.equal(result, '5L2g5aW95oiR5piv6I+y5Yip5pmu', 'Chinese to utf8');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncToBase64(
        '你好我是菲利普',
        'ascii',
        function success(result) { assert.ok(false, result); },
        function failure(error) {
            assert.equal(error, nonLatin1CharacterError, 'Non-ascii string cannot be converted using ascii encoding.');
            done();
        }
    );

    asyncToBase64(
        '好',
        'utf8',
        function success(result) {
            assert.equal(result, '5aW9', 'Hao from utf8');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncToBase64(
        '好',
        'ascii',
        function success(result) { assert.ok(false, result); },
        function failure(error) {
            assert.equal(error, nonLatin1CharacterError, 'Non-ascii string cannot be converted using ascii encoding.');
            done();
        }
    );

    asyncFromBase64(
        '5L2g5aW95oiR5piv6I+y5Yip5pmu',
        'utf8',
        function success(result) {
            assert.equal(result, '你好我是菲利普', 'Chinese from utf8');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        '5L2g5aW95oiR5piv6I+y5Yip5pmu',
        'ascii',
        function success(result) {
            assert.equal(result, 'ä½ å¥½ææ¯è²å©æ®', 'Chinese from ascii');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        '5aW9',
        'utf8',
        function success(result) {
            assert.equal(result, '好', 'Hao from utf8');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        '5aW9',
        'ascii',
        function success(result) {
            assert.equal(result, 'å¥½', 'Hao from ascii');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        'fQ==',
        'ascii',
        function success(result) {
            assert.equal(result, '}', 'Hao from ascii doesn\'t explode');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );
});

QUnit.test('Unicode decoding', function( assert ) {
    assert.expect(8);
    var done = assert.async(8);

    // Example from https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
    asyncFromBase64(
        '4pyTIMOgIGxhIG1vZGU=',
        'utf8',
        function success(result) {
            assert.equal(result, '✓ à la mode', 'Various unicode characters (MDN) to utf8');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        '4pyTIMOgIGxhIG1vZGU=',
        'ascii',
        function success(result) {
            assert.equal(result, 'â Ã  la mode', 'Various unicode characters (MDN) to ascii');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    // Example from https://github.com/feross/buffer/blob/master/test/to-string.js
    asyncFromBase64(
        '1YHXkGFi',
        'utf8',
        function success(result) {
            assert.equal(result, 'Ձאab', 'Various unicode characters (Feross) to utf8');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        '1YHXkGFi',
        'ascii',
        function success(result) {
            assert.equal(result, 'Õ×ab', 'Various unicode characters (MDN) to ascii');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        '5L2g5aW95oiR5piv6I+y5Yip5pmu',
        'utf8',
        function success(result) {
            assert.equal(result, '你好我是菲利普', 'A Chinese sentence to utf8');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        '5L2g5aW95oiR5piv6I+y5Yip5pmu',
        'ascii',
        function success(result) {
            assert.equal(result, 'ä½ å¥½ææ¯è²å©æ®', 'A Chinese sentence to ascii');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        '4pyI8J+Nr+KciPCfjILinIjwn5Sl4pyI8J+QlOKciA==',
        'utf8',
        function success(result) {
            assert.equal(result, '✈🍯✈🌂✈🔥✈🐔✈', 'Various unicode emoji to utf8');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        '4pyI8J+Nr+KciPCfjILinIjwn5Sl4pyI8J+QlOKciA==',
        'ascii',
        function success(result) {
            assert.equal(result, 'âð¯âðâð¥âðâ', 'Various unicode emoji to ascii');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );
});

// These tests are from mathiasbynens in:
// https://github.com/mathiasbynens/base64/blob/master/tests/tests.js
QUnit.test('Simple base64 decoding', function( assert ) {
    assert.expect(26);
    var done = assert.async(26);

    asyncFromBase64InAllEncodings(
        'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn8=',
        function success(result) {
            assert.equal(result, '\0\x01\x02\x03\x04\x05\x06\x07\b\t\n\x0B\f\r\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\x7F', 'All possible octets');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64InAllEncodings(
        'AAECA\t\n\f\r wQFBgcICQoLDA0ODx\t\n\f\r AREhMUFRYXGBkaGxwdHh8gIS\t\n\f\r IjJCUmJygpKissLS4vMDEyMzQ1Njc4OT\t\n\f\r o7PD0+P0BBQkNERUZHSElKS0xNT\t\n\f\r k9QUVJTVFVWV1hZWltcXV5fY\t\n\f\r GFiY2RlZmdoaWprbG\t\n\f\r 1ub3BxcnN0dXZ3eH\t\n\f\r l6e3x9fn8=',
        function success(result) {
            assert.equal(result, '\0\x01\x02\x03\x04\x05\x06\x07\b\t\n\x0B\f\r\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\x7F', 'HTML space characters must be stripped before decoding');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64InAllEncodings(
        'YQ===',
        function success(result) {
            assert.equal(result, 'a', 'Invalid ascii (without cleanup) but valid utf-8');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64InAllEncodings(
        'YQ==',
        function success(result) {
            assert.equal(result, 'a', 'Invalid ascii (without cleanup) but valid utf-8');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64InAllEncodings(
        'YWE=',
        function success(result) {
            assert.equal(result, 'aa', 'One padding character');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64InAllEncodings(
        'YWFh',
        function success(result) {
            assert.equal(result, 'aaa', 'No padding characters');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64InAllEncodings(
        'YQ',
        function success(result) {
            assert.equal(result, 'a', 'Discarded bits');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64InAllEncodings(
        'YR',
        function success(result) {
            assert.equal(result, 'a', 'Discarded bits');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64InAllEncodings(
        'Zm9vIGJhciBiYXo=',
        function success(result) {
            assert.equal(result, 'foo bar baz', 'One-character padding \'=\'');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64InAllEncodings(
        'Zm9vIGJhcg==',
        function success(result) {
            assert.equal(result, 'foo bar', 'Two-character padding \'==\'');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64InAllEncodings(
        'Zm9v',
        function success(result) {
            assert.equal(result, 'foo', 'No padding');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64InAllEncodings(
        'Zm9vAA==',
        function success(result) {
            assert.equal(result, 'foo\0', 'U+0000');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64InAllEncodings(
        'Zm9vAAA=',
        function success(result) {
            assert.equal(result, 'foo\0\0', 'U+0000');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );
});

QUnit.test('Control character decoding', function( assert ) {
    assert.expect(10);
    var done = assert.async(10);

    asyncFromBase64InAllEncodings(
        'CQkJCQk=',
        function success(result) {
            assert.equal(result, '\t\t\t\t\t', 'Five tabs');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    // Ensure there is no conversion that changes line endings.
    asyncFromBase64InAllEncodings(
        'YQoKCgoKYQ==',
        function success(result) {
            assert.equal(result, 'a\n\n\n\n\na', 'Five newlines surrounded by a\'s');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    // Ensure crlf is not stripped.
    asyncFromBase64InAllEncodings(
        'YQ0KDQoNCg0KDQph',
        function success(result) {
            assert.equal(result, 'a\r\n\r\n\r\n\r\n\r\na', 'Five crlf\'s surrounded by a\'s');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64InAllEncodings(
        'Cg==',
        function success(result) {
            assert.equal(result, '\n', 'One lonely newline');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64InAllEncodings(
        'DQ==',
        function success(result) {
            assert.equal(result, '\r', 'One lonely linefeed');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );
});

QUnit.test('Byte array conversion without encoding', function( assert ) {
    assert.expect(1);
    var done = assert.async(1);

    asyncToBase64(
        new Uint32Array([0, 1, 2, 3]),
        undefined,
        function success(result) {
            assert.equal(result, 'AAECAw==', 'Basic byte array');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );
});
