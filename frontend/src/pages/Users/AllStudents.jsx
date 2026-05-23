import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AllStudents = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadStudents = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/users/students", { credentials: "include" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to fetch students");
        setStudents(json);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadStudents();
  }, []);

  const formatCurrency = (value) => {
    const numberValue = Number(value) || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(numberValue);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4 py-10">
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="bg-slate-900 px-8 py-6 text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Admin panel</p>
          <h1 className="mt-2 text-3xl font-bold">All Students</h1>
          <p className="mt-2 text-sm text-slate-300">View student details and fee status.</p>
        </div>

        <div className="p-8">
          {isLoading ? (
            <p className="text-sm text-slate-600">Loading students...</p>
          ) : students.length === 0 ? (
            <p className="text-sm text-slate-500">No students found.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 text-left text-sm font-semibold text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Gender</th>
                    <th className="px-4 py-3">Roll No</th>
                    <th className="px-4 py-3">Total Fees</th>
                    <th className="px-4 py-3">Paid</th>
                    <th className="px-4 py-3">Remaining</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
                  {students.map((student) => (
                    <tr key={student._id} className="align-top hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">{student.fullName || "Unnamed student"}</p>
                        <p className="text-xs text-slate-500">{student.userCode}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p>{student.email}</p>
                        <p className="text-xs text-slate-500">{student.username || "No username"}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-900">{student.classId?.className || "N/A"}</p>
                        <p className="text-xs text-slate-500">{student.classId?.section || ""}</p>
                      </td>
                      <td className="px-4 py-4 capitalize">{student.gender || "N/A"}</td>
                      <td className="px-4 py-4">{student.rollNo || "N/A"}</td>
                      <td className="px-4 py-4">{formatCurrency(student.fees?.totalFees)}</td>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AllStudents;
