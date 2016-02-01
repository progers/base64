
QUnit.test('unicode encoding', function( assert ) {
    assert.expect(4);
    var done = assert.async(4);

    // Example from https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
    asyncToBase64(
        '✓ à la mode',
        function success(result) {
            assert.equal(result, '4pyTIMOgIGxhIG1vZGU=', 'Various unicode characters (MDN)');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    // Example from https://github.com/feross/buffer/blob/master/test/to-string.js
    asyncToBase64(
        'Ձאab',
        function success(result) {
            assert.equal(result, '1YHXkGFi', 'Various unicode characters (Feross)');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncToBase64(
        '你好我是菲利普',
        function success(result) {
            assert.equal(result, '5L2g5aW95oiR5piv6I+y5Yip5pmu', 'A Chinese sentence');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncToBase64(
        '✈🍯✈🌂✈🔥✈🐔✈',
        function success(result) {
            assert.equal(result, '4pyI8J+Nr+KciPCfjILinIjwn5Sl4pyI8J+QlOKciA==', 'Various unicode emoji');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );
});

// These tests are from mathiasbynens in:
// https://github.com/mathiasbynens/base64/blob/master/tests/tests.js
QUnit.test('Simple base64 encoding', function( assert ) {
    assert.expect(6);
    var done = assert.async(6);

    asyncToBase64(
        '\0\x01\x02\x03\x04\x05\x06\x07\b\t\n\x0B\f\r\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\x7F',
        function success(result) {
            assert.equal(result, 'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn8=', 'All possible octets');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncToBase64(
        'a',
        function success(result) {
            assert.equal(result, 'YQ==', 'Two padding characters');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncToBase64(
        'aa',
        function success(result) {
            assert.equal(result, 'YWE=', 'One padding character');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncToBase64(
        'aaa',
        function success(result) {
            assert.equal(result, 'YWFh', 'No padding characters');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncToBase64(
        'foo\0',
        function success(result) {
            assert.equal(result, 'Zm9vAA==', 'U+0000');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncToBase64(
        'foo\0\0',
        function success(result) {
            assert.equal(result, 'Zm9vAAA=', 'U+0000');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );
});

QUnit.test('control character encoding', function( assert ) {
    assert.expect(2);
    var done = assert.async(2);

    asyncToBase64(
        '\t\t\t\t\t',
        function success(result) {
            assert.equal(result, 'CQkJCQk=', 'Five tabs');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    // FIXME: This may not be correct, other encoders return YQ0KDQoNCg0KDQph.
    asyncToBase64(
        'a\n\n\n\n\na',
        function success(result) {
            assert.equal(result, 'YQoKCgoKYQ==', 'Five newlines surrounded by a\'s');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );
});

QUnit.test('unicode decoding', function( assert ) {
    assert.expect(4);
    var done = assert.async(4);

    // Example from https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
    asyncFromBase64(
        '4pyTIMOgIGxhIG1vZGU=',
        function success(result) {
            assert.equal(result, '✓ à la mode', 'Various unicode characters (MDN)');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    // Example from https://github.com/feross/buffer/blob/master/test/to-string.js
    asyncFromBase64(
        '1YHXkGFi',
        function success(result) {
            assert.equal(result, 'Ձאab', 'Various unicode characters (Feross)');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        '5L2g5aW95oiR5piv6I+y5Yip5pmu',
        function success(result) {
            assert.equal(result, '你好我是菲利普', 'A Chinese sentence');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        '4pyI8J+Nr+KciPCfjILinIjwn5Sl4pyI8J+QlOKciA==',
        function success(result) {
            assert.equal(result, '✈🍯✈🌂✈🔥✈🐔✈', 'Various unicode emoji');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );
});

// These tests are from mathiasbynens in:
// https://github.com/mathiasbynens/base64/blob/master/tests/tests.js
QUnit.test('Simple base64 decoding', function( assert ) {
    assert.expect(13);
    var done = assert.async(13);

    asyncFromBase64(
        'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn8=',
        function success(result) {
            assert.equal(result, '\0\x01\x02\x03\x04\x05\x06\x07\b\t\n\x0B\f\r\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\x7F', 'All possible octets');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        'AAECA\t\n\f\r wQFBgcICQoLDA0ODx\t\n\f\r AREhMUFRYXGBkaGxwdHh8gIS\t\n\f\r IjJCUmJygpKissLS4vMDEyMzQ1Njc4OT\t\n\f\r o7PD0+P0BBQkNERUZHSElKS0xNT\t\n\f\r k9QUVJTVFVWV1hZWltcXV5fY\t\n\f\r GFiY2RlZmdoaWprbG\t\n\f\r 1ub3BxcnN0dXZ3eH\t\n\f\r l6e3x9fn8=',
        function success(result) {
            assert.equal(result, '\0\x01\x02\x03\x04\x05\x06\x07\b\t\n\x0B\f\r\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\x7F', 'HTML space characters must be stripped before decoding');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        'YQ===',
        function success(result) {
            assert.equal(result, 'a', 'Invalid ascii but valid utf-8');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        'YQ==',
        function success(result) {
            assert.equal(result, 'a', 'Invalid ascii but valid utf-8');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        'YWE=',
        function success(result) {
            assert.equal(result, 'aa', 'One padding character');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        'YWFh',
        function success(result) {
            assert.equal(result, 'aaa', 'No padding characters');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        'YQ',
        function success(result) {
            assert.equal(result, 'a', 'Discarded bits');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        'YR',
        function success(result) {
            assert.equal(result, 'a', 'Discarded bits');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        'Zm9vIGJhciBiYXo=',
        function success(result) {
            assert.equal(result, 'foo bar baz', 'One-character padding \'=\'');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        'Zm9vIGJhcg==',
        function success(result) {
            assert.equal(result, 'foo bar', 'Two-character padding \'==\'');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        'Zm9v',
        function success(result) {
            assert.equal(result, 'foo', 'No padding');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        'Zm9vAA==',
        function success(result) {
            assert.equal(result, 'foo\0', 'U+0000');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        'Zm9vAAA=',
        function success(result) {
            assert.equal(result, 'foo\0\0', 'U+0000');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );
});

QUnit.test('control character decoding', function( assert ) {
    assert.expect(2);
    var done = assert.async(2);

    asyncFromBase64(
        'CQkJCQk=',
        function success(result) {
            assert.equal(result, '\t\t\t\t\t', 'Five tabs');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );

    asyncFromBase64(
        'YQoKCgoKYQ==',
        function success(result) {
            assert.equal(result, 'a\n\n\n\n\na', 'Five newlines surrounded by a\'s');
            done();
        },
        function failure(error) { assert.ok(false, error); }
    );
});
