import mongoose from 'mongoose';

export const CATEGORIES = [
  'Audio',
  'Lighting',
  'Staging',
  'Furniture',
  'Tents & Canopies',
  'Video & Projection',
  'Power',
  'Decor',
];

export const CONDITIONS = ['New', 'Excellent', 'Good', 'Fair'];

const equipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
    category: { type: String, required: [true, 'Category is required'], enum: CATEGORIES },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    features: { type: [String], default: [] },
    dailyRate: { type: Number, required: [true, 'Daily rate is required'], min: [1, 'Daily rate must be positive'] },
    quantityTotal: { type: Number, required: true, min: [0, 'Quantity cannot be negative'], default: 1 },
    condition: { type: String, enum: CONDITIONS, default: 'Good' },
    imageUrl: { type: String, trim: true, default: '' },
    // Inactive equipment is hidden from customers but kept for history
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

equipmentSchema.index({ name: 'text', description: 'text' });
equipmentSchema.index({ category: 1, isActive: 1 });

equipmentSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Equipment', equipmentSchema);
