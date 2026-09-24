import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
    },
    date: {
      type: String,
      required: [true, 'Meeting date is required'],
      trim: true,
    },
    time: {
      type: String,
      default: '09:30 AM',
      trim: true,
    },
    duration: {
      type: String,
      default: '45 minutes',
      trim: true,
    },
    meetingLink: {
      type: String,
      default: '',
      trim: true,
    },
    attendees: {
      type: [String],
      default: [],
    },
    cost: {
      type: String,
      default: '$0',
    },
    peopleCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
//Convert MongoDB data to JSON
meetingSchema.set('toJSON', {
  transform: (_document, returnedMeeting) => {
    returnedMeeting.id = returnedMeeting._id.toString();
    delete returnedMeeting._id;
    return returnedMeeting;
  },
});

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
