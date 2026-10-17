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
    email: { type: String, required: true, maxlength: 100, unique: true },
    // Hash only - never select by default; plaintext policy enforced in auth controller.
    // OAuth-only accounts still store a random unusable hash.
    password: { type: String, required: true, select: false },
    /** Site role. Clients cannot self-promote; set via ADMIN_EMAILS / seed / DB. */
    role: { type: String, enum: ["user", "admin"], default: "user" },
    /** Soft deactivation (admins). Deactivated users cannot authenticate. */
    isActive: { type: Boolean, default: true },
    deactivatedAt: { type: Date, default: null },
    deactivatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    /** Linked social login providers (Google / GitHub / Discord). */
    oauthProviders: {
      type: [
        {
          provider: { type: String, enum: ["google", "github", "discord"], required: true },
          providerId: { type: String, required: true },
        },
      ],
      default: [],
    },
    picturePath: { type: String, default: "" },
    /** Solid color for initials avatar when no photo (allowlisted hex). */
    avatarColor: { type: String, default: "#314F3B" },
    /** Solid profile header/cover color (allowlisted hex). */
    coverColor: { type: String, default: "#57534E" },
    friends: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    /** One-way follows (I follow these users). Independent of friends. */
    following: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    /** Bookmarked posts (own + others’). Private to this user. */
    savedPosts: {
      type: [{ type: Schema.Types.ObjectId, ref: "Post" }],
      default: [],
    },
    location: { type: String, default: "" },
    occupation: { type: String, default: "" },
    facebook: { type: String, default: "" },
    x: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    instagram: { type: String, default: "" },
    viewedProfile: { type: Number, default: 0 },
  },
  { timestamps: true }
)

UserSchema.set("toJSON", { transform: stripPassword })
UserSchema.set("toObject", { transform: stripPassword })

const User = mongoose.model("User", UserSchema)

export default User
