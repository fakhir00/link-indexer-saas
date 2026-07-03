"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const middleware_1 = require("./middleware");
const routes_1 = __importDefault(require("./routes"));
const prisma_1 = require("./prisma");
const queue_1 = require("./queue");
if (env_1.env.enableInlineWorker) {
    void Promise.resolve().then(() => __importStar(require('./worker')));
}
const app = (0, express_1.default)();
const corsOptions = {
    origin(origin, callback) {
        if (!origin || env_1.env.corsOrigins.includes('*') || env_1.env.corsOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`Origin not allowed: ${origin}`));
    },
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '2mb' }));
// Mount all routes
app.use('/', routes_1.default);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Global error handler
app.use(middleware_1.errorHandler);
app.listen(env_1.env.port, () => {
    console.log(`NexusIndexer backend running on http://localhost:${env_1.env.port}`);
});
process.on('SIGINT', async () => {
    await prisma_1.prisma.$disconnect();
    await queue_1.connection.quit();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await prisma_1.prisma.$disconnect();
    await queue_1.connection.quit();
    process.exit(0);
});
