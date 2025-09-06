"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_TASK_VALUES = exports.API_ROUTES = void 0;
const API_ROUTES = exports.API_ROUTES = {
  HEALTH: '/api/health',
  DATABASE_HEALTH: '/api/database/health',
  TASKS: '/api/tasks',
  AUTH: '/api/auth'
};
const DEFAULT_TASK_VALUES = exports.DEFAULT_TASK_VALUES = {
  PRIORITY: 0,
  CONTEXT: 'personal',
  TASK_TYPE: 'general',
  STATUS: 'pending',
  BREAKDOWN_SOURCE: 'manual',
  TASK_LEVEL: 0,
  SEQUENCE_ORDER: 0
};
//# sourceMappingURL=index.js.map