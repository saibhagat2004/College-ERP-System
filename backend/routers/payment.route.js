import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { createFeeOrder, verifyFeePayment } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-order", protectRoute, authorizeRoles("student"), createFeeOrder);
router.post("/verify", protectRoute, authorizeRoles("student"), verifyFeePayment);

export default router;