import mongoose from "mongoose"

/** Singleton site settings (`_id: "global"`). Feature flags live in `features` (booleans). */
const SiteSettingsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "global" },
    features: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
)

const SiteSettings = mongoose.model("SiteSettings", SiteSettingsSchema)

export default SiteSettings
