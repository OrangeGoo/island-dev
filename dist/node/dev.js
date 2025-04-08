"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDevServer = createDevServer;
const vite_1 = require("vite");
function createDevServer(root) {
    return (0, vite_1.createServer)({
        root,
    });
}
