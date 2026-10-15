import mongoose from "mongoose"

const Schema = mongoose.Schema

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true, minlength: 2, maxlength: 50 },
    lastName: { type: String, required: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, maxlength: 50, unique: true },
    password: { type: String, required: true, minlength: 5 },
    picturePath: { type: String, default: "" },
    friends: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    location: { type: String, default: "" },
    occupation: { type: String, default: "" },
    viewedProfile: Number,
    impressions: Number,
  },
  { timestamps: true }
)

const User = mongoose.model("User", UserSchema)

export default User
