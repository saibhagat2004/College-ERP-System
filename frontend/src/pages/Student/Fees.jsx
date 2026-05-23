import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const formatCurrency = (value) => {
  const numberValue = Number(value) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numberValue);
};

const StudentFees = ({ authUser }) => {
  const [classData, setClassData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadFees = async () => {
      if (!authUser?.classId) return;

      setIsLoading(true);
      try {
        const res = await fetch("/api/classes/my-class", {
          credentials: "include",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load fee details");
        setClassData(json);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadFees();
  }, [authUser?.classId]);

  if (!authUser?.classId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Fees</h1>
          <p className="mt-2 text-slate-600">No class is assigned to your account yet.</p>
          <Link to="/student/classroom" className="mt-6 inline-flex rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
            Back to classroom
          </Link>
        </div>
      </div>
    );
  }

  const feeSummary = authUser?.fees || {};
  const tuitionFees = Number(classData?.feesStructure?.tuitionFees ?? feeSummary.tuitionFees) || 0;
  const developmentFees = Number(classData?.feesStructure?.developmentFees ?? feeSummary.developmentFees) || 0;
  const totalFees = Number(feeSummary.totalFees ?? tuitionFees + developmentFees) || 0;
  const paidAmount = Number(feeSummary.paidAmount) || 0;
  const remainingAmount = Number(feeSummary.remainingAmount ?? totalFees - paidAmount) || 0;
  const paymentStatus = feeSummary.paymentStatus || "pending";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-900/10">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Student fees</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Fee structure and payment</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
              Review your class tuition and development fees. The pay button is present for now, but it is not connected to any payment flow yet.
            </p>
          </div>
        </section>

        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
            Loading fee details...
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Tuition</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(tuitionFees)}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Development</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(developmentFees)}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Paid</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(paidAmount)}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Remaining</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(remainingAmount)}</p>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Class fee breakdown</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">Your complete fee structure</h2>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 capitalize">
                    {paymentStatus}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
                    <span className="text-sm font-medium text-slate-500">Tuition fees</span>
                    <span className="text-base font-semibold text-slate-900">{formatCurrency(tuitionFees)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
                    <span className="text-sm font-medium text-slate-500">Development fees</span>
                    <span className="text-base font-semibold text-slate-900">{formatCurrency(developmentFees)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
                    <span className="text-sm font-medium text-slate-500">Total fees</span>
                    <span className="text-base font-semibold text-slate-900">{formatCurrency(totalFees)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
                    <span className="text-sm font-medium text-slate-500">Paid amount</span>
                    <span className="text-base font-semibold text-slate-900">{formatCurrency(paidAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
                    <span className="text-sm font-medium text-slate-500">Remaining amount</span>
                    <span className="text-base font-semibold text-slate-900">{formatCurrency(remainingAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Payment action</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Pay fees</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  The button below is a placeholder for now. It does not initiate any payment flow yet.
                </p>

                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                  Current status: <span className="font-semibold capitalize text-slate-900">{paymentStatus}</span>
                </div>

                <button
                  type="button"
                  disabled
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white opacity-70"
                >
                  Pay Now
                </button>

                <Link
                  to="/student/classroom"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Back to classroom
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentFees;
