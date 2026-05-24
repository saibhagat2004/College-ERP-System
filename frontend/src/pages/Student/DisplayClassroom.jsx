import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const getInitials = (name = "") =>
	name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");

const DisplayClassroom = ({ authUser }) => {
	const [classData, setClassData] = useState(null);
	const [assignments, setAssignments] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
	const [error, setError] = useState("");

	const [notices, setNotices] = useState([]);
	const [isLoadingNotices, setIsLoadingNotices] = useState(false);

	const formatDueDate = (value) => {
		if (!value) return "No due date";
		return new Date(value).toLocaleString();
	};

	useEffect(() => {
		if (!authUser) return;
		if (!authUser?.classId) {
			setError("No classroom is assigned to your account yet.");
			return;
		}

		const loadClassroom = async () => {
			setIsLoading(true);
			setError("");

			try {
				const res = await fetch("/api/classes/my-class", {
					credentials: "include",
				});

				const response = await res.json();
				if (!res.ok) {
					throw new Error(response.error || "Failed to load classroom details");
				}

				setClassData(response);
			} catch (fetchError) {
				const message = fetchError.message || "Failed to load classroom details";
				setError(message);
				toast.error(message);
			} finally {
				setIsLoading(false);
			}
		};

		loadClassroom();
	}, [authUser?.classId]);

	useEffect(() => {
		if (!authUser) return;
		if (!authUser?.classId) return;

		const loadAssignments = async () => {
			setIsLoadingAssignments(true);
			try {
				const res = await fetch("/api/assignments/my-assignments", {
					credentials: "include",
				});

				const response = await res.json();
				if (!res.ok) {
					throw new Error(response.error || "Failed to load assignments");
				}

				setAssignments(response);
			} catch (fetchError) {
				toast.error(fetchError.message || "Failed to load assignments");
			} finally {
				setIsLoadingAssignments(false);
			}
		};

		loadAssignments();
	}, [authUser?.classId]);

	useEffect(() => {
		if (!classData?._id) return;

		const loadNotices = async () => {
			setIsLoadingNotices(true);
			try {
				const res = await fetch(`/api/notice?classId=${classData._id}`, { credentials: "include" });
				const json = await res.json();
				if (!res.ok) throw new Error(json.error || "Failed to load notices");
				setNotices(json || []);
			} catch (err) {
				toast.error(err.message || "Failed to load notices");
			} finally {
				setIsLoadingNotices(false);
			}
		};

		loadNotices();
	}, [classData?._id]);

	if (isLoading) {
		return (
			<div className="min-h-[60vh] px-4 py-10 md:px-8">
				<div className="mx-auto flex max-w-6xl items-center justify-center rounded-3xl border border-slate-200 bg-white/80 px-6 py-16 shadow-sm backdrop-blur">
					<p className="text-slate-600">Loading your classroom...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-[60vh] px-4 py-10 md:px-8">
				<div className="mx-auto max-w-4xl rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-rose-700 shadow-sm">
					<h1 className="text-2xl font-semibold">Classroom unavailable</h1>
					<p className="mt-2">{error}</p>
				</div>
			</div>
		);
	}

	if (!classData) {
		return null;
	}

	const teacher = classData.teacherId;
	const subjects = Array.isArray(teacher?.subjects) ? teacher.subjects.filter(Boolean) : [];
	const students = Array.isArray(classData.students) ? classData.students : [];

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.06),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 md:px-8">
			<div className="mx-auto flex max-w-7xl flex-col gap-6">
				<section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-900/10">
					<div className="grid gap-0 lg:grid-cols-[1.4fr_0.9fr]">
						<div className="relative p-6 sm:p-8 lg:p-10">
							<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_28%)]" />
							<div className="relative flex flex-col gap-6">
								<div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
									<span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Student classroom</span>
									<span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">{authUser?.role}</span>
								</div>

								<div>
									<p className="text-sm uppercase tracking-[0.3em] text-slate-400">Your assigned class</p>
									<h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
										{classData.className}
									</h1>
									<p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
										You are enrolled in section <span className="font-semibold text-white">{classData.section}</span>. This page shows the full classroom profile, the teacher assigned to you, and every student currently in the class.
									</p>
								</div>

								<div className="grid gap-4 sm:grid-cols-3">
									<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
										<p className="text-sm text-slate-400">Class section</p>
										<p className="mt-2 text-2xl font-bold">{classData.section}</p>
									</div>
									<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
										<p className="text-sm text-slate-400">Students</p>
										<p className="mt-2 text-2xl font-bold">{students.length}</p>
									</div>
									<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
										<p className="text-sm text-slate-400">Teacher subjects</p>
										<p className="mt-2 text-2xl font-bold">{subjects.length || 0}</p>
									</div>
								</div>
							</div>
						</div>

						<div className="border-t border-white/10 bg-white/5 p-6 sm:p-8 lg:border-l lg:border-t-0">
							<p className="text-sm uppercase tracking-[0.3em] text-slate-400">Logged in as</p>
							<div className="mt-4 flex items-center gap-4">
								<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-xl font-black text-white">
									{getInitials(authUser?.fullName || authUser?.username || "Student")}
								</div>
								<div>
									<p className="text-lg font-semibold text-white">{authUser?.fullName || authUser?.username}</p>
									<p className="text-sm text-slate-300">{authUser?.email}</p>
									<p className="text-sm text-slate-300">User code: {authUser?.userCode || "N/A"}</p>
								</div>
							</div>

							<div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
								Your classroom details are loaded from your `classId` reference, so this view always matches the class assigned in your user record.
							</div>

							<div className="mt-4">
								<Link
									to="/student/fees"
									className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
								>
									Pay Fees
								</Link>
								<Link
									to="/student/study-materials"
									className="ml-3 inline-flex items-center justify-center rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
								>
									Study Materials
								</Link>
							</div>
						</div>
					</div>
				</section>

				<section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
					<div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Teacher</p>
								<h2 className="mt-2 text-2xl font-bold text-slate-900">Class teacher profile</h2>
							</div>
							<div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
								{teacher?.role || "teacher"}
							</div>
						</div>

						<div className="mt-6 flex items-center gap-4 rounded-3xl bg-slate-50 p-4">
							<div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-slate-900 text-white">
								{teacher?.profilePicture ? (
									<img src={teacher.profilePicture} alt={teacher?.fullName || "Teacher"} className="h-full w-full object-cover" />
								) : (
									<span className="text-xl font-black">{getInitials(teacher?.fullName || "Teacher")}</span>
								)}
							</div>
							<div>
								<p className="text-xl font-semibold text-slate-900">{teacher?.fullName || "Teacher not assigned"}</p>
								<p className="text-sm text-slate-500">{teacher?.email || "No email available"}</p>
								<p className="text-sm text-slate-500">User code: {teacher?.userCode || "N/A"}</p>
							</div>
						</div>

						<div className="mt-6">
							<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Subjects</p>
							<div className="mt-3 flex flex-wrap gap-2">
								{subjects.length > 0 ? (
									subjects.map((subject) => (
										<span key={subject} className="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-medium text-white">
											{subject}
										</span>
									))
								) : (
									<p className="text-sm text-slate-500">No subjects assigned to this teacher.</p>
								)}
							</div>
						</div>

						{/* Class notices (moved under Subjects) */}
						<div className="mt-6">
							<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Class Notices</p>
							<div className="mt-3">
								{isLoadingNotices ? (
									<div className="text-sm text-slate-500">Loading notices...</div>
								) : notices.length > 0 ? (
									<div className="space-y-3">
										{notices.map((note) => (
											<div key={note._id} className="rounded-lg border border-slate-200 bg-white p-3">
												<div className="flex items-start justify-between">
													<div>
														<p className="text-sm font-semibold text-slate-900">{note.title}</p>
														<p className="text-xs text-slate-500">{note.noticeType || "Notice"} • {new Date(note.createdAt).toLocaleDateString()}</p>
													</div>
												</div>
												<p className="mt-2 text-sm text-slate-600 line-clamp-2">{note.description}</p>
											</div>
										))}
									</div>
								) : (
									<p className="text-sm text-slate-500">No notices for this class.</p>
								)}
							</div>
						</div>
					</div>

					<div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Classmates</p>
								<h2 className="mt-2 text-2xl font-bold text-slate-900">Students in this class</h2>
							</div>
							<div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{students.length} total</div>
						</div>

						<div className="mt-6 grid gap-3">
							{students.length > 0 ? (
								students.map((student) => {
									const isCurrentUser = student?._id === authUser?._id;

									return (
										<div
											key={student._id}
											className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 transition ${
												isCurrentUser
													? "border-sky-200 bg-sky-50"
													: "border-slate-200 bg-slate-50"
											}`}
										>
											<div className="flex items-center gap-3">
												<div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-slate-900 text-white">
													{student?.profilePicture ? (
														<img src={student.profilePicture} alt={student.fullName || "Student"} className="h-full w-full object-cover" />
													) : (
														<span className="text-sm font-black">{getInitials(student?.fullName || "Student")}</span>
													)}
												</div>
												<div>
													<div className="flex items-center gap-2">
														<p className="font-semibold text-slate-900">{student.fullName || "Unnamed student"}</p>
														{isCurrentUser && (
															<span className="rounded-full bg-sky-600 px-2.5 py-0.5 text-xs font-semibold text-white">You</span>
														)}
													</div>
													<p className="text-sm text-slate-500">{student.email}</p>
													<p className="text-sm text-slate-500">Roll no: {student.rollNo || "N/A"}</p>
												</div>
											</div>

											<div className="text-right text-sm text-slate-500">
												<p>{student.userCode || "No code"}</p>
											</div>
										</div>
									);
								})
							) : (
								<div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-slate-500">
									No students have been added to this class yet.
								</div>
							)}
						</div>
					</div>
				</section>

				<section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
					<div className="flex items-center justify-between gap-4">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Assignments</p>
							<h2 className="mt-2 text-2xl font-bold text-slate-900">Your class assignments</h2>
						</div>
						<div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{assignments.length} total</div>
					</div>

					<div className="mt-6">
						{isLoadingAssignments ? (
							<div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-slate-500">Loading assignments...</div>
						) : assignments.length > 0 ? (
							<div className="grid gap-4 md:grid-cols-2">
								{assignments.map((assignment) => (
									<div key={assignment._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
										<div className="flex items-start justify-between gap-4">
											<div>
												<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">{assignment.assignmentType}</p>
												<h3 className="mt-2 text-xl font-bold text-slate-900">{assignment.title}</h3>
												<p className="mt-2 text-sm text-slate-500">Due: {formatDueDate(assignment.dueDate)}</p>
												<span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${assignment.isSubmitted ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
													{assignment.isSubmitted ? `Submitted${assignment.submissionStatus ? ` (${assignment.submissionStatus})` : ""}` : "Not submitted"}
												</span>
											</div>
											<span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
												{assignment.totalMarks ?? "N/A"} marks
											</span>
										</div>

										<p className="mt-3 line-clamp-2 text-sm text-slate-600">
											{assignment.description || "No description provided."}
										</p>

										<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
											<p className="text-sm text-slate-500">By {assignment.teacherId?.fullName || "Teacher"}</p>
											<Link
												to={`/student/assignments/${assignment._id}`}
												className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
											>
												View details
											</Link>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-slate-500">
								No assignments have been posted for your class yet.
							</div>
						)}
					</div>
				</section>
			</div>

			
		</div>
	);
};

export default DisplayClassroom;
