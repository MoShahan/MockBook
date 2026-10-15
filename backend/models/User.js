import mongoose from "mongoose"

const Schema = mongoose.Schema

const stripPassword = (_doc, ret) => {
  delete ret.password
  return ret
}

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true, minlength: 2, maxlength: 50 },
    lastName: { type: String, required: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, maxlength: 50, unique: true },
    // Hash only — never select by default; plaintext policy enforced in auth controller
    password: { type: String, required: true, select: false },
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

UserSchema.set("toJSON", { transform: stripPassword })
UserSchema.set("toObject", { transform: stripPassword })

const User = mongoose.model("User", UserSchema)

export default User
