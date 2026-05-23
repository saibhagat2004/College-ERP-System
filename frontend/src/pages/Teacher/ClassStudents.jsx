import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const formatCurrency = (value) => {
  const numberValue = Number(value) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numberValue);
};

const ClassStudents = () => {
  const { classId } = useParams();
  const [classData, setClassData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadClassStudents = async () => {
      if (!classId) return;

      setIsLoading(true);
      try {
        const res = await fetch(`/api/teachers/classes/${classId}/students`, {
          credentials: "include",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load class students");
        setClassData(json);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadClassStudents();
  }, [classId]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-900/10">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Teacher dashboard</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Class students</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
              Review the students assigned to this class and check each student’s fee status, paid amount, and remaining balance.
            </p>
          </div>
        </section>

        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
            Loading class students...
          </div>
        ) : classData ? (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Class</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{classData.className}</p>
                <p className="text-sm text-slate-500">Section {classData.section}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Teacher</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{classData.teacherId?.fullName || "N/A"}</p>
                <p className="text-sm text-slate-500">{classData.teacherId?.userCode || ""}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Students</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{classData.students?.length || 0}</p>
                <p className="text-sm text-slate-500">Enrolled in this class</p>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Student list</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">Students in this class</h2>
                </div>
                <Link to="/teacher/classroom" className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Back to classroom
                </Link>
              </div>

              <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-left text-sm font-semibold text-slate-700">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Roll No</th>
                      <th className="px-4 py-3">Gender</th>
                      <th className="px-4 py-3">Tuition Fees</th>
                      <th className="px-4 py-3">Development Fees</th>
                      <th className="px-4 py-3">Paid</th>
                      <th className="px-4 py-3">Remaining</th>
                      <th className="px-4 py-3">Status</th>
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
                        <td className="px-4 py-4">{formatCurrency(student.fees?.tuitionFees)}</td>
                        <td className="px-4 py-4">{formatCurrency(student.fees?.developmentFees)}</td>
                        <td className="px-4 py-4">{formatCurrency(student.fees?.paidAmount)}</td>
                        <td className="px-4 py-4">{formatCurrency(student.fees?.remainingAmount)}</td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                            {student.fees?.paymentStatus || "pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
            No class data found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassStudents;
