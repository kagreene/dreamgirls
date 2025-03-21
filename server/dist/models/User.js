"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
//create schema corresponding to the document interface
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\..+/, 'Must match an email address!'],
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
    },
    reports: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Review',
        },
    ],
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        //don't include password in JSON responses
        transform: (_doc, ret) => {
            delete ret.password;
            return ret;
        },
    },
});
//hash user passowrd before saving
userSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('password')) {
        const saltRounds = 10;
        this.password = await bcrypt_1.default.hash(this.password, saltRounds);
    }
    next();
});
//custom method to compare and validate password
userSchema.methods.isPasswordValid = async function (password) {
    return bcrypt_1.default.compare(password, this.password);
};
//create and export User model
const User = (0, mongoose_1.model)('User', userSchema);
exports.default = User;
