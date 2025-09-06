"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
function sendSuccess(res, data, status = 200) {
    const response = {
        success: true,
        data
    };
    return res.status(status).json(response);
}
exports.sendSuccess = sendSuccess;
function sendError(res, message, status = 500) {
    const response = {
        success: false,
        error: message
    };
    return res.status(status).json(response);
}
exports.sendError = sendError;
//# sourceMappingURL=response.js.map