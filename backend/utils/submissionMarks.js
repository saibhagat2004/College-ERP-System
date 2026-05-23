export const calculateMcqMarks = (assignmentQuestions = [], studentAnswers = []) => {
	if (!Array.isArray(assignmentQuestions) || !Array.isArray(studentAnswers)) {
		return 0;
	}

	return assignmentQuestions.reduce((totalMarks, question, index) => {
		const expectedAnswer = (question?.correctAnswer || "").trim();
		const selectedAnswer = (studentAnswers[index]?.selectedAnswer || "").trim();

		if (!expectedAnswer || !selectedAnswer) {
			return totalMarks;
		}

		return totalMarks + (expectedAnswer === selectedAnswer ? 1 : 0);
	}, 0);
};

export const updateSubmissionMarks = async (submission, obtainedMarks, feedback = "") => {
	submission.obtainedMarks = obtainedMarks;
	submission.feedback = feedback?.trim() || "";
	submission.status = "evaluated";

	await submission.save();

	return submission;
};