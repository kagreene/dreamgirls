import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

//create interface representing a user document
interface IUser {
    username: string;
    email: string;
    password: string;
    reports?: Schema.Types.ObjectId[];
    isPasswordValid(password: string): boolean;
}

//create schema corresponding to the document interface
const userSchema = new Schema<IUser>(
    {
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
                type: Schema.Types.ObjectId,
                ref: 'Review',
            },
        ],
    },
    {
       timestamps: true,
       toJSON: {
        virtuals: true,
        //don't include password in JSON responses
        transform: (_doc: unknown, ret: Partial<IUser>) => {
            delete ret.password;
            return ret;
        },
      }, 
    }
);

//hash user passowrd before saving
userSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('password')) {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }
    next();
});

//custom method to compare and validate password
userSchema.methods.isPasswordValid = async function (password: string) {
    return bcrypt.compare(password, this.password);
};

//create and export User model
const User = model<IUser>('User', userSchema);
export default User;