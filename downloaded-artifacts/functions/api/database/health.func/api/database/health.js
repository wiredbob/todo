"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../utils/supabase");
const response_1 = require("../utils/response");
async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        // Test database connectivity by counting users
        const { error: userError } = await supabase_1.supabase
            .from('users')
            .select('id', { count: 'exact' })
            .limit(1);
        if (userError) {
            return (0, response_1.sendError)(res, `Database connection failed: ${userError.message}`, 503);
        }
        // Test tasks table connectivity
        const { error: taskError } = await supabase_1.supabase
            .from('tasks')
            .select('id', { count: 'exact' })
            .limit(1);
        if (taskError) {
            return (0, response_1.sendError)(res, `Tasks table error: ${taskError.message}`, 503);
        }
        const healthData = {
            message: 'Database connection healthy',
            timestamp: new Date().toISOString(),
            database: {
                connected: true,
                tables: {
                    users: 'accessible',
                    tasks: 'accessible'
                }
            }
        };
        return (0, response_1.sendSuccess)(res, healthData);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Database health check failed', 500);
    }
}
exports.default = handler;
//# sourceMappingURL=health.js.map