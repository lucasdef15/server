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
exports.reportPost = exports.updatePost = exports.deletePost = exports.addPost = exports.getPost = exports.getPosts = void 0;
const db_1 = require("../../../lib/db");
const sharp_1 = __importDefault(require("sharp"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const pageSize = req.query.pageSize
            ? parseInt(req.query.pageSize)
            : 8;
        const categoryId = req.query.categoryID
            ? req.query.categoryID.toString()
            : undefined;
        const skip = (page - 1) * pageSize;
        const whereCondition = categoryId ? { categoryId } : {};
        const totalPosts = yield db_1.prisma.post.count({ where: whereCondition });
        const posts = yield db_1.prisma.post.findMany({
            where: whereCondition,
            skip,
            take: pageSize,
        });
        const totalPages = Math.ceil(totalPosts / pageSize);
        return res.status(200).json({ posts, totalPosts, totalPages });
    }
    catch (error) {
        console.error('Failed to get posts:', error);
        return res.status(500).json({
            errors: [{ msg: 'Failed to get posts.' }],
            data: null,
        });
    }
    finally {
        yield db_1.prisma.$disconnect();
    }
});
exports.getPosts = getPosts;
const getPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield db_1.prisma.post.findUnique({
            where: {
                id: req.params.id,
            },
            select: {
                id: true,
                category: true,
                title: true,
                desc: true,
                base64Img: true,
                updatedAt: true,
                createdAt: true,
                author: {
                    select: {
                        base64Img: true,
                        name: true,
                    },
                },
            },
        });
        return res.status(200).json([post]);
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
exports.getPost = getPost;
const addPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, desc, categoryID: categoryId, authorID: authorId, } = req.body;
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
        const user = yield db_1.prisma.user.findUnique({
            where: {
                email: req.user,
            },
        });
        const newPost = yield db_1.prisma.post.create({
            data: {
                title,
                desc,
                categoryId,
                authorId,
                base64Img: image,
            },
        });
        const recipients = [
            { email: 'renato@r2619.us', name: 'Renato' },
            { email: 'lais@r2619.us', name: 'Lais' },
            { email: 'lucasff15@hotmail.com', name: 'Lucas' },
        ];
        const transporter = nodemailer_1.default.createTransport({
            host: 'mail.r2619.us',
            port: 465,
            secure: true,
            auth: {
                user: 'server@r2619.us',
                pass: 'Vancouver123@',
            },
        });
        // Send personalized emails to each recipient
        for (const recipient of recipients) {
            const mailOptions = {
                from: 'server@r2619.us',
                to: recipient.email,
                subject: 'R2619 New Post',
                text: `Hello ${recipient.name},\n\nA new post has been published by ${user === null || user === void 0 ? void 0 : user.name}.\nTo read it, please follow this link: ${'https://r2619.us/posts/' + newPost.id}`,
            };
            yield new Promise((resolve, reject) => {
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error(error);
                        reject(error);
                    }
                    else {
                        console.log('Email sent: ' + info.response);
                        resolve();
                    }
                });
            });
        }
        return res.json('Post has been added!');
    }
    catch (error) {
        console.error('Failed to add post:', error);
        return res.status(500).json({
            errors: [{ msg: 'Failed to add post.' }],
            data: null,
        });
    }
    finally {
        yield db_1.prisma.$disconnect();
    }
});
exports.addPost = addPost;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.id;
        yield db_1.prisma.post.delete({
            where: {
                id: postId,
            },
        });
        return res.json('Post has been deleted!');
    }
    catch (error) {
        console.error('Failed to delete post:', error);
        return res.status(500).json({
            errors: [{ msg: 'Failed to delete post.' }],
            data: null,
        });
    }
    finally {
        yield db_1.prisma.$disconnect();
    }
});
exports.deletePost = deletePost;
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.id;
        const categoryID = req.body.categoryID;
        const authorID = req.body.authorID;
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
        image = req.body.img ? req.body.img : image;
        yield db_1.prisma.post.update({
            where: {
                id: postId,
            },
            data: {
                title: req.body.title,
                desc: req.body.desc,
                base64Img: image,
                categoryId: categoryID,
                authorId: authorID,
                createdAt: req.body.date,
                updatedAt: req.body.edited,
            },
        });
        return res.json('Post has been updated.');
    }
    catch (error) {
        console.error('Failed to delete post:', error);
        return res.status(500).json({
            errors: [{ msg: 'Failed to delete post.' }],
            data: null,
        });
    }
    finally {
        yield db_1.prisma.$disconnect();
    }
});
exports.updatePost = updatePost;
const reportPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name: userName, email, message, postId } = req.body;
        const post = yield db_1.prisma.post.findFirst({
            where: {
                id: postId,
            },
        });
        const recipients = [
            // { email: 'renato@r2619.us', name: 'Renato' },
            // { email: 'lais@r2619.us', name: 'Lais' },
            { email: 'lucasff15@hotmail.com', name: 'Lucas' },
        ];
        const transporter = nodemailer_1.default.createTransport({
            host: 'mail.r2619.us',
            port: 465,
            secure: true,
            auth: {
                user: 'server@r2619.us',
                pass: 'Vancouver123@',
            },
        });
        // Send personalized emails to each recipient
        for (const recipient of recipients) {
            const mailOptions = {
                from: 'server@r2619.us',
                to: recipient.email,
                subject: 'R2619 Has a Post Report',
                text: `Hello ${recipient.name},
        \n\nA new report for the post "${post === null || post === void 0 ? void 0 : post.title}" has been submitted by user ${userName} (${email}).
        \n
        Report Message:
        ${message}
        \n
        You can review the reported post by following this link: ${'https://r2619.us/posts/' + (post === null || post === void 0 ? void 0 : post.id)}
        \n
        Regards,
        R2619 Support Team`,
            };
            yield new Promise((resolve, reject) => {
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error(error);
                        reject(error);
                    }
                    else {
                        console.log('Email sent: ' + info.response);
                        resolve();
                    }
                });
            });
        }
        return res.json('Report has been made!');
    }
    catch (error) {
        console.error('Failed to delete post:', error);
        return res.status(500).json({
            errors: [{ msg: 'Failed to delete post.' }],
            data: null,
        });
    }
    finally {
        yield db_1.prisma.$disconnect();
    }
});
exports.reportPost = reportPost;
