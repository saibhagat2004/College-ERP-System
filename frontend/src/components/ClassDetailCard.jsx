import React from "react";

const ClassDetailCard = ({
	classData,
	title = "Class details",
	subtitle = "Context for this page",
	teacherName,
	teacherCode,
}) => {
	if (!classData) return null;
	const displayTeacherName = classData.teacherId?.fullName || classData.teacherName || teacherName || "N/A";
	const displayTeacherCode = classData.teacherId?.userCode || teacherCode || "";

	return (
		<section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">{title}</p>
					<h2 className="mt-2 text-2xl font-bold text-slate-900">
						{classData.className || "Class"}
						{classData.section ? ` - ${classData.section}` : ""}
					</h2>
					<p className="mt-1 text-sm text-slate-500">{subtitle}</p>
				</div>
				<div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
					{classData.students?.length || 0} students
				</div>
			</div>

			<div className="mt-5 grid gap-4 md:grid-cols-3">
				<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Teacher</p>
					<p className="mt-2 text-lg font-bold text-slate-900">{displayTeacherName}</p>
					<p className="text-sm text-slate-500">{displayTeacherCode}</p>
				</div>
				<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Section</p>
					<p className="mt-2 text-lg font-bold text-slate-900">{classData.section || "N/A"}</p>
					<p className="text-sm text-slate-500">Class grouping</p>
				</div>
				<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Students</p>
					<p className="mt-2 text-lg font-bold text-slate-900">{classData.students?.length || 0}</p>
					<p className="text-sm text-slate-500">Enrolled in this class</p>
				</div>
			</div>
		</section>
	);
};

export default ClassDetailCard;
