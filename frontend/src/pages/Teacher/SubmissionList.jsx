import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const formatDate = (value) => {
	if (!value) return "N/A";
	return new Date(value).toLocaleString();
};

const SubmissionList = () => {
	const { assignmentId } = useParams();
	const [assignment, setAssignment] = useState(null);
	const [submissions, setSubmissions] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadSubmissions = async () => {
			setIsLoading(true);
			setError("");

			try {
				const [assignmentRes, submissionsRes] = await Promise.all([
					fetch(`/api/assignments/${assignmentId}`, { credentials: "include" }),
					fetch(`/api/submissions/assignment/${assignmentId}`, { credentials: "include" }),
				]);

				const assignmentJson = await assignmentRes.json();
				if (!assignmentRes.ok) throw new Error(assignmentJson.error || "Failed to load assignment");

				const submissionsJson = await submissionsRes.json();
				if (!submissionsRes.ok) throw new Error(submissionsJson.error || "Failed to load submissions");

				setAssignment(assignmentJson);
				setSubmissions(submissionsJson);
			} catch (fetchError) {
				const message = fetchError.message || "Failed to load submissions";
				setError(message);
				toast.error(message);
			} finally {
				setIsLoading(false);
			}
		};

		loadSubmissions();
	}, [assignmentId]);

	if (isLoading) {
		return (
			<div className="min-h-[60vh] px-4 py-10 md:px-8">
				<div className="mx-auto flex max-w-5xl items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-16 shadow-sm">
					<p className="text-slate-600">Loading student submissions...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-[60vh] px-4 py-10 md:px-8">
				<div className="mx-auto max-w-5xl rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-rose-700 shadow-sm">
					<h1 className="text-2xl font-semibold">Submissions unavailable</h1>
					<p className="mt-2">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 md:px-8">
			<div className="mx-auto max-w-6xl space-y-6">
				<section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-900/10">
					<div className="p-6 sm:p-8 lg:p-10">
						<p className="text-sm uppercase tracking-[0.3em] text-slate-400">Teacher submissions</p>
						<h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Student submissions</h1>
						<p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
							Review uploaded files, subjective answers, and MCQ responses for this assignment.
						</p>
					</div>
				</section>

				<section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
					<div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
						<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Assignment</p>
						<h2 className="mt-2 text-2xl font-bold text-slate-900">{assignment?.title || "Assignment"}</h2>
						<p className="mt-2 text-slate-500">{assignment?.description || "No description provided."}</p>
						<div className="mt-6 space-y-2 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
							<p>Type: <span className="font-semibold text-slate-900">{assignment?.assignmentType || "N/A"}</span></p>
							<p>Due: <span className="font-semibold text-slate-900">{formatDate(assignment?.dueDate)}</span></p>
							<p>Marks: <span className="font-semibold text-slate-900">{assignment?.totalMarks ?? "N/A"}</span></p>
							<p>Submissions: <span className="font-semibold text-slate-900">{submissions.length}</span></p>
						</div>
						<div className="mt-6">
							<Link to={`/teacher/assignments/${assignmentId}`} className="inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
								Back to assignment
							</Link>
						</div>
					</div>

					<div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
						<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Submissions</p>
						<h2 className="mt-2 text-2xl font-bold text-slate-900">Student work</h2>

						<div className="mt-5 space-y-4">
							{submissions.length > 0 ? (
								submissions.map((submission) => (
									<div key={submission._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
										<div className="flex flex-wrap items-start justify-between gap-3">
											<div>
												<p className="text-lg font-bold text-slate-900">{submission.studentId?.fullName || "Student"}</p>
												<p className="text-sm text-slate-500">{submission.studentId?.email || "No email"}</p>
												<p className="text-sm text-slate-500">User code: {submission.studentId?.userCode || "N/A"}</p>
											</div>
											<span className={`rounded-full px-3 py-1 text-xs font-semibold ${submission.status === "late" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
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

											{Array.isArray(submission.mcqAnswers) && submission.mcqAnswers.length > 0 && (
												<div className="space-y-2">
													<p className="text-slate-500">MCQ answers</p>
													{submission.mcqAnswers.map((answer, index) => (
														<div key={`${submission._id}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-3">
															<p className="font-medium text-slate-900">{answer.question || `Question ${index + 1}`}</p>
															<p className="text-slate-600">Selected: {answer.selectedAnswer || "N/A"}</p>
														</div>
													))}
												</div>
											)}
										</div>
									</div>
								))
							) : (
								<div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-slate-500">
									No student submissions yet.
								</div>
							)}
						</div>
					</div>
				</section>
			</div>
		</div>
	);
};

export default SubmissionList;