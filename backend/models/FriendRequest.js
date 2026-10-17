import mongoose from "mongoose"

const Schema = mongoose.Schema

const FRIEND_REQUEST_STATUSES = ["pending", "accepted", "declined", "cancelled"]

const FriendRequestSchema = new Schema(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    to: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: FRIEND_REQUEST_STATUSES,
      required: true,
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
)

/** At most one pending request per directed pair. */
FriendRequestSchema.index(
  { from: 1, to: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
)

FriendRequestSchema.index({ to: 1, status: 1, createdAt: -1 })
FriendRequestSchema.index({ from: 1, status: 1, createdAt: -1 })

const FriendRequest = mongoose.model("FriendRequest", FriendRequestSchema)

export default FriendRequest
export { FRIEND_REQUEST_STATUSES }
