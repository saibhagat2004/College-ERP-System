import { Cashfree, CFEnvironment } from "cashfree-pg";
import User from "../models/user.model.js";
import { generateCashfreeOrderId } from "../utils/generateOrderId.js";

const apiVersion = "2025-01-01";

const getCashfreeClient = () => {
	const clientId = process.env.CASHFREE_CLIENT_ID;
	const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
	const cashfreeEnv = (process.env.CASHFREE_ENV || process.env.NODE_ENV || "development").toLowerCase();
	const environment = cashfreeEnv === "production" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

	if (!clientId || !clientSecret) {
		throw new Error("Cashfree client configuration is missing");
	}

	const cashfree = new Cashfree(environment, clientId, clientSecret);
	cashfree.XApiVersion = apiVersion;
	return cashfree;
};

const getStudentPhone = (student) => {
	const possiblePhone = student?.phone || student?.mobileNumber || student?.contactNumber || student?.rollNo || "";
	const digitsOnly = String(possiblePhone).replace(/\D/g, "");
	if (digitsOnly.length === 10) {
		return digitsOnly;
	}
	return "9999999999";
};

const buildFeeSnapshot = (student, classDoc) => {
	const tuitionFees = Number(classDoc?.feesStructure?.tuitionFees) || 0;
	const classDevelopmentFees = Number(classDoc?.feesStructure?.developmentFees) || 0;
	const developmentFees = student.gender === "female" ? 0 : classDevelopmentFees;
	const totalFees = tuitionFees + developmentFees;
	const paidAmount = Number(student.fees?.paidAmount) || 0;
	const remainingAmount = Math.max(totalFees - paidAmount, 0);

	return {
		tuitionFees,
		developmentFees,
		totalFees,
		paidAmount,
		remainingAmount,
		paymentStatus: remainingAmount <= 0 ? "paid" : paidAmount > 0 ? "partial" : "pending",
	};
};

const normalizePaymentAmount = (value) => {
	const amount = Number(value);
	if (!Number.isFinite(amount)) {
		return 0;
	}

	return Math.round(amount * 100) / 100;
};

export const createFeeOrder = async (req, res) => {
	try {
		if (req.user.role !== "student") {
			return res.status(403).json({ error: "Only students can create fee payments" });
		}

		const student = await User.findById(req.user._id).populate("classId", "className section feesStructure");
		if (!student) {
			return res.status(404).json({ error: "Student not found" });
		}

		if (!student.classId) {
			return res.status(400).json({ error: "Student is not assigned to a class" });
		}

		const feeSnapshot = buildFeeSnapshot(student, student.classId);
		if (feeSnapshot.remainingAmount <= 0) {
			return res.status(400).json({ error: "No pending fees to pay" });
		}

		const requestedAmount = normalizePaymentAmount(req.body?.amount);
		const orderAmount = requestedAmount > 0 ? requestedAmount : feeSnapshot.remainingAmount;

		if (orderAmount <= 0) {
			return res.status(400).json({ error: "Payment amount must be greater than zero" });
		}

		if (orderAmount > feeSnapshot.remainingAmount) {
			return res.status(400).json({ error: "Payment amount cannot exceed the remaining fees" });
		}

		const orderId = generateCashfreeOrderId(student._id);
		const frontendUrl = process.env.FRONTEND_URL || "";
		const request = {
			order_id: orderId,
			order_amount: orderAmount,
			order_currency: "INR",
			customer_details: {
				customer_id: student.userCode || student._id.toString(),
				customer_name: student.fullName || student.username || "Student",
				customer_email: student.email,
				customer_phone: getStudentPhone(student),
			},
			order_meta: {
				return_url: frontendUrl
					? `${frontendUrl.replace(/\/$/, "")}/student/fees?order_id=${orderId}`
					: undefined,
			},
			order_tags: {
				student_id: student._id.toString(),
				class_id: student.classId._id.toString(),
				purpose: "college_fees",
				payment_amount: String(orderAmount),
			},
		};

		if (!request.order_meta.return_url) {
			delete request.order_meta;
		}

		const cashfree = getCashfreeClient();
		const response = await cashfree.PGCreateOrder(request);
		const orderData = response?.data || response?.Data || response;

		return res.status(200).json({
			message: "Fee order created successfully",
			orderId,
			paymentSessionId: orderData?.payment_session_id,
			amount: orderAmount,
			currency: "INR",
		});
	} catch (error) {
		console.error("Error creating fee order:", error?.response?.data || error.message);
		return res.status(500).json({
			error: "Failed to create payment order",
			details: error?.response?.data || error.message,
		});
	}
};

export const verifyFeePayment = async (req, res) => {
	try {
		if (req.user.role !== "student") {
			return res.status(403).json({ error: "Only students can verify fee payments" });
		}

		const { orderId } = req.body;
		if (!orderId) {
			return res.status(400).json({ error: "orderId is required" });
		}

		const student = await User.findById(req.user._id).populate("classId", "className section feesStructure");
		if (!student) {
			return res.status(404).json({ error: "Student not found" });
		}

		const cashfree = getCashfreeClient();
		const orderResponse = await cashfree.PGFetchOrder(orderId);
		const orderData = orderResponse?.data || orderResponse?.Data || orderResponse;
		const orderStatus = orderData?.order_status;
		const feeSnapshot = buildFeeSnapshot(student, student.classId);
		const paidChunk = normalizePaymentAmount(orderData?.order_amount);

		if (orderStatus === "PAID") {
			const nextPaidAmount = Math.min(feeSnapshot.paidAmount + paidChunk, feeSnapshot.totalFees);
			const nextRemainingAmount = Math.max(feeSnapshot.totalFees - nextPaidAmount, 0);
			feeSnapshot.paidAmount = nextPaidAmount;
			feeSnapshot.remainingAmount = nextRemainingAmount;
			feeSnapshot.paymentStatus = nextRemainingAmount <= 0 ? "paid" : "partial";
			await User.findByIdAndUpdate(student._id, {
				fees: feeSnapshot,
			});
			return res.status(200).json({
				message: "Payment verified successfully",
				orderId,
				orderStatus,
				paidAmount: paidChunk,
				fees: feeSnapshot,
			});
		}

		if (feeSnapshot.paidAmount > 0 && feeSnapshot.remainingAmount > 0) {
			await User.findByIdAndUpdate(student._id, {
				fees: {
					...feeSnapshot,
					paymentStatus: "partial",
				},
			});
			return res.status(200).json({
				message: "Payment is partially completed",
				orderId,
				orderStatus,
				fees: {
					...feeSnapshot,
					paymentStatus: "partial",
				},
			});
		}

		return res.status(200).json({
			message: "Payment is not completed yet",
			orderId,
			orderStatus,
			fees: feeSnapshot,
		});
	} catch (error) {
		console.error("Error verifying fee payment:", error?.response?.data || error.message);
		return res.status(500).json({
			error: "Failed to verify payment",
			details: error?.response?.data || error.message,
		});
	}
};