import express from "express";
import {requireAdmin, requireAuth} from "../middleware/auth.js";
import {
	deleteAdminMeeting,
	getAdminOverview,
	listAdminMeetings,
	listUsers,
	updateUserRole,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);
router.get("/overview", getAdminOverview);
router.get("/users", listUsers);
router.patch("/users/:id/role", updateUserRole);
router.get("/meetings", listAdminMeetings);
router.delete("/meetings/:id", deleteAdminMeeting);

export default router;
