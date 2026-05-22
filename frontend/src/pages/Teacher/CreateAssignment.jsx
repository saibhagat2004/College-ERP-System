import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const emptyQuestion = { question: "", options: "", correctAnswer: "" };

const CreateAssignment = ({ authUser }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const classId = useMemo(() => new URLSearchParams(location.search).get("classId") || "", [location.search]);

	const [classes, setClasses] = useState([]);
	const [isLoadingClasses, setIsLoadingClasses] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [form, setForm] = useState({
		title: "",
		description: "",
		assignmentType: "subjective",
		classId,
		totalMarks: "",
		dueDate: "",
		fileUrl: "",
	});
	const [questions, setQuestions] = useState([emptyQuestion]);

	useEffect(() => {
		setForm((current) => ({ ...current, classId }));
	}, [classId]);

	useEffect(() => {
		const loadClasses = async () => {
			setIsLoadingClasses(true);
			try {
				const res = await fetch("/api/teachers/my-classes", { credentials: "include" });
				const json = await res.json();
				if (!res.ok) throw new Error(json.error || "Failed to load classes");
				setClasses(json);
			} catch (error) {
				toast.error(error.message);
			} finally {
				setIsLoadingClasses(false);
			}
		};

		loadClasses();
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((current) => ({ ...current, [name]: value }));
	};

	const handleFileChange = (e) => {
		setSelectedFile(e.target.files?.[0] || null);
	};

	const updateQuestion = (index, field, value) => {
		setQuestions((current) =>
			current.map((question, questionIndex) => (questionIndex === index ? { ...question, [field]: value } : question)),
		);
	};

	const addQuestion = () => setQuestions((current) => [...current, emptyQuestion]);
	const removeQuestion = (index) => setQuestions((current) => current.filter((_, questionIndex) => questionIndex !== index));

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!form.title.trim()) return toast.error("Assignment title is required");
		if (!form.classId) return toast.error("Select a class");
		if (!form.dueDate) return toast.error("Due date is required");

		const payload = new FormData();
		payload.append("title", form.title.trim());
		payload.append("description", form.description.trim());
		payload.append("assignmentType", form.assignmentType);
		payload.append("classId", form.classId);
		payload.append("totalMarks", form.totalMarks);
		payload.append("dueDate", form.dueDate);
		if (form.fileUrl.trim()) {
			payload.append("fileUrl", form.fileUrl.trim());
		}
		if (selectedFile) {
			payload.append("assignmentFile", selectedFile);
		}

		if (form.assignmentType === "mcq") {
			const formattedQuestions = questions
				.map((question) => ({
					question: question.question.trim(),
					options: question.options
						.split(",")
						.map((option) => option.trim())
						.filter(Boolean),
					correctAnswer: question.correctAnswer.trim(),
				}))
				.filter((question) => question.question && question.options.length > 0 && question.correctAnswer);

			if (formattedQuestions.length === 0) {
				return toast.error("Add at least one complete MCQ question");
			}

			payload.append("mcqQuestions", JSON.stringify(formattedQuestions));
		}

		setIsSubmitting(true);
		try {
			const res = await fetch("/api/assignments", {
				method: "POST",
				credentials: "include",
				body: payload,
			});

			const json = await res.json();
			if (!res.ok) throw new Error(json.error || "Failed to create assignment");

			toast.success("Assignment created");
			navigate("/teacher/classroom");
		} catch (error) {
			toast.error(error.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 md:px-8">
			<div className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
				<div className="bg-slate-950 px-6 py-8 text-white sm:px-8">
					<p className="text-sm uppercase tracking-[0.3em] text-slate-400">Teacher workspace</p>
					<h1 className="mt-2 text-3xl font-black">Create assignment</h1>
					<p className="mt-2 max-w-2xl text-sm text-slate-300">Create an assignment for a specific classroom. The class selector is prefilled from the button on the classroom page.</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
					<div className="grid gap-4 md:grid-cols-2">
						<input name="title" value={form.title} onChange={handleChange} placeholder="Assignment title" className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900" />
						<select name="assignmentType" value={form.assignmentType} onChange={handleChange} className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900">
							<option value="subjective">Subjective</option>
							<option value="mcq">MCQ</option>
						</select>
						<select name="classId" value={form.classId} onChange={handleChange} className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900">
							<option value="">Select class</option>
							{classes.map((cls) => (
								<option key={cls._id} value={cls._id}>
									{cls.className} - {cls.section}
								</option>
							))}
						</select>
						<input type="number" name="totalMarks" value={form.totalMarks} onChange={handleChange} placeholder="Total marks" className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900" />
						<input type="datetime-local" name="dueDate" value={form.dueDate} onChange={handleChange} className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900" />
						<label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:bg-slate-50 md:col-span-2">
							<span>{selectedFile ? selectedFile.name : "Select document or image to upload"}</span>
							<input type="file" accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt" onChange={handleFileChange} className="hidden" />
						</label>
						<input name="fileUrl" value={form.fileUrl} onChange={handleChange} placeholder="Optional file URL" className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 md:col-span-2" />
						<textarea name="description" value={form.description} onChange={handleChange} placeholder="Assignment description" rows="4" className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 md:col-span-2" />
					</div>

					{form.assignmentType === "mcq" && (
						<div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
							<div className="flex items-center justify-between gap-4">
								<div>
									<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">MCQ questions</p>
									<h2 className="mt-1 text-xl font-bold text-slate-900">Question set</h2>
								</div>
								<button type="button" onClick={addQuestion} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">Add question</button>
							</div>

							<div className="space-y-4">
								{questions.map((question, index) => (
									<div key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
										<div className="flex items-center justify-between gap-4">
											<p className="font-semibold text-slate-900">Question {index + 1}</p>
											{questions.length > 1 && (
												<button type="button" onClick={() => removeQuestion(index)} className="text-sm font-semibold text-rose-600">Remove</button>
											)}
										</div>

										<div className="mt-3 grid gap-3 md:grid-cols-2">
											<input value={question.question} onChange={(e) => updateQuestion(index, "question", e.target.value)} placeholder="Question" className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 md:col-span-2" />
											<input value={question.options} onChange={(e) => updateQuestion(index, "options", e.target.value)} placeholder="Options separated by commas" className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 md:col-span-2" />
											<input value={question.correctAnswer} onChange={(e) => updateQuestion(index, "correctAnswer", e.target.value)} placeholder="Correct answer" className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 md:col-span-2" />
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					<div className="flex flex-wrap gap-3">
						<button type="submit" disabled={isSubmitting || isLoadingClasses} className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70">
							{isSubmitting ? "Creating..." : "Assign to class"}
						</button>
						<button type="button" onClick={() => navigate("/teacher/classroom")} className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
							Back to classroom
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CreateAssignment;