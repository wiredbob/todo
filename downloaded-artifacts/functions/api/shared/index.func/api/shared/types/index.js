"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _user = require("./user");
Object.keys(_user).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _user[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _user[key];
    }
  });
});
var _task = require("./task");
Object.keys(_task).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _task[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _task[key];
    }
  });
});
var _api = require("./api");
Object.keys(_api).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _api[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _api[key];
    }
  });
});
//# sourceMappingURL=index.js.map