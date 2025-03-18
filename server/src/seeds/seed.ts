import db from '../config/connection';
import { User, Review } from '../models';
import userData from './userData.json'; //TODO: verify routes for userData and reviewData njw
import reviewData from './reviewData.json'; // Changed from reportData.json

//connect to database
db.once('open', async () => {
    try {
        // clear existing data
        await Review.deleteMany({});
        await User.deleteMany({});

        // create users
        const users = await User.create(userData);

        // create reviews and assign to random users
        for (const review of reviewData) {
            const randomUserIndex = Math.floor(Math.random() * users.length);
            const user = users[randomUserIndex];

            const createdReview = await Review.create({
                ...review,
                reviewedBy: user._id,
            });

            // add review to user's reviews
            await User.findByIdAndUpdate(
                user._id,
                { $push: { reviews: createdReview._id } },
                { new: true }
            );
        }

        console.log('Seed data inserted!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
});