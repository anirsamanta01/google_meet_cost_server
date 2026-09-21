import express from "express";
import {requireAdmin, requireAuth} from "../middleware/auth.js";
import {getAdminOverview, listUsers, updateUserRole} from "../controllers/adminController.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);
router.get("/overview", getAdminOverview);
router.get("/users", listUsers);
router.patch("/users/:id/role", updateUserRole);

export default router;
