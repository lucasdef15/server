"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const auths_1 = __importDefault(require("./src/routes/users/routes/auths"));
const root_1 = __importDefault(require("./src/routes/root"));
const posts_1 = __importDefault(require("./src/routes/posts/routes/posts"));
const cats_1 = __importDefault(require("./src/routes/cats/routes/cats"));
const logger_1 = require("./src/middleware/logger");
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
// Middleware
// Logger middleware to log requests
app.use(logger_1.logger);
app.use(express_1.default.json({ limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// Serve static files from the 'public' directory
app.use('/', express_1.default.static(path_1.default.join(__dirname, 'public')));
// Configure CORS based on the environment
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.CORS_ORIGIN_PROD
        : process.env.CORS_ORIGIN_DEV,
    credentials: true, // Allow cookies
}));
// Routes
// API routes
app.use('/', root_1.default);
// Authentication routes
app.use('/api/auth', auths_1.default);
// Posts routes
app.use('/api/posts', posts_1.default);
// Cats routes
app.use('/api/cats', cats_1.default);
// Handle 404 Not Found
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path_1.default.join(__dirname, 'views', '404.html'));
    }
    else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' });
    }
    else {
        res.type('text').send('404 Not Found');
    }
});
// Start the Express app on port 8080
const port = 8080;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
