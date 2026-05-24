import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const formatDate = (value) => {
	if (!value) return "N/A";
	return new Date(value).toLocaleString();
};

const StudyMaterials = () => {
	const [materials, setMaterials] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");

	useEffect(() => {
		const loadMaterials = async () => {
			setIsLoading(true);
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
				setIsLoading(false);
			}
		};

		loadMaterials();
	}, []);

	const filteredMaterials = materials.filter((material) => {
		const haystack = [material.title, material.subject, material.description, material.classId?.className, material.classId?.section]
			.filter(Boolean)
			.join(" ")
			.toLowerCase();
		return haystack.includes(search.toLowerCase());
	});

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 md:px-8">
			<div className="mx-auto max-w-7xl space-y-6">
				<section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-900/10">
					<div className="p-6 sm:p-8 lg:p-10">
						<p className="text-sm uppercase tracking-[0.3em] text-slate-400">Student workspace</p>
						<h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Study materials</h1>
						<p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
							Browse the study materials shared for your class and open files directly when you need them.
						</p>
					</div>
				</section>

				<section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Library</p>
							<h2 className="mt-2 text-2xl font-bold text-slate-900">Class study materials</h2>
						</div>
						<div className="flex items-center gap-3">
							<input
								type="search"
								value={search}
								onChange={(event) => setSearch(event.target.value)}
								placeholder="Search title, subject, class..."
								className="min-w-64 rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
							/>
							<div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{filteredMaterials.length} shown</div>
						</div>
					</div>

					{isLoading ? (
						<div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-slate-500">Loading study materials...</div>
					) : error ? (
						<div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-8 text-center text-rose-700">{error}</div>
					) : filteredMaterials.length > 0 ? (
						<div className="mt-6 grid gap-4 md:grid-cols-2">
							{filteredMaterials.map((material) => (
								<div key={material._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
									<div className="flex items-start justify-between gap-4">
										<div>
											<p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">{material.subject || "Subject"}</p>
											<h3 className="mt-2 text-xl font-bold text-slate-900">{material.title}</h3>
											<p className="mt-2 text-sm text-slate-500">
												{material.classId?.className || "Class"}{material.classId?.section ? ` - ${material.classId.section}` : ""}
											</p>
										</div>
										<span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
											{formatDate(material.createdAt)}
										</span>
									</div>

									<p className="mt-3 line-clamp-3 text-sm text-slate-600">{material.description || "No description provided."}</p>

									<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
										<p className="text-sm text-slate-500">Teacher: {material.teacherId?.fullName || "Teacher"}</p>
										<a href={material.fileUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
											Open file
										</a>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-slate-500">
							No study materials available for your class yet.
						</div>
					)}

					<div className="mt-6 flex flex-wrap gap-3">
						<Link to="/student/classroom" className="inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
							Back to classroom
						</Link>
						{/* <Link to="/student/fees" className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700">
							Pay fees
						</Link> */}
					</div>
				</section>
			</div>
		</div>
	);
};

export default StudyMaterials;