'use strict';
// Business logic for base64 encoder (index.html).
// Requires asyncToBase64 and asyncFromBase64 from base64.js

// Initialization of these conversion type constants and locals is done in DOMContentLoaded.
var LeftConversionTypes, RightConversionTypes;

// These state variables are for the selected conversion types, initialized in DOMContentLoaded.
var leftConversionType, rightConversionType;

// This state variable lets us change the conversion type without overwriting the user's last input.
var userLastChangedRightSide = false;

// FIXME: Check if this can be cleared more often to reduce peak memory usage.
var currentFile;

window.addEventListener('DOMContentLoaded', function() {
    // Must keep in sync with #leftTypeSelect's DOM.
    LeftConversionTypes = {
        'text': {displayName: 'Text', isImage: false},
        'image': {displayName: 'Image', isImage: true}
    }

    // Must keep in sync with the #rightTypeSelect's DOM.
    RightConversionTypes = {
        'base64utf8': {displayName: 'Base64', encoding: 'utf8', forImage: false},
        'base64ascii': {displayName: 'Base64 (ascii)', encoding: 'ascii', forImage: false},
        'base64image': {displayName: 'Base64 (image)', encoding: 'utf8', forImage: true}
    }

    leftConversionType = LeftConversionTypes[Object.keys(LeftConversionTypes)[0]];
    rightConversionType = RightConversionTypes[Object.keys(RightConversionTypes)[0]];

    leftTextarea.addEventListener('input', function() {
        userLastChangedRightSide = false;
        updateConversion();
    });

    leftImageInput.addEventListener('change', function(event) {
        if (event.target.files[0]) {
            currentFile = event.target.files[0];
            userLastChangedRightSide = false;
            updateConversion();
        }
    });

    rightTextarea.addEventListener('input', function() {
        userLastChangedRightSide = true;
        updateConversion();
    });

    leftTypeSelect.addEventListener('change', function() {
        onLeftTypeChanged();
    });

    rightTypeSelect.addEventListener('change', function() {
        onRightTypeChanged();
    });

    // Ensure there is a focus effect on the custom type select boxes.
    leftTypeSelect.addEventListener('focus', function(event) {
        leftTypeSelect.parentElement.setAttribute('id', 'focused');
    });
    leftTypeSelect.addEventListener('blur', function(event) {
        leftTypeSelect.parentElement.removeAttribute('id');
    });
    rightTypeSelect.addEventListener('focus', function(event) {
        rightTypeSelect.parentElement.setAttribute('id', 'focused');
    });
    rightTypeSelect.addEventListener('blur', function(event) {
        rightTypeSelect.parentElement.removeAttribute('id');
    });

    // Drag and drop support.
    var insideCount = 0;
    leftContent.addEventListener('dragenter', function(event) {
        insideCount++;
        leftTextarea.classList.add('dragover');
        leftImageArea.classList.add('dragover');
    });
    leftContent.addEventListener('dragleave', function(event) {
        if (--insideCount === 0) {
            leftTextarea.classList.remove('dragover');
            leftImageArea.classList.remove('dragover');
        }
    });
    document.body.addEventListener('dragover', function(event) {
        // Required for the drop event to work properly.
        event.preventDefault();
    });
    document.body.addEventListener('drop', function(event) {
        event.preventDefault();
        event.stopPropagation();
        insideCount = 0;
        leftTextarea.classList.remove('dragover');
        leftImageArea.classList.remove('dragover');
        if (event.dataTransfer.files.length > 0)
            onDropFiles(event.dataTransfer.files);
    });

    // Update state if a select value is already present (e.g., if the user navigated back.)
    var leftConversionTypeFromDOM = LeftConversionTypes[leftTypeSelect.value];
    if (leftConversionTypeFromDOM !== leftConversionType)
        onLeftTypeChanged();
    var rightConversionTypeFromDOM = RightConversionTypes[rightTypeSelect.value];
    if (rightConversionTypeFromDOM !== rightConversionType)
        onRightTypeChanged();

    // Bootup our service worker for offline support.
    if ('serviceWorker' in navigator)
        navigator.serviceWorker.register('simple-offline-service-worker.js');
});

function updateConversion() {
    // Cleanup any leftover errors.
    leftImageArea.classList.remove('errorSource');
    leftTextarea.classList.remove('errorSource');
    rightTextarea.classList.remove('errorSource');
    leftTextarea.classList.remove('errorDestination');
    rightTextarea.classList.remove('errorDestination');

    if (leftConversionType.isImage)
        convertImage();
    else
        bidirectionalTextConversion(!userLastChangedRightSide);
}

// TODO: Gracefully disable this if the FileReader/etc APIs are not available.
function convertImage() {
    var setBackgroundImage = function(optionalDataUri) {
        if (optionalDataUri) {
            leftImageArea.classList.add('containsImage');
            leftImageArea.style.backgroundImage = 'url(' + optionalDataUri + ')';
        } else {
            leftImageArea.classList.remove('containsImage');
            leftImageArea.style.backgroundImage = '';
        }
    }
    var success = function(value) {
        var dataUri = 'data:' + imageType(currentFile) + ';base64,' + value;
        rightTextarea.value = '<img src="' + dataUri + '">';
        setBackgroundImage(dataUri);
    }
    var error = function(message) {
        leftImageArea.classList.add('errorSource');
        rightTextarea.classList.add('errorDestination');
        rightTextarea.value = message;
        setBackgroundImage(undefined);
    }

    if (!currentFile) {
        rightTextarea.value = 'No image';
        setBackgroundImage(undefined);
        return;
    }
    if (imageType(currentFile).indexOf('image') === -1) {
        error('Image type \'' + imageType(currentFile) + '\' was not recognized.');
        return;
    }

    var reader = new FileReader();
    reader.onload = function(result) {
        var imageFileAsArray = new Uint8Array(result.target.result);
        asyncToBase64(imageFileAsArray, undefined, success, error);
    };
    reader.onerror = function(result) {
        error(result.message);
    };

    rightTextarea.value = 'Converting...';
    reader.readAsArrayBuffer(currentFile);
}

function bidirectionalTextConversion(convertLeftToRight) {
    var inputElement = convertLeftToRight ? leftTextarea : rightTextarea;
    var outputElement = convertLeftToRight ? rightTextarea : leftTextarea;
    var success = function(value) {
        outputElement.value = value;
    }
    var error = function(message) {
        inputElement.classList.add('errorSource');
        outputElement.classList.add('errorDestination');
        outputElement.value = message;
    }
    var converter = convertLeftToRight ? asyncToBase64 : asyncFromBase64;
    converter(inputElement.value, rightConversionType.encoding, success, error);
}

function onLeftTypeChanged(optionalSkipConversionUpdate) {
    var selectedValue = leftTypeSelect.options[leftTypeSelect.selectedIndex].value;
    var newType = LeftConversionTypes[selectedValue];
    if (newType === leftConversionType)
        return;
    if (newType === undefined)
        throw 'Unknown conversion type: ' + selectedValue;
    leftConversionType = newType;
    leftTypeText.textContent = leftConversionType.displayName;

    // Ensure the correct (image / text) left view is visible.
    if (leftConversionType.isImage == leftImageArea.classList.contains('hidden')) {
        leftImageArea.classList.toggle('hidden');
        leftTextarea.classList.toggle('hidden');
    }

    updateRightTypeAfterLeftTypeChange();
    if (!optionalSkipConversionUpdate)
        updateConversion();
}

function onRightTypeChanged(optionalSkipConversionUpdate) {
    var selectedValue = rightTypeSelect.options[rightTypeSelect.selectedIndex].value;
    var newType = RightConversionTypes[selectedValue];
    if (newType === rightConversionType)
        return;
    if (newType === undefined)
        throw 'Unknown conversion type: ' + selectedValue;
    rightConversionType = newType;
    rightTypeText.textContent = rightConversionType.displayName;
    if (rightConversionType.forImage)
        rightTextarea.setAttribute('readonly', 'readonly');
    else
        rightTextarea.removeAttribute('readonly');
    if (rightConversionType.forImage)
        userLastChangedRightSide = false;
    if (!optionalSkipConversionUpdate)
        updateConversion();
}

function updateRightTypeAfterLeftTypeChange() {
    var firstEnabledIndex, firstEnabledType;
    for (var optionIndex = 0; optionIndex < rightTypeSelect.options.length; optionIndex++) {
        var option = rightTypeSelect.options[optionIndex];
        var rightType = RightConversionTypes[option.value];
        if (rightType === undefined)
            throw 'Unknown conversion type: ' + selectedValue;
        var enabled = leftConversionType.isImage === rightType.forImage;
        option.disabled = !enabled;
        if (!firstEnabledIndex && !firstEnabledType && enabled) {
            firstEnabledIndex = optionIndex;
            firstEnabledType = rightType;
        }
    }
    if (leftConversionType.isImage != rightConversionType.forImage) {
        rightTypeSelect.selectedIndex = firstEnabledIndex;
        onRightTypeChanged(true);
    }
}

function onDropFiles(files) {
    if (files.length === 0)
        return;
    currentFile = files[0];
    if (!leftConversionType.isImage) {
        // Switch to the first image type.
        var leftConversions = Object.keys(LeftConversionTypes);
        for (var index = 0; index < leftConversions.length; index++) {
            if (LeftConversionTypes[leftConversions[index]].isImage) {
                leftTypeSelect.selectedIndex = index;
                onLeftTypeChanged(true);
                break;
            }
        }
    }
    updateConversion();
}

function imageType(file) {
    if (file.type !== '')
        return file.type;

    // The stock browser on Android 4.3 returns an empty string for type. If the type is empty but a
    // file was uploaded, synthesize a mimetype from the filename.
    if (!file.name || file.name.length <= 0)
        return '';
    var extension = file.name.substr(file.name.lastIndexOf('.') + 1);
    switch (extension) {
        case('bmp'): return 'image/bmp';
        case('gif'): return 'image/gif';
        case('jpeg'): return 'image/jpeg';
        case('jpg'): return 'image/jpeg';
        case('jpe'): return 'image/jpeg';
        case('png'): return 'image/png';
        case('svg'): return 'image/svg+xml';
        case('svgz'): return 'image/svg+xml';
        case('webp'): return 'image/webp';
        case('ico'): return 'image/x-icon';
    }
    return '';
}
