import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema(
  {
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    order: {
      type: Number,
      required: true,
    },
    mastery: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
  },
  { timestamps: true },
);

topicSchema.index({ unitId: 1 });
topicSchema.index({ unitId: 1, order: 1 });

const Topic = mongoose.model('Topic', topicSchema);

export { Topic };
export default Topic;
