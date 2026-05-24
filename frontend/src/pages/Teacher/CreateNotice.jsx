import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ClassDetailCard from "../../components/ClassDetailCard";

const CreateNotice = ({ authUser }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const classId = useMemo(() => new URLSearchParams(location.search).get("classId") || "", [location.search]);

	const [classes, setClasses] = useState([]);
	const [form, setForm] = useState({
		title: "",
		description: "",
		noticeType: "notice",
		classId,
		fileUrl: "",
		isForAllClasses: false,
	});
	const [isLoadingClasses, setIsLoadingClasses] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setForm((current) => ({ ...current, classId }));
	}, [classId]);

	useEffect(() => {
		if (!authUser) return;

		const loadClasses = async () => {
			setIsLoadingClasses(true);
			try {
				const res = await fetch("/api/teachers/my-classes", { credentials: "include" });
				const json = await res.json();
				if (!res.ok) throw new Error(json.error || "Failed to load classes");
				setClasses(json);
			} catch (error) {
				toast.error(error.message || "Failed to load classes");
			} finally {
				setIsLoadingClasses(false);
			}
		};

		loadClasses();
	}, [authUser]);

	const selectedClass = classes.find((cls) => cls._id === form.classId);

	const handleChange = (event) => {
		const { name, value, type, checked } = event.target;
		setForm((current) => ({
			...current,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!form.title.trim()) return toast.error("Title is required");
		if (!form.description.trim()) return toast.error("Description is required");
		if (!form.isForAllClasses && !form.classId) return toast.error("Select a class");

		const payload = {
			title: form.title.trim(),
			description: form.description.trim(),
			noticeType: form.noticeType,
			fileUrl: form.fileUrl.trim(),
			isForAllClasses: form.isForAllClasses,
		};

		if (!form.isForAllClasses) {
			payload.classId = form.classId;
		}

		setIsSubmitting(true);
		try {
			const res = await fetch("/api/notice/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(payload),
			});

			const json = await res.json();
			if (!res.ok) throw new Error(json.error || "Failed to create notification");

			toast.success("Notification created");
			navigate(classId ? `/teacher/classes/${classId}` : "/teacher/classroom");
		} catch (error) {
			toast.error(error.message || "Failed to create notification");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 md:px-8">
			<div className="mx-auto max-w-5xl space-y-6">
				<section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-900/10">
					<div className="p-6 sm:p-8">
						<p className="text-sm uppercase tracking-[0.3em] text-slate-400">Teacher workspace</p>
						<h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Create notification</h1>
						<p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
							Post a notice for one class or all classes, with the selected classroom prefilled from the detail page.
						</p>
					</div>
				</section>

				<ClassDetailCard
					classData={selectedClass}
					title="Selected class"
					subtitle="Review the class before posting a notification"
					teacherName={authUser?.fullName}
					teacherCode={authUser?.userCode}
				/>

				<form onSubmit={handleSubmit} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6">
					<div className="grid gap-4 md:grid-cols-2">
						<input
							name="title"
							value={form.title}
							onChange={handleChange}
							placeholder="Notification title"
							className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 md:col-span-2"
						/>
						<select
							name="noticeType"
							value={form.noticeType}
							onChange={handleChange}
							className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
						>
							<option value="notice">Notice</option>
							<option value="circular">Circular</option>
							<option value="announcement">Announcement</option>
						</select>
						<label className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700">
							<input type="checkbox" name="isForAllClasses" checked={form.isForAllClasses} onChange={handleChange} />
							<span>Send to all classes</span>
						</label>
						<select
							name="classId"
							value={form.classId}
							onChange={handleChange}
							disabled={form.isForAllClasses}
							className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 disabled:bg-slate-100"
						>
							<option value="">Select class</option>
							{classes.map((cls) => (
								<option key={cls._id} value={cls._id}>
									{cls.className} - {cls.section}
								</option>
							))}
						</select>
						<input
							name="fileUrl"
							value={form.fileUrl}
							onChange={handleChange}
							placeholder="Optional file URL"
							className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 md:col-span-2"
						/>
						<textarea
							name="description"
							value={form.description}
							onChange={handleChange}
							placeholder="Notification message"
							rows="5"
							className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 md:col-span-2"
						/>
					</div>

					<div className="flex flex-wrap gap-3">
						<button
							type="submit"
							disabled={isSubmitting || isLoadingClasses}
							className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
						>
							{isSubmitting ? "Creating..." : "Create notification"}
						</button>
						<button
							type="button"
							onClick={() => navigate(classId ? `/teacher/classes/${classId}` : "/teacher/classroom")}
							className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CreateNotice;
