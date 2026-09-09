import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
    },
    totalTopics: {
      type: Number,
      default: 0,
    },
    completedTopics: {
      type: Number,
      default: 0,
    },
    mastery: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

unitSchema.index({ subjectId: 1 });
unitSchema.index({ subjectId: 1, order: 1 });

const Unit = mongoose.model('Unit', unitSchema);

export { Unit };
export default Unit;
