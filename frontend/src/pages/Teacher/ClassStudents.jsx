import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ClassDetailCard from "../../components/ClassDetailCard";

const formatDate = (value) => {
	if (!value) return "N/A";
	return new Date(value).toLocaleString();
};

const formatCurrency = (value) => {
	const numberValue = Number(value) || 0;
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0,
	}).format(numberValue);
};

const TeacherClassDetail = () => {
	const { classId } = useParams();
	const [classData, setClassData] = useState(null);
	const [assignments, setAssignments] = useState([]);
	const [notices, setNotices] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadClassDetail = async () => {
			if (!classId) return;

			setIsLoading(true);
			setError("");

			try {
				const [classRes, assignmentsRes, noticesRes] = await Promise.all([
					fetch(`/api/teachers/classes/${classId}/students`, { credentials: "include" }),
					fetch(`/api/assignments/class/${classId}`, { credentials: "include" }),
					fetch(`/api/notice?classId=${classId}`, { credentials: "include" }),
				]);

				const [classJson, assignmentsJson, noticesJson] = await Promise.all([
					classRes.json(),
					assignmentsRes.json(),
					noticesRes.json(),
				]);

				if (!classRes.ok) throw new Error(classJson.error || "Failed to load class detail");
				if (!assignmentsRes.ok) throw new Error(assignmentsJson.error || "Failed to load assignments");
				if (!noticesRes.ok) throw new Error(noticesJson.error || "Failed to load notices");

				setClassData(classJson);
				setAssignments(assignmentsJson);
				setNotices(noticesJson);
			} catch (fetchError) {
				const message = fetchError.message || "Failed to load class detail";
				setError(message);
				toast.error(message);
			} finally {
				setIsLoading(false);
			}
		};

		loadClassDetail();
	}, [classId]);

	if (isLoading) {
		return (
			<div className="min-h-[60vh] px-4 py-10 md:px-8">
				<div className="mx-auto flex max-w-6xl items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-16 shadow-sm">
					<p className="text-slate-600">Loading class detail...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-[60vh] px-4 py-10 md:px-8">
				<div className="mx-auto max-w-4xl rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-rose-700 shadow-sm">
					<h1 className="text-2xl font-semibold">Class detail unavailable</h1>
					<p className="mt-2">{error}</p>
				</div>
			</div>
		);
	}

	if (!classData) return null;

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 md:px-8">
			<div className="mx-auto flex max-w-7xl flex-col gap-6">
				<section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-900/10">
					<div className="p-6 sm:p-8 lg:p-10">
						<p className="text-sm uppercase tracking-[0.3em] text-slate-400">Teacher dashboard</p>
						<h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Class detail</h1>
						<p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
							Use this page to review students, assignments, notices, and jump to study materials for the selected classroom.
						</p>
					</div>
				</section>

				<ClassDetailCard classData={classData} title="Selected class" subtitle="Overview for this classroom" />

				<section className="flex flex-wrap gap-3 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
					<Link
						to={`/teacher/assignments/new?classId=${classId}`}
						className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
					>
						Create assignment
					</Link>
					<Link
						to={`/teacher/notices/create?classId=${classId}`}
						className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
					>
						Create notification
					</Link>
					<Link
						to={`/teacher/study-materials?classId=${classId}`}
						className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
					>
						Study materials
					</Link>
					<Link
						to="/teacher/classroom"
						className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
					>
						Back to classroom
					</Link>
				</section>

				<section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
					<div className="flex items-center justify-between gap-4">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Students</p>
							<h2 className="mt-2 text-2xl font-bold text-slate-900">Student information</h2>
						</div>
						<div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
							{classData.students?.length || 0} total
						</div>
					</div>

					<div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
						<table className="min-w-full divide-y divide-slate-200">
							<thead className="bg-slate-50 text-left text-sm font-semibold text-slate-700">
								<tr>
									<th className="px-4 py-3">Student</th>
									<th className="px-4 py-3">Roll No</th>
									<th className="px-4 py-3">Gender</th>
									<th className="px-4 py-3">Fee Status</th>
									<th className="px-4 py-3">Paid</th>
									<th className="px-4 py-3">Remaining</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
								{(classData.students || []).map((student) => (
									<tr key={student._id} className="align-top hover:bg-slate-50">
										<td className="px-4 py-4">
											<p className="font-semibold text-slate-900">{student.fullName || "Unnamed student"}</p>
											<p className="text-xs text-slate-500">{student.userCode || ""}</p>
										</td>
										<td className="px-4 py-4">{student.rollNo || "N/A"}</td>
										<td className="px-4 py-4 capitalize">{student.gender || "N/A"}</td>
										<td className="px-4 py-4">
											<span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
												{student.fees?.paymentStatus || "pending"}
											</span>
										</td>
										<td className="px-4 py-4">{formatCurrency(student.fees?.paidAmount)}</td>
										<td className="px-4 py-4">{formatCurrency(student.fees?.remainingAmount)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>

				<section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
					<div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Assignments</p>
								<h2 className="mt-2 text-2xl font-bold text-slate-900">All assignments</h2>
							</div>
							<div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
								{assignments.length} total
							</div>
						</div>

						<div className="mt-6 space-y-4">
							{assignments.length > 0 ? (
								assignments.map((assignment) => (
									<div key={assignment._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
										<div className="flex items-start justify-between gap-4">
											<div>
												<p className="text-lg font-bold text-slate-900">{assignment.title}</p>
												<p className="text-sm text-slate-500">Type: {assignment.assignmentType}</p>
												<p className="text-sm text-slate-500">Due: {formatDate(assignment.dueDate)}</p>
											</div>
											<Link
												to={`/teacher/assignments/${assignment._id}`}
												className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
											>
												View details
											</Link>
										</div>
									</div>
								))
							) : (
								<div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-slate-500">
									No assignments created for this class yet.
								</div>
							)}
						</div>
					</div>

					<div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Notifications</p>
								<h2 className="mt-2 text-2xl font-bold text-slate-900">Class notices</h2>
							</div>
							<div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
								{notices.length} total
							</div>
						</div>

						<div className="mt-6 space-y-4">
							{notices.length > 0 ? (
								notices.map((notice) => (
									<div key={notice._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
										<div className="flex flex-wrap items-start justify-between gap-3">
											<div>
												<p className="text-lg font-bold text-slate-900">{notice.title}</p>
												<p className="text-sm text-slate-500">Type: {notice.noticeType}</p>
											</div>
											<span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
												{formatDate(notice.createdAt)}
											</span>
										</div>
										<p className="mt-3 text-sm text-slate-600">{notice.description}</p>
										{notice.isForAllClasses && (
											<p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Sent to all classes</p>
										)}
									</div>
								))
							) : (
								<div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-slate-500">
									No notifications posted yet.
								</div>
							)}
						</div>
					</div>
				</section>
			</div>
		</div>
	);
};

export default TeacherClassDetail;
