let magicNumber = 20;

function base64ToHex(base64) {
    let raw = atob(base64);
    let hex = '';
    for (let i = 0; i < raw.length; i++) {
        let byte = raw.charCodeAt(i);
        hex += byte.toString(16).padStart(2, '0');
    }
    return hex;
}

function hexToBin(hex) {
    hex = hex.toUpperCase();
    let bin = '';
    for (let i = 0; i < hex.length; i++) {
        let decimal = parseInt(hex[i], 16);
        let binary = decimal.toString(2).padStart(4, '0');
        bin += binary;
    }
    return bin;
}

function processVarUint(pairs, index) {
    let resultBinary = "";
    let currentByte;

    do {
        currentByte = hexToBin(pairs[index]);
        resultBinary = currentByte.slice(1) + resultBinary;
        index++;
    } while (currentByte[0] === '1' && index < pairs.length);

    return { value: parseInt(resultBinary, 2), nextIndex: index };
}

function getNextPair(pairs, index) {
    return index < pairs.length ? pairs[index] : null;
}

function interpretHex(hexStr) {
    const pairs = hexStr.match(/.{2}/g);
    let index = 0;
    let lightingSequence = [];
    let lastCommandWasColor = false;

    
    while (index < pairs.length) {
        let pair = getNextPair(pairs, index);

        let red, green, blue;

        switch (pair) {
            case '02':  // sleep
                const sleepDuration = processVarUint(pairs, index + 1);
                if (lastCommandWasColor && lightingSequence.length > 0) {
                    lightingSequence[lightingSequence.length - 1].duration += (sleepDuration.value * magicNumber);
                }
                index = sleepDuration.nextIndex;
                lastCommandWasColor = false;
                break;
            case '04':  // set color
                red = parseInt(getNextPair(pairs, ++index) || '00', 16);
                green = parseInt(getNextPair(pairs, ++index) || '00', 16);
                blue = parseInt(getNextPair(pairs, ++index) || '00', 16);
                let colorDuration = processVarUint(pairs, index);
                lightingSequence.push({ color: (red << 16) + (green << 8) + blue, duration: (colorDuration.value * magicNumber) });
                index = colorDuration.nextIndex;
                lastCommandWasColor = true;
                break;
            case '05':  // set gray
                // As an example, for gray we just set R, G, and B to the same value.
                let gray = parseInt(pairs[++index], 16);
                let grayDuration = processVarUint(pairs, index);
                lightingSequence.push({ color: (gray << 16) + (gray << 8) + gray, duration: (grayDuration.value * magicNumber) });
                index = grayDuration.nextIndex;
                lastCommandWasColor = true;
                break;
            case '06':  // set black
                let blackDuration = processVarUint(pairs, index);
                lightingSequence.push({ color: 0x000000, duration: (blackDuration.value * magicNumber) });
                index = blackDuration.nextIndex;
                lastCommandWasColor = true;
                break;
            case '07':  // set white
                let whiteDuration = processVarUint(pairs, index + 1);
                lightingSequence.push({ color: 0xFFFFFF, duration: (whiteDuration.value * magicNumber) });
                index = whiteDuration.nextIndex;
                lastCommandWasColor = true;
                break;
            case '08':  // Fade to color
                red = parseInt(getNextPair(pairs, ++index) || '00', 16);
                green = parseInt(getNextPair(pairs, ++index) || '00', 16);
                blue = parseInt(getNextPair(pairs, ++index) || '00', 16);
                const fadeDuration = processVarUint(pairs, index + 1);
                lightingSequence.push({ color: (red << 16) + (green << 8) + blue, duration: (fadeDuration.value * magicNumber) });
                index = fadeDuration.nextIndex;
                lastCommandWasColor = true;
                break;
            default:
                index++;  // progress to the next pair.
                lastCommandWasColor = false;
                break;
        }
    }

    return {
        lightingSequence: lightingSequence
    };
}

function convertLightData(string){
    let input = base64ToHex(string);
    return interpretHex(input);
}

export {convertLightData};