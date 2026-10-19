import mongoose from "mongoose"

const Schema = mongoose.Schema

/**
 * One document per viewer+profile+UTC day - used to debounce viewedProfile $inc (A8).
 */
const ProfileViewSchema = new Schema(
  {
    viewer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    profile: { type: Schema.Types.ObjectId, ref: "User", required: true },
    day: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

ProfileViewSchema.index({ viewer: 1, profile: 1, day: 1 }, { unique: true })

const ProfileView = mongoose.model("ProfileView", ProfileViewSchema)

export default ProfileView

/** UTC calendar day key YYYY-MM-DD */
export function utcDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}
