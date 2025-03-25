import { User, Review } from '../models/index.js';
import { signToken, AuthenticationError } from '../utils/auth.js';
import { GraphQLError } from 'graphql';

const resolvers = {
  Query: {
    me: async (parent: any, args: any, context: any) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate('reviews');
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    
    users: async () => {
      return User.find().populate('reviews');
    },
    
    user: async (parent: any, { username }: { username: string }) => {
      return User.findOne({ username }).populate('reviews');
    },
    
    reviews: async () => {
      return Review.find().sort({ createdAt: -1 }).populate('author');
    },
    
    reviewsByLocation: async (parent: any, { lng, lat, distance = 5000 }: { lng: number, lat: number, distance?: number }) => {
      return Review.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            $maxDistance: distance // in meters
          }
        }
      }).populate('author');
    },
    
    reviewsByAddress: async (parent: any, { address }: { address: string }) => {
      // Case-insensitive partial address search
      return Review.find({
        'location.address': { $regex: address, $options: 'i' }
      }).populate('author');
    },
    
    review: async (parent: any, { reviewId }: { reviewId: string }) => {
      return Review.findOne({ _id: reviewId }).populate('author');
    }
  },

  Mutation: {
    addUser: async (parent: any, { username, email, password }: { username: string, email: string, password: string }) => {
      try {
        console.log('here are args', username, email, password);
        const user = await User.create({ username, email, password });
        console.log('here is user', user);
        const token = signToken(username, email, user._id);  
        console.log('here is token', token);
        return { token, user };
      } catch (err: any) {
        if (err.code === 11000) {
          throw new GraphQLError('Username or email already exists', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        console.log('here is error', err);
        return { error: err }
        throw err;
      }
    },
    
    login: async (parent: any, { email, password }: { email: string, password: string }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Invalid credentials');
      }

      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    
    addReview: async (parent: any, { reviewData }: any, context: any) => {
      if (context.user) {
        const review = await Review.create({
          ...reviewData,
          author: context.user._id
        });

        await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { reviews: review._id } },
          { new: true }
        );

        return await Review.findOne({ _id: review._id }).populate('author');
      }
      throw new AuthenticationError('You need to be logged in to add a review!');
    },
    
    updateReview: async (parent: any, { reviewId, reviewData }: any, context: any) => {
      if (context.user) {
        const review = await Review.findById(reviewId);
        
        if (!review) {
          throw new GraphQLError('Review not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }
        
        // Check if the current user is the author of the review
        if (review.author.toString() !== context.user._id) {
          throw new AuthenticationError('You are not authorized to update this review');
        }
        
        return await Review.findByIdAndUpdate(
          reviewId,
          { $set: reviewData },
          { new: true, runValidators: true }
        ).populate('author');
      }
      throw new AuthenticationError('You need to be logged in to update a review!');
    },
    
    removeReview: async (parent: any, { reviewId }: { reviewId: string }, context: any) => {
      if (context.user) {
        const review = await Review.findById(reviewId);
        
        if (!review) {
          throw new GraphQLError('Review not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }
        
        // Check if the current user is the author of the review
        if (review.author.toString() !== context.user._id) {
          throw new AuthenticationError('You are not authorized to delete this review');
        }
        
        // Remove the review from the user's reviews array
        await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { reviews: reviewId } }
        );
        
        // Delete the review
        return await Review.findByIdAndDelete(reviewId);
      }
      throw new AuthenticationError('You need to be logged in to delete a review!');
    }
  }
};

export default resolvers;