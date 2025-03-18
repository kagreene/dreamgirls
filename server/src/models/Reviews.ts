import { Schema, model } from 'mongoose';

//create interface representing a reviews document
interface IReviews {
    title: string;
    description: string;
    reviewType: string;
    location: {
        type: string;
        coordinates: number[];
        address?: string;
    };
    severity: number;
    verified: boolean;
    upvotes: number;
    downvotes: number;
    reviewedBy: Schema.Types.ObjectId;
    comments?: {
        commentText: string;
        commentAuthor: Schema.Types.ObjectId;
        createdAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

//create schema corresponding to the document interface
const reviewsSchema = new Schema<IReviews>(
    {
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
            types: Number,
            default: 0,
        },
        reviewedBy: {
            type: Schema.Types.ObjectId,
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
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
    }
);

//create goespatial index for efficient location-based queries
reviewsSchema.index({ location: '2dsphere' });

//virtual for calculating upvote/downvote ratio
reviewsSchema.virtual('voteRatio').get(function () {
    if (this.upvotes === 0 && this.downvotes === 0) return 0;
    return this.upvotes / (this.upvotes + this.downvotes);
});

//create and export Reviews model
const Reviews = model<IReviews>('Reviews', reviewsSchema);
export default Reviews;