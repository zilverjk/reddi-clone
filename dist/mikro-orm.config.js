"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const Post_1 = require("./entities/Post");
const path_1 = __importDefault(require("path"));
const User_1 = require("./entities/User");
dotenv_1.default.config();
exports.default = {
    migrations: {
        path: path_1.default.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    entities: [Post_1.Post, User_1.User],
    type: process.env.DB_ENGINE,
    dbName: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    debug: process.env.NODE_ENV !== 'production',
};
//# sourceMappingURL=mikro-orm.config.js.map