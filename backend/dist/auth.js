"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
require("dotenv/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET_ENV = process.env.JWT_SECRET;
if (!JWT_SECRET_ENV) {
    throw new Error('Missing JWT_SECRET environment variable');
}
const JWT_SECRET = JWT_SECRET_ENV;
function generateToken(user) {
    const signOptions = {
        expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    };
    return jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, signOptions);
}
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    const token = authHeader.slice('Bearer '.length).trim();
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!decoded.id || !decoded.email || !decoded.role) {
            return res.status(401).json({ error: 'Unauthorized: Token payload is invalid' });
        }
        req.user = {
            id: String(decoded.id),
            email: String(decoded.email),
            role: String(decoded.role),
        };
        next();
    }
    catch {
        return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
    }
}
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
}
