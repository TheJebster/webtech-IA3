import mongoose from 'mongoose';

export const RENTAL_STATUSES = ['pending', 'approved', 'rejected', 'cancelled', 'returned'];
// Rentals in these states hold stock for their date range
export const RESERVING_STATUSES = ['pending', 'approved'];

const rentalItemSchema = new mongoose.Schema(
  {
    equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    // Snapshots keep the rental readable even if the equipment is later edited or deleted
    name: { type: String, required: true },
    category: { type: String },
    imageUrl: { type: String, default: '' },
    dailyRate: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const rentalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    eventName: { type: String, required: true, trim: true, maxlength: 100 },
    venue: { type: String, required: true, trim: true, maxlength: 200 },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number, required: true, min: 1 },
    items: {
      type: [rentalItemSchema],
      validate: [(v) => v.length > 0, 'A rental needs at least one item'],
    },
    totalCost: { type: Number, required: true, min: 0 },
    status: { type: String, enum: RENTAL_STATUSES, default: 'pending' },
    adminNote: { type: String, trim: true, maxlength: 300, default: '' },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    decidedAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// Short human-friendly reference, e.g. RK-3F9A2C
rentalSchema.virtual('code').get(function () {
  return `RK-${this._id.toString().slice(-6).toUpperCase()}`;
});

rentalSchema.index({ status: 1, startDate: 1, endDate: 1 });
rentalSchema.index({ user: 1, createdAt: -1 });
rentalSchema.index({ 'items.equipment': 1 });

rentalSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    delete ret.__v;
    delete ret.id;
    return ret;
  },
});

export default mongoose.model('Rental', rentalSchema);
