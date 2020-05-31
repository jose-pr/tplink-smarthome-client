"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsValidSmartHomeResponse = exports.IsValidSmartHomeMethodResult = void 0;
function IsValidSmartHomeMethodResult(result) {
    return result.err_code === 0;
}
exports.IsValidSmartHomeMethodResult = IsValidSmartHomeMethodResult;
function IsValidSmartHomeResponse(response) {
    for (let ns in response) {
        for (let n in response[ns]) {
            if (!IsValidSmartHomeMethodResult(response[ns][n])) {
                throw new Error(`Error Code ${response[ns][n].err_code} for result of ${ns}.${n}`);
            }
        }
    }
    return true;
}
exports.IsValidSmartHomeResponse = IsValidSmartHomeResponse;
