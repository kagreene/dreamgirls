"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const auth_1 = require("../utils/auth"); //TODO: resolve issue with imports TokenUser, auth 3.18.25 njw
const models_1 = require("../models");
const resolvers = {
    Query: {
        //TODO: update/define auth.checkAuth with our own function
        //get logged in user
        me: async (_, __, context) => {
            const user = auth_1.auth.checkAuth(context);
            return models_1.User.findOne({ _id: user._id }).populate('reviews');
        },
        //get all users
        users: async () => {
            return models_1.User.find().populate('reviews');
        },
        //get a user by username
        user: async (_, { username }) => {
            return models_1.User.findOne({ username }).populate('reviews');
        },
        //get all reviews 
        reviews: async () => {
            return models_1.Review.find().sort({ createdAt: -1 }).populate('reviewedBy');
        },
        //get a single review by ID
        review: async (_, { reviewId }) => {
            return models_1.Review.findOne({ _id: reviewId })
                .populate('reviewedBy')
                .populate({
                path: 'comments.commentAuthor',
                model: 'User',
            });
        },
        //get all reviews by a specific user
        reviewsByUser: async (_, { username }) => {
            const user = await models_1.User.findOne({ username });
            if (!user) {
                throw new graphql_1.GraphQLError('User not found', {
                    extensions: { code: 'USER_NOT_FOUND' },
                });
            }
            return models_1.Review.find({ reviewedBy: user._id })
                .sort({ createdAt: -1 })
                .populate('reviewedBy');
        },
        //get reviews near specific location
        reviewsByLocation: async (_, { longitude, latitude, distance }) => {
            return models_1.Review.find({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [longitude, latitude],
                        },
                        $maxDistance: distance, // in meters
                    },
                },
            })
                .sort({ createdAt: -1 })
                .populate('reviewedBy');
        },
    },
    Mutation: {
        //user authentication mutations
        addUser: async (_parent, { input }) => {
            //create user
            const user = await models_1.User.create({ ...input });
            //sign a JWT
            const token = auth_1.auth.signToken({ _id: user.id, username: user.username, email: user.email });
            // Return an Auth object
            return { token, user };
        },
        login: async (_, { input }) => {
            // Find the user
            const { username, email } = input;
            const user = await models_1.User.findOne({ username });
            if (!user) {
                throw new graphql_1.GraphQLError('No user found with this email address', {
                    extensions: { code: 'USER_NOT_FOUND' },
                });
            }
            // Check password
            // const correctPw = await user.isPasswordValid(password);
            // if (!correctPw) {
            //   throw new GraphQLError('Incorrect credentials', {
            //     extensions: { code: 'INCORRECT_CREDENTIALS' },
            //   });
            // }
            //sign a JWT
            const token = auth_1.auth.signToken({ _id: user.id, username: user.username, email: user.email });
            // return an Auth object
            return { token, user };
        },
        //review mutations
        addReview: async (_, { input }, context) => {
            const user = auth_1.auth.checkAuth(context);
            // create the review
            const review = await models_1.Review.create({
                ...input.reviewData,
                reviewedBy: user._id,
            });
            //add review to user's reviews
            await models_1.User.findByIdAndUpdate(user._id, { $push: { reviews: review._id } }, { new: true });
            return review.populate('reviewedBy');
        },
        updateReview: async (_, { reviewId, input }, context) => {
            const user = auth_1.auth.checkAuth(context);
            //find reviedw and check if user is the creator
            const review = await models_1.Review.findById(reviewId);
            if (!review) {
                throw new graphql_1.GraphQLError('Review not found', {
                    extensions: { code: 'REVIEW_NOT_FOUND' },
                });
            }
            if (review.reviewedBy.toString() !== user._id) {
                throw new graphql_1.GraphQLError('Not authorized to update this review', {
                    extensions: { code: 'UNAUTHORIZED' },
                });
            }
            //update the review
            const updatedReview = await models_1.Review.findByIdAndUpdate(reviewId, { ...input.reviewData }, { new: true }).populate('reviewedBy');
            return updatedReview;
        },
        removeReview: async (_, { reviewId }, context) => {
            const user = auth_1.auth.checkAuth(context);
            // find review and check if user is the creator
            const review = await models_1.Review.findById(reviewId);
            if (!review) {
                throw new graphql_1.GraphQLError('Review not found', {
                    extensions: { code: 'REVIEW_NOT_FOUND' },
                });
            }
            if (review.reviewedBy.toString() !== user._id) {
                throw new graphql_1.GraphQLError('Not authorized to delete this review', {
                    extensions: { code: 'UNAUTHORIZED' },
                });
            }
            //delete the review
            await models_1.Review.findByIdAndDelete(reviewId);
            // remove review from user's reviews
            await models_1.User.findByIdAndUpdate(user._id, { $pull: { reviews: reviewId } });
            return review;
        },
        verifyReview: async (_, { reviewId }, context) => {
            auth_1.auth.checkAuth(context);
            //NOTE: In a real app, we might want to add admin-only validation here
            // update the review verification status
            const updatedReview = await models_1.Review.findByIdAndUpdate(reviewId, { verified: true }, { new: true }).populate('reviewedBy');
            return updatedReview;
        },
        // vote mutations
        upvoteReview: async (_, { reviewId }, context) => {
            auth_1.auth.checkAuth(context);
            // increment upvotes
            const updatedReview = await models_1.Review.findByIdAndUpdate(reviewId, { $inc: { upvotes: 1 } }, { new: true }).populate('reviewedBy');
            return updatedReview;
        },
        downvoteReview: async (_, { reviewId }, context) => {
            auth_1.auth.checkAuth(context);
            // increment downvotes
            const updatedReview = await models_1.Review.findByIdAndUpdate(reviewId, { $inc: { downvotes: 1 } }, { new: true }).populate('reviewedBy');
            return updatedReview;
        },
        // TO DO: FINISH UPDATING ARGUMENTS WITH INTERFACES
        // comment mutations
        addComment: async (_, { reviewId, input }, context) => {
            const user = auth_1.auth.checkAuth(context);
            // Add comment to review
            const updatedReview = await models_1.Review.findByIdAndUpdate(reviewId, {
                $push: {
                    comments: { commentText: input.commentText, commentAuthor: user._id },
                },
            }, { new: true })
                .populate('reviewedBy')
                .populate({
                path: 'comments.commentAuthor',
                model: 'User',
            });
            return updatedReview;
        },
        removeComment: async (_, { reviewId, input }, context) => {
            const user = auth_1.auth.checkAuth(context);
            // Find the review
            const review = await models_1.Review.findById(reviewId);
            if (!review) {
                throw new graphql_1.GraphQLError('Review not found', {
                    extensions: { code: 'REVIEW_NOT_FOUND' },
                });
            }
            // Check if user is the comment author
            //TODO: Address TypeScript error line 300 after completing data models and create MongoDB cluster(?) - 3.18.25 njw
            const comment = review.comments?.find((c) => c._id?.toString() === input.commentId);
            if (!comment) {
                throw new graphql_1.GraphQLError('Comment not found', {
                    extensions: { code: 'COMMENT_NOT_FOUND' },
                });
            }
            if (comment.commentAuthor.toString() !== user._id) {
                throw new graphql_1.GraphQLError('Not authorized to delete this comment', {
                    extensions: { code: 'UNAUTHORIZED' },
                });
            }
            // Remove comment from review
            const updatedReview = await models_1.Review.findByIdAndUpdate(reviewId, {
                $pull: {
                    comments: { _id: input.commentId },
                },
            }, { new: true })
                .populate('reviewedBy')
                .populate({
                path: 'comments.commentAuthor',
                model: 'User',
            });
            return updatedReview;
        },
    },
};
exports.default = resolvers;
