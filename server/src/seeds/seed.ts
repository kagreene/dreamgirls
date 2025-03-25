import db from '../config/connection.js';
import { Review, User } from '../models/index.js';
import cleanDB from './cleanDB.js';

import userData from './userData.json' with { type: 'json' };
import reviewData from './reviewData.json' with { type: 'json' };

const seedDatabase = async (): Promise<void> => {
  try {
    await db();
    await cleanDB();
    
    // Create users
    const users = await User.create(userData);
    console.log('Users seeded successfully!');
    
    // Prepare review data with user references
    const reviewsWithUsers = reviewData.map((review, index) => ({
      ...review,
      author: users[index % users.length]._id
    }));
    
    // Create reviews
    await Review.insertMany(reviewsWithUsers);
    console.log('Reviews seeded successfully!');
    
    // Update users with their reviews
    for (const user of users) {
      const userReviews = await Review.find({ author: user._id });
      await User.findByIdAndUpdate(
        user._id,
        { $push: { reviews: { $each: userReviews.map(review => review._id) } } }
      );
    }
    console.log('User-review relationships seeded successfully!');
    
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();