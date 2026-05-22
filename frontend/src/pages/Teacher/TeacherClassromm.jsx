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

const TeacherClassroom = ({ authUser }) => {
	const [classes, setClasses] = useState([]);
	const [assignmentsByClass, setAssignmentsByClass] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
	const [error, setError] = useState("");

	const formatDueDate = (value) => {
		if (!value) return "No due date";
		return new Date(value).toLocaleString();
	};

	useEffect(() => {
		const loadClasses = async () => {
			setIsLoading(true);
			setError("");

			try {
				const res = await fetch("/api/teachers/my-classes", {
					credentials: "include",
				});

				const json = await res.json();
				if (!res.ok) {
					throw new Error(json.error || "Failed to load your classes");
				}

				setClasses(json);
			} catch (fetchError) {
				const message = fetchError.message || "Failed to load your classes";
				setError(message);
				toast.error(message);
			} finally {
				setIsLoading(false);
			}
		};

		loadClasses();
	}, []);

	useEffect(() => {
		if (classes.length === 0) return;

		const loadAssignments = async () => {
			setIsLoadingAssignments(true);
			try {
				const results = await Promise.all(
					classes.map(async (cls) => {
						const res = await fetch(`/api/assignments/class/${cls._id}`, { credentials: "include" });
						const json = await res.json();
						if (!res.ok) {
							throw new Error(json.error || `Failed to load assignments for ${cls.className}`);
						}

						return [cls._id, json];
					}),
				);

				setAssignmentsByClass(Object.fromEntries(results));
			} catch (fetchError) {
				toast.error(fetchError.message || "Failed to load assignments");
			} finally {
				setIsLoadingAssignments(false);
			}
		};

		loadAssignments();
	}, [classes]);

	if (isLoading) {
		return (
			<div className="min-h-[60vh] px-4 py-10 md:px-8">
				<div className="mx-auto flex max-w-6xl items-center justify-center rounded-3xl border border-slate-200 bg-white/80 px-6 py-16 shadow-sm backdrop-blur">
					<p className="text-slate-600">Loading your classes...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-[60vh] px-4 py-10 md:px-8">
				<div className="mx-auto max-w-4xl rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-rose-700 shadow-sm">
					<h1 className="text-2xl font-semibold">Teacher classroom unavailable</h1>
					<p className="mt-2">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 md:px-8">
			<div className="mx-auto flex max-w-7xl flex-col gap-6">
				<section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-900/10">
					<div className="grid gap-0 lg:grid-cols-[1.35fr_0.95fr]">
						<div className="relative p-6 sm:p-8 lg:p-10">
							<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_28%)]" />
							<div className="relative flex flex-col gap-6">
								<div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
									<span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Teacher dashboard</span>
									<span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">{classes.length} classes</span>
								</div>

								<div>
									<p className="text-sm uppercase tracking-[0.3em] text-slate-400">Assigned classrooms</p>
									<h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Manage your classes</h1>
									<p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
										Review the classes assigned to your account, check who is enrolled, and jump straight into assignment creation for any class.
									</p>
								</div>

								<div className="grid gap-4 sm:grid-cols-3">
									<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
										<p className="text-sm text-slate-400">Teacher</p>
										<p className="mt-2 text-2xl font-bold">{authUser?.fullName || authUser?.username || "Teacher"}</p>
									</div>
									<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
										<p className="text-sm text-slate-400">Classes</p>
										<p className="mt-2 text-2xl font-bold">{classes.length}</p>
									</div>
									<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
										<p className="text-sm text-slate-400">User code</p>
										<p className="mt-2 text-2xl font-bold">{authUser?.userCode || "N/A"}</p>
									</div>
								</div>
							</div>
						</div>

						<div className="border-t border-white/10 bg-white/5 p-6 sm:p-8 lg:border-l lg:border-t-0">
							<p className="text-sm uppercase tracking-[0.3em] text-slate-400">Logged in as</p>
							<div className="mt-4 flex items-center gap-4">
								<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-xl font-black text-white">
									{getInitials(authUser?.fullName || authUser?.username || "Teacher")}
								</div>
								<div>
									<p className="text-lg font-semibold text-white">{authUser?.fullName || authUser?.username}</p>
									<p className="text-sm text-slate-300">{authUser?.email}</p>
									<p className="text-sm text-slate-300">User code: {authUser?.userCode || "N/A"}</p>
								</div>
							</div>

							<div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
								This view is driven by <span className="font-semibold text-white">/api/teachers/my-classes</span>, so it always reflects the classes linked to your teacher account.
							</div>
						</div>
					</div>
				</section>

				<section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
					<div className="flex items-center justify-between gap-4">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Classes</p>
							<h2 className="mt-2 text-2xl font-bold text-slate-900">Your assigned classrooms</h2>
						</div>
						<div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{classes.length} total</div>
					</div>

					<div className="mt-6 grid gap-4 lg:grid-cols-2">
						{classes.length > 0 ? (
							classes.map((cls) => (
								<div key={cls._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
									<div className="flex flex-wrap items-start justify-between gap-4">
										<div>
											<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Class</p>
											<h3 className="mt-2 text-2xl font-bold text-slate-900">{cls.className}</h3>
											<p className="text-sm text-slate-500">Section {cls.section}</p>
										</div>
										<div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{cls.students?.length || 0} students</div>
									</div>

									<div className="mt-5 flex flex-wrap gap-3">
										<Link
											to={`/teacher/assignments/new?classId=${cls._id}`}
											className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
										>
											Assign assignment
										</Link>
										<Link
											to={`/teacher/assignments/new?classId=${cls._id}`}
											className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
										>
											Open class assignment form
										</Link>
									</div>

									<div className="mt-5 border-t border-slate-200 pt-4">
										<div className="flex items-center justify-between gap-3">
											<p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Assignments</p>
											<p className="text-sm text-slate-500">{(assignmentsByClass[cls._id] || []).length} total</p>
										</div>

										{isLoadingAssignments ? (
											<p className="mt-3 text-sm text-slate-500">Loading assignments...</p>
										) : (assignmentsByClass[cls._id] || []).length > 0 ? (
											<div className="mt-3 space-y-3">
												{assignmentsByClass[cls._id].slice(0, 3).map((assignment) => (
													<div key={assignment._id} className="rounded-2xl border border-slate-200 bg-white p-4">
														<div className="flex items-start justify-between gap-3">
															<div>
																<p className="font-semibold text-slate-900">{assignment.title}</p>
																<p className="text-sm text-slate-500">Type: {assignment.assignmentType}</p>
																<p className="text-sm text-slate-500">Due: {formatDueDate(assignment.dueDate)}</p>
															</div>
															<Link
																to={`/teacher/assignments/${assignment._id}`}
																className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
															>
																View details
															</Link>
														</div>
													</div>
												))}
											</div>
										) : (
											<div className="mt-3 rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
												No assignments created for this class yet.
											</div>
										)}
									</div>
								</div>
							))
						) : (
							<div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-slate-500">
								No classrooms are assigned to your teacher account yet.
							</div>
						)}
					</div>
				</section>
			</div>
		</div>
	);
};

export default TeacherClassroom;
