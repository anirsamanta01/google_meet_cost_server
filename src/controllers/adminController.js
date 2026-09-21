import Meeting from "../models/meetingModel.js";
import User from "../models/userModel.js";
import httpError from "../utils/httpError.js";

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

const updateUserRole = async (req, res, next) => {
  try {
    const {role} = req.body;
    if (!['user', 'admin'].includes(role)) {
      throw httpError(400, "Role must be user or admin");
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

export {getAdminOverview, listUsers, updateUserRole};
