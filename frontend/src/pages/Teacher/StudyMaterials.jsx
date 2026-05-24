import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const emptyForm = {
	title: "",
	description: "",
	subject: "",
	classId: "",
};

const formatDate = (value) => {
	if (!value) return "N/A";
	return new Date(value).toLocaleString();
};

const StudyMaterials = ({ authUser }) => {
	const [classes, setClasses] = useState([]);
	const [materials, setMaterials] = useState([]);
	const [form, setForm] = useState(emptyForm);
	const [selectedFile, setSelectedFile] = useState(null);
	const [editingId, setEditingId] = useState("");
	const [isLoadingClasses, setIsLoadingClasses] = useState(false);
	const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	const loadClasses = async () => {
		setIsLoadingClasses(true);
		try {
			const res = await fetch("/api/teachers/my-classes", { credentials: "include" });
			const json = await res.json();
			if (!res.ok) throw new Error(json.error || "Failed to load classes");
			setClasses(json);
		} catch (fetchError) {
			toast.error(fetchError.message || "Failed to load classes");
		} finally {
			setIsLoadingClasses(false);
		}
	};

	const loadMaterials = async () => {
		setIsLoadingMaterials(true);
		setError("");

		try {
			const res = await fetch("/api/study-material", { credentials: "include" });
			const json = await res.json();
			if (!res.ok) throw new Error(json.error || "Failed to load study materials");
			setMaterials(json);
		} catch (fetchError) {
			const message = fetchError.message || "Failed to load study materials";
			setError(message);
			toast.error(message);
		} finally {
			setIsLoadingMaterials(false);
		}
	};

	useEffect(() => {
		if (!authUser) return;
		loadClasses();
		loadMaterials();
	}, [authUser]);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setForm((current) => ({ ...current, [name]: value }));
	};

	const handleFileChange = (event) => {
		setSelectedFile(event.target.files?.[0] || null);
	};

	const resetForm = () => {
		setForm(emptyForm);
		setSelectedFile(null);
		setEditingId("");
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!form.title.trim()) return toast.error("Title is required");
		if (!form.subject.trim()) return toast.error("Subject is required");
		if (!form.classId) return toast.error("Select a class");
		if (!selectedFile && !editingId) return toast.error("Select a file to upload");

		const payload = new FormData();
		payload.append("title", form.title.trim());
		payload.append("description", form.description.trim());
		payload.append("subject", form.subject.trim());
		payload.append("classId", form.classId);
		if (selectedFile) {
			payload.append("file", selectedFile);
		}

		setIsSubmitting(true);
		try {
			const res = await fetch(editingId ? `/api/study-material/${editingId}` : "/api/study-material/create", {
				method: editingId ? "PUT" : "POST",
				credentials: "include",
				body: payload,
			});

			const json = await res.json();
			if (!res.ok) throw new Error(json.error || "Failed to save study material");

			toast.success(editingId ? "Study material updated" : "Study material created");
			resetForm();
			await loadMaterials();
		} catch (submitError) {
			toast.error(submitError.message || "Failed to save study material");
		} finally {
			setIsSubmitting(false);
		}
	};

	const startEdit = (material) => {
		setEditingId(material._id);
		setForm({
			title: material.title || "",
			description: material.description || "",
			subject: material.subject || "",
			classId: material.classId?._id || material.classId || "",
		});
		setSelectedFile(null);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleDelete = async (id) => {
		if (!confirm("Delete this study material?")) return;

		try {
			const res = await fetch(`/api/study-material/${id}`, {
				method: "DELETE",
				credentials: "include",
			});

			const json = await res.json();
			if (!res.ok) throw new Error(json.error || "Failed to delete study material");

			toast.success("Study material deleted");
			await loadMaterials();
		} catch (deleteError) {
			toast.error(deleteError.message || "Failed to delete study material");
		}
	};

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 md:px-8">
			<div className="mx-auto max-w-7xl space-y-6">
				<section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-900/10">
					<div className="p-6 sm:p-8 lg:p-10">
						<p className="text-sm uppercase tracking-[0.3em] text-slate-400">Teacher workspace</p>
						<h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Study materials</h1>
						<p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
							Create materials for your classes, then review, update, or remove what you uploaded.
						</p>
					</div>
				</section>

				<section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
					<div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
									{editingId ? "Edit material" : "New material"}
								</p>
								<h2 className="mt-2 text-2xl font-bold text-slate-900">
									{editingId ? "Update study material" : "Upload study material"}
								</h2>
							</div>
							<div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
								{classes.length} classes
							</div>
						</div>

						<form onSubmit={handleSubmit} className="mt-6 space-y-4">
							<div className="grid gap-4">
								<input
									name="title"
									value={form.title}
									onChange={handleChange}
									placeholder="Material title"
									className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
								/>
								<input
									name="subject"
									value={form.subject}
									onChange={handleChange}
									placeholder="Subject"
									className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
								/>
								<select
									name="classId"
									value={form.classId}
									onChange={handleChange}
									className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
								>
									<option value="">Select class</option>
									{classes.map((cls) => (
										<option key={cls._id} value={cls._id}>
											{cls.className} - {cls.section}
										</option>
									))}
								</select>
								<textarea
									name="description"
									value={form.description}
									onChange={handleChange}
									placeholder="Description"
									rows="4"
									className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
								/>
								<label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:bg-slate-50">
									<span>{selectedFile ? selectedFile.name : editingId ? "Choose a new file to replace the current one" : "Select file to upload"}</span>
									<input type="file" accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt" onChange={handleFileChange} className="hidden" />
								</label>
							</div>

							<div className="flex flex-wrap gap-3">
								<button
									type="submit"
									disabled={isSubmitting || isLoadingClasses}
									className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
								>
									{isSubmitting ? (editingId ? "Updating..." : "Uploading...") : editingId ? "Update material" : "Upload material"}
								</button>
								{editingId && (
									<button type="button" onClick={resetForm} className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
										Cancel
									</button>
								)}
								<Link to="/teacher/classroom" className="inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
									Back to classroom
								</Link>
							</div>
						</form>
					</div>

					<div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Uploaded materials</p>
								<h2 className="mt-2 text-2xl font-bold text-slate-900">Browse your materials</h2>
							</div>
							<div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{materials.length} total</div>
						</div>

						{isLoadingMaterials ? (
							<div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-slate-500">Loading study materials...</div>
						) : error ? (
							<div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-8 text-center text-rose-700">{error}</div>
						) : materials.length > 0 ? (
							<div className="mt-6 space-y-4">
								{materials.map((material) => (
									<div key={material._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
										<div className="flex flex-wrap items-start justify-between gap-3">
											<div>
												<p className="text-lg font-bold text-slate-900">{material.title}</p>
												<p className="text-sm text-slate-500">{material.subject}</p>
												<p className="text-sm text-slate-500">
													{material.classId?.className || "Class"}{material.classId?.section ? ` - ${material.classId.section}` : ""}
												</p>
											</div>
											<span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
												{formatDate(material.createdAt)}
											</span>
										</div>

										<p className="mt-3 text-sm text-slate-600">{material.description || "No description provided."}</p>

										<div className="mt-4 flex flex-wrap gap-3">
											<a href={material.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
												Open file
											</a>
											<button type="button" onClick={() => startEdit(material)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white">
												Edit
											</button>
											<button type="button" onClick={() => handleDelete(material._id)} className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">
												Delete
											</button>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-slate-500">No study materials uploaded yet.</div>
						)}
					</div>
				</section>
			</div>
		</div>
	);
};

export default StudyMaterials;