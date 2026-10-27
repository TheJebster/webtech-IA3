import mongoose from 'mongoose';

// Audit trail of important actions — powers "recent activity" on the admin dashboard.
const activitySchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorName: { type: String, default: 'System' },
    action: { type: String, required: true }, // e.g. 'user.signup', 'equipment.create'
    entity: { type: String }, // 'user' | 'equipment' | 'rental'
    entityId: { type: mongoose.Schema.Types.ObjectId },
    message: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activitySchema.index({ createdAt: -1 });

export default mongoose.model('Activity', activitySchema);
