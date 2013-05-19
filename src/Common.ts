// *********************************************
//         GLOBAL HELP FUNCTIONS
// *********************************************

class Common {
    static complete(val: number) {
        var result = '';
        for (var i = 0; i < val; i++) {
            result += ' ';
        }
        return result;
    }

    static format(start: number, maxLen: number, text: string): string {
        return Common.complete(start) + (text.length > maxLen ? text.substr(0, maxLen - 3) + '...' : text + complete(maxLen - text.length));
    }
}

// *********************************************
