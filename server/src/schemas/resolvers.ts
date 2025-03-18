import { GraphQLError } from 'graphql';
import { AuthContext, TokenUser, auth } from '../utils/auth';
import { User, Review } from '../models';

const resolvers = {
    Query: {
        //get logged in user
        me: async (_: any, __: any, context: AuthContext) => {
            const user = auth.checkAuth(context);
            return User.findOne({ _id: user._id }).populate('reviews');
        },

        //get all users
        users: async () => {
            return User.find().populate('reviews');
        },

        //get a user by username
        user: async (_: any, { username }: { username: string }) => {
            return User.findOne({ username }).populate('reviews');
        },

        //get all reviews 
        reviews: async () => {
            return Review.find().sort({ createdAt: -1 }).populate('reviewedBy');
        },

        //get a single review by ID
        review: async (_: any, { reviewId }: { reviewId: string }) => {
            return Review.findOne({ _id: reviewId })
              .populate('reviewedBy')
              .populate({
                path: 'comments.commentAuthor',
                model: 'User',
            });
        },

        //get all reviews by a specific user
        reviewsByUser: async (_: any, { username }: { username: string }) => {
            const user = await User.findOne({ username });
            if (!user) {
                throw new GraphQLError('User not found',  {
                    extensions: { code: 'USER_NOT_FOUND' },
                });
            }

            return Review.find({ reviewedBy: user._id })
            .sort({ createdAt: -1 })
            .populate('reviewedBy');
        },

        //get reviews near specific location
        reviewsByLocation: async (
            _: any, 
            { longitude, latitude, distance }: { longitude: number, latitude: number, distance: number }
          ) => {
            return Review.find({
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
        addUser: async (
            _: any,
            { username, email, password }: { username: string, email: string, password: string }
        ) =>  {
            //create user
            const user = await User.create({ username, email, password });
            //sign a JWT
            const token = auth.signToken(user);
            // Return an Auth object
            return { token, user };
         },

         login: async (
            _: any, 
            { email, password }: { email: string, password: string }
          ) => {
            // Find the user
            const user = await User.findOne({ email });
            if (!user) {
              throw new GraphQLError('No user found with this email address', {
                extensions: { code: 'USER_NOT_FOUND' },
              });
            }
            
            // Check password
            const correctPw = await user.isPasswordValid(password);
            if (!correctPw) {
              throw new GraphQLError('Incorrect credentials', {
                extensions: { code: 'INCORRECT_CREDENTIALS' },
              });
            }

            //sign a JWT
            const token = auth.signToken(user);
            // return an Auth object
            return { token, user };
        },

        //review mutations
        addReview: async (
            _: any,
            { reviewData }: { reviewData: any }, 
            context: AuthContext
        ) => {
            const user = auth.checkAuth(context);

            // create the review
            const review = await Review.create({
                ...reviewData,
                reviewedBy: user._id,
            });    

            //add review to user's reviews
            await User.findByIdAndUpdate(
                user._id,
                { $push: { reviews: review._id } },
                { new: true }
            );

            return review.populate('reviewedBy');
        },

        updateReview: async (
            _: any,
            { reviewId, reviewData }: { reviewId: string, reviewData: any },
            context: AuthContext
        ) => {
            const user = auth.checkAuth(context);

            //find reviedw and check if user is the creator
            const review = await Review.findById(reviewId);
            if (!review) {
                throw new GraphQLError('Review not found', {
                    extensions: { code: 'REVIEW_NOT_FOUND' },
                });
            }

            if (review.reviewedBy.toString() !== user._id) {
                throw new GraphQLError('Not authorized to update this review', {
                    extensions: { code: 'UNAUTHORIZED' },
                });
            }
 
            //update the review
            const updatedReview = await Review.findByIdAndUpdate(
                reviewId,
                { ...reviewData },
                { new: true }
            ).populate('reviewedBy');

            return updatedReview;
        },

        removeReview: async (
            _: any,
            { reviewId }: { reviewId: string },
            context: AuthContext
        ) => {
            const user = auth.checkAuth(context);

            // find review and check if user is the creator
            const review = await Review.findById(reviewId);
            if (!review) {
                throw new GraphQLError('Review not found', {
                    extensions: { code: 'REVIEW_NOT_FOUND' },
                });
            }

            if (review.reviewedBy.toString() !==user._id) {
                throw new GraphQLError('Not authorized to delete this review', {
                    extensions: { code: 'UNAUTHORIZED' },
                });
            }

            //delete the review
            await Review.findByIdAndDelete(reviewId);

            // remove review from user's reviews
            await User.findByIdAndUpdate(
                user._id,
                { $pull: { reviews: reviewId } }
            );

            return review;
        },

        verifyReview: async (
            _: any,
            { reviewId }: {reviewId: string },
            context: AuthContext
        ) => {
            auth.checkAuth(context);

            //NOTE: In a real app, we might want to add admin-only validation here

            // update the review verification status
            const updatedReview = await Review.findByIdAndUpdate(
                reviewId,
                { verified: true },
                { new: true }
            ).populate('reviewedBy');

            return updatedReview;
        },

        // vote mutations
        upvoteReview: async (
            _: any,
            { reviewId }: { reviewId: string },
            context: AuthContext
        ) => {
            auth.checkAuth(context);

            // increment upvotes
            const updatedReview = await Review.findByIdAndUpdate(
                reviewId,
                { $inc: { upvotes: 1 } },
                { new: true }
            ).populate('reviewedBy');

            return updatedReview;
        },

        downvoteReview: async (
            _: any,
            { reviewId }: { reviewId: string },
            context: AuthContext
        ) => {
            auth.checkAuth(context);

            // increment downvotes
            const updatedReview = await Review.findByIdAndUpdate(
                reviewId,
                { $inc: { downvotes: 1 } },
                { new: true }
            ).populate('reviewedBy');

            return updatedReview;
        },

        // comment mutations
        addComment: async (
            _: any, 
            { reviewId, commentText }: { reviewId: string, commentText: string }, 
            context: AuthContext
          ) => {
            const user = auth.checkAuth(context);
            
            // Add comment to review
            const updatedReview = await Review.findByIdAndUpdate(
              reviewId,
              {
                $push: {
                  comments: { commentText, commentAuthor: user._id },
                },
              },
              { new: true }
            )
              .populate('reviewedBy')
              .populate({
                path: 'comments.commentAuthor',
                model: 'User',
              });
            
            return updatedReview;
          },
          
          removeComment: async (
            _: any, 
            { reviewId, commentId }: { reviewId: string, commentId: string }, 
            context: AuthContext
          ) => {
            const user = auth.checkAuth(context);
            
            // Find the review
            const review = await Review.findById(reviewId);
            if (!review) {
              throw new GraphQLError('Review not found', {
                extensions: { code: 'REVIEW_NOT_FOUND' },
              });
            }
            
            // Check if user is the comment author
            //TODO: Address TypeScript error line 300 after completing data models - 3.18.25 njw
      const comment = review.comments?.find(
        (c) => c._id?.toString() === commentId
      );
      
      if (!comment) {
        throw new GraphQLError('Comment not found', {
          extensions: { code: 'COMMENT_NOT_FOUND' },
        });
      }
      
      if (comment.commentAuthor.toString() !== user._id) {
        throw new GraphQLError('Not authorized to delete this comment', {
          extensions: { code: 'UNAUTHORIZED' },
        });
      }
      
      // Remove comment from review
      const updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        {
          $pull: {
            comments: { _id: commentId },
          },
        },
        { new: true }
      )
        .populate('reviewedBy')
        .populate({
          path: 'comments.commentAuthor',
          model: 'User',
        });
      
      return updatedReview;
    },
  },
};
export default resolvers;