"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const verifyJWT = (req, res, next) => {
    let token = req.header('authorization');
    if (!token) {
        return res.status(403).json({
            errors: [
                {
                    msg: 'unauthorized',
                },
            ],
        });
    }
    token = token.split(' ')[1];
    jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            res.clearCookie('token');
            return res.status(403).json({ message: 'Forbidden' });
        }
        req.user = decoded.email;
        req.role = decoded.role;
        next();
    });
};
exports.default = verifyJWT;
