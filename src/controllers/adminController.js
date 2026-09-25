import Meeting from "../models/meetingModel.js";
import User from "../models/userModel.js";
import httpError from "../utils/httpError.js";
import bcrypt from "bcryptjs";

const publicAdminUser = user => ({
  id: user.id || user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt,
});

const getAdminOverview = async (_req, res, next) => {
  try {
    const [userCount, meetingCount, users, meetings] = await Promise.all([
      User.countDocuments(),
      Meeting.countDocuments(),
      User.find().select("name email role createdAt").sort({createdAt: -1}).limit(5),
      Meeting.find().select("cost attendees peopleCount createdAt").lean(),
    ]);

    const totalCost = meetings.reduce((sum, meeting) => {
      return sum + (Number(String(meeting.cost || "$0").replace(/[^\d.]/g, "")) || 0);
    }, 0);
    const uniquePeople = new Set();
    meetings.forEach(meeting => {
      if (Array.isArray(meeting.attendees)) {
        meeting.attendees.forEach(attendee => uniquePeople.add(String(attendee).trim().toLowerCase()));
      }
    });

    res.json({
      stats: {
        users: userCount,
        meetings: meetingCount,
        totalCost: `$${totalCost.toFixed(2)}`,
        people: uniquePeople.size,
      },
      recentUsers: users.map(publicAdminUser),
    });
  } catch (error) {
    next(error);
  }
};

const listUsers = async (_req, res, next) => {
  try {
    const users = await User.find().sort({createdAt: -1});
    res.json({users: users.map(publicAdminUser)});
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const {name, email, phone, password} = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedPhone = typeof phone === 'string' ? phone.trim() : '';

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      throw httpError(400, 'Name must contain at least 2 characters');
    }
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      throw httpError(400, 'A valid email is required');
    }
    if (!/^\+?[\d\s().-]{7,20}$/.test(normalizedPhone)) {
      throw httpError(400, 'A valid phone number is required');
    }
    if (typeof password !== 'string' || password.length < 8) {
      throw httpError(400, 'Password must contain at least 8 characters');
    }
    if (await User.exists({email: normalizedEmail})) {
      throw httpError(409, 'An account with this email already exists');
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: await bcrypt.hash(password, 12),
      role: 'user',
    });
    res.status(201).json({user: publicAdminUser(user)});
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const {role} = req.body;
    if (!['user', 'admin'].includes(role)) {
      throw httpError(400, "Role must be user or admin");
    }
    if (req.params.id === req.user.sub) {
      throw httpError(400, "You cannot change your own role");
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {role},
      {new: true, runValidators: true},
    );
    if (!user) {
      throw httpError(404, "User not found");
    }

    res.json({user: publicAdminUser(user)});
  } catch (error) {
    next(error);
  }
};

const listAdminMeetings = async (_req, res, next) => {
  try {
    const meetings = await Meeting.find()
      .populate("userId", "name email")
      .sort({createdAt: -1});
    res.json({meetings});
  } catch (error) {
    next(error);
  }
};

const deleteAdminMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findByIdAndDelete(req.params.id);
    if (!meeting) {
      throw httpError(404, "Meeting not found");
    }
    res.json({message: "Meeting deleted successfully"});
  } catch (error) {
    next(error);
  }
};

export {
  createUser,
  deleteAdminMeeting,
  getAdminOverview,
  listAdminMeetings,
  listUsers,
  updateUserRole,
};
