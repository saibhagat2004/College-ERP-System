export const generateCashfreeOrderId = (studentId) => {
	const normalizedStudentId = String(studentId || "student").replace(/[^a-zA-Z0-9_-]/g, "");
	const shortStudentId = normalizedStudentId.slice(-6) || "student";
	const timestamp = Date.now().toString();
	return `fee_${shortStudentId}_${timestamp}`;
};

export default generateCashfreeOrderId;