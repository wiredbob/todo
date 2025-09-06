"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("./utils/response");
async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const healthData = {
            message: 'Simple Todo API is running',
            timestamp: new Date().toISOString(),
            status: 'healthy'
        };
        return (0, response_1.sendSuccess)(res, healthData);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
exports.default = handler;
//# sourceMappingURL=health.js.map