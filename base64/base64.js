// TODO: Support unicode.
function asyncToBase64(value, onSuccess, onError) {
    try {
        var result = window.btoa(value);
        onSuccess(result);
    } catch (error) {
        onError('Failed to convert.');
    }
}

// TODO: Support unicode.
function asyncFromBase64(value, onSuccess, onError) {
    try {
        var result = window.atob(value);
        onSuccess(result);
    } catch (error) {
        onError('Failed to convert.');
    }
}