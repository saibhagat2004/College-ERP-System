import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const formatDate = (value) => {
	if (!value) return "N/A";
	return new Date(value).toLocaleString();
};

const AssignmentDetail = () => {
	const { assignmentId } = useParams();
	const [assignment, setAssignment] = useState(null);
	const [submissions, setSubmissions] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [submissionsLoading, setSubmissionsLoading] = useState(false);
	const [error, setError] = useState("");
	const [submissionsError, setSubmissionsError] = useState("");
	const [markInputs, setMarkInputs] = useState({});
	const [updatingSubmissionId, setUpdatingSubmissionId] = useState("");

	const maxMarks = Number(assignment?.totalMarks);
	const hasMaxMarks = Number.isFinite(maxMarks);

	const loadSubmissions = async () => {
		setSubmissionsLoading(true);
		setSubmissionsError("");

		try {
			const res = await fetch(`/api/submissions/assignment/${assignmentId}`, { credentials: "include" });
			const json = await res.json();
			if (!res.ok) throw new Error(json.error || "Failed to load submissions");

			setSubmissions(json);
			setMarkInputs(
				json.reduce((accumulator, submission) => {
					accumulator[submission._id] = submission.obtainedMarks ?? "";
					return accumulator;
				}, {}),
			);
		} catch (fetchError) {
			const message = fetchError.message || "Failed to load submissions";
			setSubmissionsError(message);
			toast.error(message);
		} finally {
			setSubmissionsLoading(false);
		}
	};

	const handleMarkChange = (submissionId, value) => {
		setMarkInputs((prev) => ({
			...prev,
			[submissionId]: value,
		}));
	};

	const handleMarkSubmit = async (submissionId) => {
		const rawValue = markInputs[submissionId];
		const marks = Number(rawValue);

		if (rawValue === "" || Number.isNaN(marks)) {
			toast.error("Enter valid marks before saving");
			return;
		}

		if (marks < 0) {
			toast.error("Marks cannot be negative");
			return;
		}

		if (hasMaxMarks && marks > maxMarks) {
			toast.error(`Marks cannot exceed ${maxMarks}`);
			return;
		}

		setUpdatingSubmissionId(submissionId);

		try {
			const res = await fetch(`/api/submissions/${submissionId}/marks`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ obtainedMarks: marks }),
			});

			const json = await res.json();
			if (!res.ok) throw new Error(json.error || "Failed to update marks");

			setSubmissions((prev) => prev.map((submission) => (submission._id === submissionId ? json : submission)));
			setMarkInputs((prev) => ({
				...prev,
				[submissionId]: json.obtainedMarks ?? marks,
			}));
			toast.success("Marks updated successfully");
		} catch (updateError) {
			toast.error(updateError.message || "Failed to update marks");
		} finally {
			setUpdatingSubmissionId("");
		}
	};

	useEffect(() => {
		const loadAssignment = async () => {
			setIsLoading(true);
			setError("");

			try {
				const res = await fetch(`/api/assignments/${assignmentId}`, { credentials: "include" });
				const json = await res.json();
				if (!res.ok) throw new Error(json.error || "Failed to load assignment details");
				setAssignment(json);
				if (json.assignmentType === "subjective") {
					await loadSubmissions();
				} else {
					setSubmissions([]);
					setSubmissionsError("");
					setMarkInputs({});
				}
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
						</div>

						{assignment.fileUrl && (
							<div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
								<p className="text-sm text-slate-500">Attachment</p>
								<a href={assignment.fileUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sky-700 underline">
									Open attached file
								</a>

								<div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
									<iframe
										src={assignment.fileUrl}
										title="Assignment attachment"
										className="w-full h-[600px]"
										/>
								</div>
							</div>
						)}
					</div>

					<div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
						{assignment.assignmentType === "mcq" ? (
							<>
								<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">MCQ data</p>
								<h2 className="mt-2 text-2xl font-bold text-slate-900">Question set</h2>

								{Array.isArray(assignment.mcqQuestions) && assignment.mcqQuestions.length > 0 ? (
									<div className="mt-5 space-y-4">
										{assignment.mcqQuestions.map((question, index) => (
											<div key={`${index}-${question.question}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
												<p className="font-semibold text-slate-900">{index + 1}. {question.question}</p>
												<div className="mt-3 grid gap-2 sm:grid-cols-2">
													{(question.options || []).map((option) => (
														<span key={option} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">{option}</span>
													))}
												</div>
												<p className="mt-3 text-sm text-slate-500">Correct answer: {question.correctAnswer || "N/A"}</p>
											</div>
										))}
									</div>
								) : (
									<div className="mt-5 rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-slate-500">
										No MCQ questions attached to this assignment.
									</div>
								)}
							</>
						) : (
							<>
								<div className="flex items-start justify-between gap-4">
									<div>
										<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Subjective grading</p>
										<h2 className="mt-2 text-2xl font-bold text-slate-900">Enter marks for each submission</h2>
									</div>
									{hasMaxMarks && (
										<span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
											Total marks: {maxMarks}
										</span>
									)}
								</div>

								{submissionsLoading ? (
									<div className="mt-5 rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-slate-500">
										Loading student submissions...
									</div>
								) : submissionsError ? (
									<div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-8 text-center text-rose-700">
										{submissionsError}
									</div>
								) : submissions.length > 0 ? (
									<div className="mt-5 space-y-4">
										{submissions.map((submission) => (
											<div key={submission._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
												<div className="flex flex-wrap items-start justify-between gap-3">
													<div>
														<p className="text-lg font-bold text-slate-900">{submission.studentId?.fullName || "Student"}</p>
														<p className="text-sm text-slate-500">{submission.studentId?.email || "No email"}</p>
														<p className="text-sm text-slate-500">User code: {submission.studentId?.userCode || "N/A"}</p>
													</div>
													<span className={`rounded-full px-3 py-1 text-xs font-semibold ${submission.status === "late" ? "bg-amber-100 text-amber-700" : submission.status === "evaluated" ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"}`}>
														{submission.status || "submitted"}
													</span>
												</div>

												<div className="mt-4 space-y-3 text-sm text-slate-600">
													<p>Submitted at: <span className="font-semibold text-slate-900">{formatDate(submission.submittedAt || submission.createdAt)}</span></p>
													{submission.submissionUrl && (
														<div>
															<p className="text-slate-500">File</p>
															<a href={submission.submissionUrl} target="_blank" rel="noreferrer" className="font-semibold text-sky-700 underline">
																Open uploaded file
															</a>
														</div>
													)}

													{submission.subjectiveAnswer && (
														<div className="rounded-2xl border border-slate-200 bg-white p-3">
															<p className="text-slate-500">Subjective answer</p>
															<p className="mt-1 whitespace-pre-wrap text-slate-900">{submission.subjectiveAnswer}</p>
														</div>
													)}

													<div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_auto] sm:items-end">
														<div>
															<label className="mb-2 block text-sm font-medium text-slate-700" htmlFor={`marks-${submission._id}`}>
																Marks {hasMaxMarks ? `(0 - ${maxMarks})` : "(0 or more)"}
															</label>
															<input
																id={`marks-${submission._id}`}
																type="number"
																min="0"
																max={hasMaxMarks ? maxMarks : undefined}
																step="1"
																value={markInputs[submission._id]}
																onChange={(event) => handleMarkChange(submission._id, event.target.value)}
																className="w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-sky-400"
															/>
														</div>
														<button
															type="button"
															onClick={() => handleMarkSubmit(submission._id)}
															disabled={updatingSubmissionId === submission._id}
															className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
														>
															{updatingSubmissionId === submission._id ? "Saving..." : "Save marks"}
														</button>
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="mt-5 rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-slate-500">
										No subjective submissions yet.
									</div>
								)}
							</>
						)}
					</div>
				</section>

				<div className="flex flex-wrap gap-3">
					<Link to="/teacher/classroom" className="inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-white">
						Back to classroom
					</Link>
					<Link to={`/teacher/assignments/${assignmentId}/submissions`} className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700">
						View submissions
					</Link>
				</div>
			</div>
		</div>
	);
};

export default AssignmentDetail;