import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const initialFormState = {
	fullName: "",
	username: "",
	email: "",
	password: "",
	userCode: "",
	role: "student",
	rollNo: "",
	classId: "",
	subjects: "",
	assignedClasses: "",
};


const CreateUsers = () => {
	const [formData, setFormData] = useState(initialFormState);
	const [classes, setClasses] = useState([]);
	const [isLoadingClasses, setIsLoadingClasses] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		const loadClasses = async () => {
			setIsLoadingClasses(true);
			try {
				const res = await fetch("/api/classes/list", { credentials: "include" });
				const response = await res.json();
				if (!res.ok) throw new Error(response.error || "Failed to fetch classes");
				setClasses(response);
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
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const buildPayload = () => {
		const payload = {
			fullName: formData.fullName.trim(),
			username: formData.username.trim(),
			email: formData.email.trim(),
			password: formData.password,
			userCode: formData.userCode.trim(),
			role: formData.role,
		};

		if (formData.role === "student") {
			payload.rollNo = formData.rollNo.trim();
			payload.classId = classes.find((item) => item._id === formData.classId) || formData.classId.trim();
		}

		if (formData.role === "teacher") {
			payload.subjects = formData.subjects
				.split(",")
				.map((item) => item.trim())
				.filter(Boolean);
			payload.assignedClasses = formData.assignedClasses
				.split(",")
				.map((item) => item.trim())
				.filter(Boolean);
		}

		return payload;
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!formData.fullName.trim()) return toast.error("Full name is required");
		if (!formData.email.trim()) return toast.error("Email is required");
		if (!formData.password || formData.password.length < 6) return toast.error("Password must be at least 6 characters");
		if (!formData.userCode.trim()) return toast.error("User code is required");
		if (!formData.role) return toast.error("Please select a role");

		if (formData.role === "student" && (!formData.rollNo.trim() || !formData.classId.trim())) {
			return toast.error("Roll No and Class ID are required for students");
		}

		if (formData.role === "teacher") {
			if (!formData.subjects.trim()) return toast.error("Add at least one subject for teachers");
		}

		const createUser = async () => {
			setIsSubmitting(true);
			try {
				const res = await fetch("/api/users/create", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(buildPayload()),
					credentials: "include",
				});

				const response = await res.json();
				if (!res.ok) throw new Error(response.error || "Failed to create user");

				toast.success("User created successfully");
				setFormData(initialFormState);
			} catch (error) {
				toast.error(error.message);
			} finally {
				setIsSubmitting(false);
			}
		};

		createUser();
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4 py-10">
			<div className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
				<div className="bg-slate-900 px-8 py-6 text-white">
					<p className="text-sm uppercase tracking-[0.3em] text-slate-300">Admin panel</p>
					<h1 className="mt-2 text-3xl font-bold">Create user</h1>
					<p className="mt-2 text-sm text-slate-300">Create a student, teacher, or admin from one form.</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6 p-8">
					<div className="grid gap-4 md:grid-cols-2">
						<input
							type="text"
							name="fullName"
							value={formData.fullName}
							onChange={handleChange}
							placeholder="Full name"
							className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
						/>
						<input
							type="text"
							name="username"
							value={formData.username}
							onChange={handleChange}
							placeholder="Username"
							className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
						/>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							placeholder="Email"
							className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
						/>
						<input
							type="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							placeholder="Password"
							className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
						/>
						<input
							type="text"
							name="userCode"
							value={formData.userCode}
							onChange={handleChange}
							placeholder="User code (required)"
							className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
						/>
					</div>

					<div>
						<label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
						<select
							name="role"
							value={formData.role}
							onChange={handleChange}
							className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
						>
							<option value="student">Student</option>
							<option value="teacher">Teacher</option>
							<option value="admin">Admin</option>
						</select>
					</div>

					{formData.role === "student" && (
						<div className="grid gap-4 md:grid-cols-2">
							<input
								type="text"
								name="rollNo"
								value={formData.rollNo}
								onChange={handleChange}
								placeholder="Roll No"
								className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
							/>
							<select
								name="classId"
								value={formData.classId}
								onChange={handleChange}
								className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
								disabled={isLoadingClasses}
							>
								<option value="">Select class</option>
								{classes.map((item) => (
									<option key={item._id} value={item._id}>
										{item.className} - {item.section}
									</option>
								))}
							</select>
						</div>
					)}

					{formData.role === "teacher" && (
						<div className="grid gap-4 md:grid-cols-2">
							<input
								type="text"
								name="subjects"
								value={formData.subjects}
								onChange={handleChange}
								placeholder="Subjects (comma separated)"
								className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
							/>
							<input
								type="text"
								name="assignedClasses"
								value={formData.assignedClasses}
								onChange={handleChange}
								placeholder="Assigned class IDs (comma separated)"
								className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
							/>
						</div>
					)}

					<button
						type="submit"
							disabled={isSubmitting}
						className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
					>
							{isSubmitting ? "Creating..." : "Create User"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default CreateUsers;
