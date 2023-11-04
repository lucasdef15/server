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
exports.resetPassword = exports.forgotPassword = exports.updateUser = exports.currentUser = exports.logOut = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../../../lib/db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const sharp_1 = __importDefault(require("sharp"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
dotenv_1.default.config();
// Generate and store the verification code for the user
const verificationCodes = new Map();
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // const name = 'Lucas';
        // const email = 'lucas@hotmail.com';
        // const password = 'lukao1000';
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
                name: name,
                email: email,
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
                .resize({ width: 500, height: 500 })
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
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const code = crypto_1.default.randomBytes(3).toString('hex');
        const user = yield db_1.prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (!user) {
            return res.send('User not found.');
        }
        // Store the code with the user's email
        verificationCodes.set(email, { code, createdAt: Date.now() });
        const transporter = nodemailer_1.default.createTransport({
            host: 'mail.r2619.us',
            port: 465,
            secure: true,
            auth: {
                user: 'server@r2619.us',
                pass: 'Vancouver123@',
            },
        });
        const mailOptions = {
            from: 'server@r2619.us',
            to: email,
            subject: 'R2619 Password Reset Code',
            text: `Your verification code is: ${code}`,
        };
        yield new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                    reject(error);
                }
                else {
                    res.send('Code sent to your email');
                    resolve();
                }
            });
        });
    }
    catch (error) {
        console.error('Error to reset password:', error);
        return res.status(500).json({
            errors: [{ msg: 'Internal server error.' }],
        });
    }
    finally {
        yield db_1.prisma.$disconnect();
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const code = req.body.code;
        const newPassword = req.body.newPassword;
        const storedCode = verificationCodes.get(email);
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        if (!storedCode ||
            storedCode.code !== code ||
            Date.now() - storedCode.createdAt > 15 * 60 * 1000) {
            res.status(400).send('Invalid or expired code');
        }
        else {
            yield db_1.prisma.user.update({
                where: {
                    email,
                },
                data: {
                    password: hashedPassword,
                },
            });
            // Update verification code status
            verificationCodes.delete(email);
            res.send('Password reset successfully');
        }
    }
    catch (error) {
        console.error('Error to reset password:', error);
        return res.status(500).json({
            errors: [{ msg: 'Internal server error.' }],
        });
    }
    finally {
        yield db_1.prisma.$disconnect();
    }
});
exports.resetPassword = resetPassword;
