import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const initialForm = { className: "", section: "", userCode: "", students: "" };

const CreateClass = () => {
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadClasses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/classes/list", { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch classes");
      setClasses(json);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.className.trim()) return toast.error("Class name required");
    if (!form.section.trim()) return toast.error("Section required");
    if (!form.userCode.trim()) return toast.error("Teacher user code is required");

    const payload = {
      className: form.className.trim(),
      section: form.section.trim(),
      userCode: form.userCode.trim(),
    };

    if (form.students.trim()) {
      payload.students = form.students
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(editingId ? `/api/classes/${editingId}` : "/api/classes/", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save class");

      toast.success(editingId ? "Class updated" : "Class created");
      setForm(initialForm);
      setEditingId(null);
      await loadClasses();
    } catch (error) {
      toast.error(error.message);
    }
    setIsSubmitting(false);
  };

  const startEdit = (cls) => {
    setEditingId(cls._id);
    setForm({
      className: cls.className || "",
      section: cls.section || "",
      userCode: cls.teacherId?.userCode || cls.teacherId || "",
      students: (cls.students || []).map((s) => s.userCode || s._id || s).join(", "),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    try {
      const res = await fetch(`/api/classes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete class");
      toast.success("Class deleted");
      await loadClasses();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4 py-10">
      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="bg-slate-900 px-8 py-6 text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Admin panel</p>
          <h1 className="mt-2 text-3xl font-bold">Manage Classes</h1>
          <p className="mt-2 text-sm text-slate-300">Create, update, delete and view classes.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <input name="className" value={form.className} onChange={handleChange} placeholder="Class name" className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900" />
            <input name="section" value={form.section} onChange={handleChange} placeholder="Section" className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900" />
            <input name="userCode" value={form.userCode} onChange={handleChange} placeholder="Teacher user code (required)" className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900" />
            <input name="students" value={form.students} onChange={handleChange} placeholder="Student user codes (comma separated)" className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900" />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={isSubmitting} className="rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70">
              {isSubmitting ? (editingId ? "Updating..." : "Creating...") : editingId ? "Update Class" : "Create Class"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="rounded-xl border border-slate-300 px-4 py-3 font-semibold">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="p-8">
          <h2 className="mb-4 text-xl font-semibold">All Classes</h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
              {classes.length === 0 && <p className="text-sm text-slate-500">No classes found.</p>}

              {classes.map((cls) => (
                <div key={cls._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="font-semibold">{cls.className} — {cls.section}</p>
                    <p className="text-sm text-slate-600">Teacher: {cls.teacherId?.fullName || "—"}{cls.teacherId?.userCode ? ` (${cls.teacherId.userCode})` : ""}</p>
                    <p className="text-sm text-slate-600">Students: {(cls.students || []).length}</p>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => startEdit(cls)} className="rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-white">Edit</button>
                    <button onClick={() => handleDelete(cls._id)} className="rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateClass;
