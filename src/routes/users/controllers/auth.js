"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.currentUser = exports.logOut = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../../../lib/db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const sharp_1 = __importDefault(require("sharp"));
dotenv_1.default.config();
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const { name, email, password } = req.body;
        const name = 'Lucas';
        const email = 'lucas@hotmail.com';
        const password = 'lukao1000';
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const existingUser = yield db_1.prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (existingUser) {
            return res.json({
                errors: [
                    {
                        msg: 'Email already in use.',
                    },
                ],
                data: null,
            });
        }
        const newUser = yield db_1.prisma.user.create({
            data: {
                name,
                email,
                base64Img: '',
                password: hashedPassword,
                role: 'ADMIN',
            },
        });
        return res.status(200).json({ user: newUser });
    }
    catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({
            errors: [{ msg: 'Failed to create user.' }],
            data: null,
        });
    }
    finally {
        yield db_1.prisma.$disconnect();
    }
});
exports.signup = signup;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const foundUser = yield db_1.prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (!foundUser) {
            return res.status(401).json({
                msg: 'Unauthorized',
            });
        }
        const match = yield bcryptjs_1.default.compare(password, foundUser.password);
        if (!match) {
            return res.status(401).json({
                msg: 'Unauthorized',
            });
        }
        const token = jsonwebtoken_1.default.sign({ name: foundUser.name, email: foundUser.email, role: foundUser.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 36000 });
        res.cookie('token', token);
        res.json({ token: token });
    }
    catch (error) {
        console.error('Error to login:', error);
        return res.status(500).json({
            errors: [{ msg: 'Failed to login.' }],
            data: null,
        });
    }
    finally {
        yield db_1.prisma.$disconnect();
    }
});
exports.login = login;
const logOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookies = req.cookies;
        if (!(cookies === null || cookies === void 0 ? void 0 : cookies.token))
            return res.sendStatus(204);
        res.clearCookie('token');
        res.json({ message: 'Cookie cleared' });
    }
    catch (error) {
        console.error('Error to logout:', error);
        return res.status(500).json({
            errors: [{ msg: 'Failed to logout.' }],
            data: null,
        });
    }
    finally {
        yield db_1.prisma.$disconnect();
    }
});
exports.logOut = logOut;
const currentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield db_1.prisma.user.findUnique({
            where: {
                email: req.user,
            },
        });
        if (user) {
            return res.status(200).json({
                user,
            });
        }
        else {
            console.error('User not found.');
            return res.status(404).json({
                msg: 'User not found.',
            });
        }
    }
    catch (error) {
        console.error('Error to get current user:', error);
        return res.status(500).json({
            errors: [{ msg: 'Internal server error.' }],
        });
    }
    finally {
        yield db_1.prisma.$disconnect();
    }
});
exports.currentUser = currentUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        let image = '';
        if (req.file) {
            const buffer = req.file.buffer;
            // Resize and optimize the image
            const resizedBuffer = yield (0, sharp_1.default)(buffer)
                .resize({ width: 950, height: 600 })
                .toFormat('jpeg')
                .toBuffer();
            image = resizedBuffer.toString('base64');
        }
        yield db_1.prisma.user.update({
            where: {
                email: req.user,
            },
            data: {
                name,
                email,
                password: hashedPassword,
                base64Img: image,
                role: 'ADMIN',
            },
        });
        return res.json('User has been updated.');
    }
    catch (error) {
        console.error('Error to get current user:', error);
        return res.status(500).json({
            errors: [{ msg: 'Internal server error.' }],
        });
    }
    finally {
        yield db_1.prisma.$disconnect();
    }
});
exports.updateUser = updateUser;
