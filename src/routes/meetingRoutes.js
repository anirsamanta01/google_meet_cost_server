import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
	createMeeting,
	deleteMeeting,
	listAttendees,
	getMeetingById,
	listMeetings,
} from '../controllers/meetingController.js';

const router = express.Router();

router.use(requireAuth);
router.get('/attendees', listAttendees);
router.post('/create-meeting', createMeeting);
router.get('/list-meetings', listMeetings);
router.get('/view-meeting/:id', getMeetingById);
router.delete('/delete-meeting/:id', deleteMeeting);

export default router;
