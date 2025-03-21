"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
//create schema corresponding to the document interface
const reviewSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
    },
    reviewType: {
        type: String,
        required: true,
        enum: ['harassment', 'theft', 'assault', 'unsafe_environment', 'other'],
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
        address: {
            type: String,
        },
    },
    severity: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    upvotes: {
        type: Number,
        default: 0,
    },
    downvotes: {
        type: Number,
        default: 0,
    },
    reviewedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comments: [
        {
            commentText: {
                type: String,
                required: true,
                minlength: 1,
            },
            commentAuthor: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
});
//create goespatial index for efficient location-based queries
reviewSchema.index({ location: '2dsphere' });
//virtual for calculating upvote/downvote ratio
reviewSchema.virtual('voteRatio').get(function () {
    if (this.upvotes === 0 && this.downvotes === 0)
        return 0;
    return this.upvotes / (this.upvotes + this.downvotes);
});
//create and export Reviewsmodel
const Review = (0, mongoose_1.model)('Review', reviewSchema);
exports.default = Review;
