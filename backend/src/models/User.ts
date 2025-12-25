import mongoose, { Document, Model } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  subscriptionTier: 'free' | 'pro' | 'enterprise'
  createdAt: Date
  updatedAt: Date
  _id: mongoose.Types.ObjectId
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    subscriptionTier: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
  },
  {
    timestamps: true,
  }
)

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>('User', userSchema)

export default User
