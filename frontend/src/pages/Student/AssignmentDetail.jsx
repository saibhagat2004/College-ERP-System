import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const formatDate = (value) => {
	if (!value) return "N/A";
	return new Date(value).toLocaleString();
};

const AssignmentDetail = () => {
	const { assignmentId } = useParams();
	const [assignment, setAssignment] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [subjectiveAnswer, setSubjectiveAnswer] = useState("");
	const [selectedMcqAnswers, setSelectedMcqAnswers] = useState({});
	const mcqQuestions = useMemo(() => (Array.isArray(assignment?.mcqQuestions) ? assignment.mcqQuestions : []), [assignment]);

	const handleFileChange = (event) => {
		setSelectedFile(event.target.files?.[0] || null);
	};

	const handleMcqChange = (questionIndex, answer) => {
		setSelectedMcqAnswers((current) => ({
			...current,
			[questionIndex]: answer,
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!assignment) return;

		const payload = new FormData();

		if (selectedFile) {
			payload.append("submissionFile", selectedFile);
		}

		if (assignment.assignmentType === "mcq") {
			const answers = mcqQuestions.map((question, index) => ({
				question: question.question,
				selectedAnswer: selectedMcqAnswers[index] || "",
			}));

			if (answers.length === 0) {
				toast.error("This MCQ assignment has no questions to submit");
				return;
			}

			if (answers.some((answer) => !answer.selectedAnswer)) {
				toast.error("Select an answer for every MCQ question");
				return;
			}

			payload.append("mcqAnswers", JSON.stringify(answers));
		} else if (subjectiveAnswer.trim()) {
			payload.append("subjectiveAnswer", subjectiveAnswer.trim());
		}

		if (!selectedFile && assignment.assignmentType !== "mcq" && !subjectiveAnswer.trim()) {
			toast.error("Add a document or write an answer before submitting");
			return;
		}

		setIsSubmitting(true);
		try {
			const res = await fetch(`/api/submissions/assignment/${assignmentId}`, {
				method: "POST",
				credentials: "include",
				body: payload,
			});

			const json = await res.json();
			if (!res.ok) throw new Error(json.error || "Failed to submit assignment");

			toast.success("Assignment submitted");
			setSubjectiveAnswer("");
			setSelectedFile(null);
			setSelectedMcqAnswers({});
		} catch (submitError) {
			toast.error(submitError.message || "Failed to submit assignment");
		} finally {
			setIsSubmitting(false);
		}
	};

	useEffect(() => {
		const loadAssignment = async () => {
			setIsLoading(true);
			setError("");

			try {
				const res = await fetch(`/api/assignments/${assignmentId}`, {
					credentials: "include",
				});

				const json = await res.json();
				if (!res.ok) throw new Error(json.error || "Failed to load assignment details");

				setAssignment(json);
			} catch (fetchError) {
				const message = fetchError.message || "Failed to load assignment details";
				setError(message);
				toast.error(message);
			} finally {
				setIsLoading(false);
			}
		};

		loadAssignment();
	}, [assignmentId]);

	if (isLoading) {
		return (
			<div className="min-h-[60vh] px-4 py-10 md:px-8">
				<div className="mx-auto flex max-w-4xl items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-16 shadow-sm">
					<p className="text-slate-600">Loading assignment details...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-[60vh] px-4 py-10 md:px-8">
				<div className="mx-auto max-w-4xl rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-rose-700 shadow-sm">
					<h1 className="text-2xl font-semibold">Assignment unavailable</h1>
					<p className="mt-2">{error}</p>
				</div>
			</div>
		);
	}

	if (!assignment) return null;

	const classInfo = assignment.classId;
	const teacher = assignment.teacherId;
	const isSubmitted = Boolean(assignment.isSubmitted);
	const submissionStatus = assignment.submissionStatus || assignment.mySubmission?.status || null;

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 md:px-8">
			<div className="mx-auto max-w-6xl space-y-6">
				<section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-900/10">
					<div className="p-6 sm:p-8 lg:p-10">
						<p className="text-sm uppercase tracking-[0.3em] text-slate-400">Assignment details</p>
						<h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{assignment.title}</h1>
						<p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">{assignment.description || "No description provided."}</p>
						<div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
							<span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Type: {assignment.assignmentType}</span>
							<span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Due: {formatDate(assignment.dueDate)}</span>
							<span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Marks: {assignment.totalMarks ?? "N/A"}</span>
							<span className={`rounded-full border px-3 py-1 ${isSubmitted ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200" : "border-white/15 bg-white/5 text-slate-300"}`}>
								{isSubmitted ? `Submitted${submissionStatus ? ` (${submissionStatus})` : ""}` : "Not submitted"}
							</span>
						</div>
					</div>
				</section>

				<section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
					<div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
						<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Class</p>
						<h2 className="mt-2 text-2xl font-bold text-slate-900">{classInfo?.className || "Unknown class"}</h2>
						<p className="mt-1 text-slate-500">Section {classInfo?.section || "N/A"}</p>

						<div className="mt-6 rounded-3xl bg-slate-50 p-4">
							<p className="text-sm text-slate-500">Teacher</p>
							<p className="mt-1 text-lg font-semibold text-slate-900">{teacher?.fullName || "N/A"}</p>
							<p className="text-sm text-slate-500">{teacher?.email || ""}</p>
							<p className="text-sm text-slate-500">User code: {teacher?.userCode || "N/A"}</p>

							<div>

				</div>
						</div>

						{assignment.fileUrl && (
							<div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
								<p className="text-sm text-slate-500">Attachment</p>
								<a href={assignment.fileUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sky-700 underline">
									Open attached file
								</a>
							</div>
						)}
					</div>

					<div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
						<form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Submit assignment</p>
								<h3 className="mt-1 text-xl font-bold text-slate-900">
									{assignment.assignmentType === "mcq" ? "Select your answers" : "Upload document and answer"}
								</h3>
							</div>

							{assignment.assignmentType !== "mcq" && (
								<label className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 transition hover:border-slate-900 hover:bg-slate-50">
									<span className="text-sm font-semibold text-slate-900">Select a document or image</span>
									<span className="text-sm text-slate-500">PDF, DOC, DOCX, TXT, JPG, PNG, PPT, PPTX</span>
									<span className="text-sm text-slate-700">{selectedFile ? selectedFile.name : "No file selected"}</span>
									<input type="file" accept="image/*,.pdf,.doc,.docx,.txt,.ppt,.pptx" onChange={handleFileChange} className="hidden" />
								</label>
							)}

							{assignment.assignmentType === "mcq" ? (
								<div className="space-y-3">
									{mcqQuestions.map((question, index) => (
										<div key={`${index}-${question.question}`} className="rounded-2xl border border-slate-200 bg-white p-4">
											<p className="font-semibold text-slate-900">{index + 1}. {question.question}</p>
											<div className="mt-3 grid gap-2">
												{(question.options || []).map((option) => (
													<label key={option} className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200 transition hover:ring-slate-400">
														<input type="radio" name={`question-${index}`} value={option} checked={selectedMcqAnswers[index] === option} onChange={() => handleMcqChange(index, option)} />
														<span>{option}</span>
													</label>
												))}
											</div>
										</div>
									))}
								</div>
							) : (
								<textarea
									value={subjectiveAnswer}
									onChange={(event) => setSubjectiveAnswer(event.target.value)}
									placeholder="Write your answer here"
									rows="6"
									className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
								/>
							)}

							<button type="submit" disabled={isSubmitting} className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70">
								{isSubmitting ? "Submitting..." : "Submit assignment"}
							</button>
							{isSubmitted && (
								<p className="text-sm font-medium text-emerald-700">You have already submitted this assignment.</p>
							)}
						</form>
					</div>
				</section>

				<div>
					<Link to="/student/classroom" className="inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-white">
						Back to classroom
					</Link>
				</div>
			</div>
		</div>
	);
};

export default AssignmentDetail;