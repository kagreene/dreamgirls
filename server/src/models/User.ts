import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Define the interface for User document
export interface IUser extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  reviews: mongoose.Types.ObjectId[];
  isCorrectPassword(password: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
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
    match: [/.+@.+\..+/, 'Must use a valid email address'],
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
});

// Hash user password before saving
userSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Validate password for login
userSchema.methods.isCorrectPassword = async function(password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;