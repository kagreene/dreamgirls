"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("../config/connection"));
const models_1 = require("../models");
const userData_json_1 = __importDefault(require("./userData.json")); //fixed issue by adding "resolveJsonModule": true, to server tsconfig.json njw
const reviewData_json_1 = __importDefault(require("./reviewData.json")); // Changed from reportData.json
//connect to database
connection_1.default.once('open', async () => {
    try {
        // clear existing data
        await models_1.Review.deleteMany({});
        await models_1.User.deleteMany({});
        // create users
        const users = await models_1.User.create(userData_json_1.default);
        // create reviews and assign to random users
        for (const review of Array.isArray(reviewData_json_1.default) ? reviewData_json_1.default : []) { //changed to correct array error "reviewData" 3.19.25 njw
            const randomUserIndex = Math.floor(Math.random() * users.length);
            const user = users[randomUserIndex];
            const createdReview = await models_1.Review.create({
                ...review,
                reviewedBy: user._id,
            });
            // add review to user's reviews
            await models_1.User.findByIdAndUpdate(user._id, { $push: { reviews: createdReview._id } }, { new: true });
        }
        console.log('Seed data inserted!');
        process.exit(0);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
});
