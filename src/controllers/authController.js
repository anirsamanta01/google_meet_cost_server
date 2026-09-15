import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import httpError from '../utils/httpError.js';

// This function prepares the user object that you are safe to send to the frontend.
const publicUser = (user) => {
// Convert Mongoose user to normal object
  const serializedUser = user.toJSON ? user.toJSON() : user;
  return {
    id: serializedUser.id || serializedUser._id.toString(),
    name: serializedUser.name,
    email: serializedUser.email,
    phone: serializedUser.phone,
    role: serializedUser.role || 'user',
    createdAt: serializedUser.createdAt
  };
};

const createToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role || 'user'
    },
    process.env.JWT_SECRET || 'development-secret',
    { expiresIn: '7d' }
  );
};

const signup = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
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
    if (await User.exists({ email: normalizedEmail })) {
      throw httpError(409, 'An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
    });
    res.status(201).json({ user: publicUser(user), token: createToken(user) });
  } catch (error) {
    next(error);
  }
};

const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user || typeof password !== 'string' || !(await bcrypt.compare(password, user.password))) {
      throw httpError(401, 'Invalid email or password');
    }

    res.json({ user: publicUser(user), token: createToken(user) });
  } catch (error) {
    next(error);
  }
};

export { signup, signin };
