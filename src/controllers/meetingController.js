import Meeting from "../models/meetingModel.js";
import httpError from "../utils/httpError.js";

const serializeMeeting = (meeting) => {
  const serialized = meeting.toJSON ? meeting.toJSON() : meeting;
  const creator =
    serialized.userId && typeof serialized.userId === "object"
      ? serialized.userId
      : null;
  const creatorId = creator?.id || creator?._id?.toString?.();

  return {
    id: serialized.id || serialized._id?.toString(),
    userId: creatorId || serialized.userId,
    creator: creator
      ? {
          id: creatorId,
          name: creator.name,
          email: creator.email,
        }
      : null,
    title: serialized.title,
    date: serialized.date,
    time: serialized.time,
    duration: serialized.duration,
    meetingLink: serialized.meetingLink || '',
    attendees: serialized.attendees || [],
    cost: serialized.cost || "$0",
    peopleCount: Number(serialized.peopleCount || 0),
    createdAt: serialized.createdAt,
  };
};

const createMeeting = async (req, res, next) => {
  try {
    const { title, date, time, duration, meetingLink, attendees, cost } = req.body;

    if (!title || typeof title !== "string" || title.trim().length < 2) {
      throw httpError(400, "Meeting title is required");
    }

    const normalizedMeetingLink = String(meetingLink || '').trim();
    if (
      normalizedMeetingLink &&
      !/^https:\/\/meet\.google\.com\/[a-z]{3,}-[a-z]{4,}-[a-z]{3,}(?:[/?#].*)?$/i.test(
        normalizedMeetingLink,
      )
    ) {
      throw httpError(400, "Enter a valid Google Meet link");
    }

    const meeting = await Meeting.create({
      userId: req.user.sub,
      title: title.trim(),
      date: date || "Aug 25, 2026",
      time: time || "09:30 AM",
      duration: duration || "45 minutes",
      meetingLink: normalizedMeetingLink,
      attendees: Array.isArray(attendees) ? attendees : [],
      cost: cost || "$0",
      peopleCount: Array.isArray(attendees) ? attendees.length : 0,
    });

    res.status(201).json({ meeting: serializeMeeting(meeting) });
  } catch (error) {
    next(error);
  }
};

const listMeetings = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({ userId: req.user.sub })
      .populate("userId", "name email")
      .sort({createdAt: -1});
    res.json({ meetings: meetings.map(serializeMeeting) });
  } catch (error) {
    next(error);
  }
};

const getMeetingById = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      userId: req.user.sub,
    }).populate("userId", "name email");

    if (!meeting) {
      throw httpError(404, "Meeting not found");
    }

    res.json({ meeting: serializeMeeting(meeting) });
  } catch (error) {
    next(error);
  }
};

const deleteMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.sub,
    });

    if (!meeting) {
      throw httpError(404, "Meeting not found");
    }

    res.json({message: "Meeting deleted successfully"});
  } catch (error) {
    next(error);
  }
};

export { listMeetings, createMeeting, getMeetingById, deleteMeeting };
