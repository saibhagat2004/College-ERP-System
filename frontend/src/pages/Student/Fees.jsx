import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { load } from "@cashfreepayments/cashfree-js";

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
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [feeSummary, setFeeSummary] = useState(authUser?.fees || {});
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    setFeeSummary(authUser?.fees || {});
  }, [authUser?.fees]);

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

  const getPaymentMode = () => (import.meta.env.PROD ? "production" : "sandbox");

  const verifyPayment = async (orderId) => {
    const res = await fetch("/api/payment/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ orderId }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Payment verification failed");
    }

    if (json?.fees) {
      setFeeSummary(json.fees);
    }

    if (json?.orderStatus === "PAID" || json?.fees?.paymentStatus === "paid") {
      toast.success(json.message || "Payment successful");
      setPaymentMessage(json.message || "Payment successful");
      return json;
    }

    throw new Error(json.message || "Payment is not completed yet");
  };

  const handlePayFees = async () => {
    if (!authUser?.classId || isPaymentLoading) return;

    setIsPaymentLoading(true);
    setPaymentMessage("");

    try {
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ amount: selectedAmount }),
      });

      const orderJson = await orderResponse.json();
      if (!orderResponse.ok) {
        throw new Error(orderJson.error || "Failed to create payment order");
      }

      const paymentSessionId = orderJson.paymentSessionId;
      const orderId = orderJson.orderId;

      if (!paymentSessionId || !orderId) {
        throw new Error("Missing payment session details from server");
      }

      const cashfree = await load({ mode: getPaymentMode() });
      const checkoutOptions = {
        paymentSessionId,
        redirectTarget: "_modal",
      };

      const result = await cashfree.checkout(checkoutOptions);
      console.log("Payment modal closed:", result);

      setTimeout(async () => {
        try {
          await verifyPayment(orderId);
        } catch (verifyError) {
          toast.error(verifyError.message || "Payment verification failed");
          setPaymentMessage(verifyError.message || "Payment verification failed");
        } finally {
          setIsPaymentLoading(false);
        }
      }, 2000);
    } catch (error) {
      toast.error(error.message || "Payment checkout failed");
      setPaymentMessage(error.message || "Payment checkout failed");
      setIsPaymentLoading(false);
    }
  };

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

  const tuitionFees = Number(classData?.feesStructure?.tuitionFees ?? feeSummary.tuitionFees) || 0;
  const developmentFees = Number(classData?.feesStructure?.developmentFees ?? feeSummary.developmentFees) || 0;
  const totalFees = Number(feeSummary.totalFees ?? tuitionFees + developmentFees) || 0;
  const paidAmount = Number(feeSummary.paidAmount) || 0;
  const remainingAmount = Number(feeSummary.remainingAmount ?? totalFees - paidAmount) || 0;
  const paymentStatus = feeSummary.paymentStatus || "pending";
  const selectedAmount = Number(paymentAmount) || 0;
  const isAmountValid = selectedAmount > 0 && selectedAmount <= remainingAmount;

  useEffect(() => {
    if (remainingAmount > 0) {
      setPaymentAmount(String(remainingAmount));
    } else {
      setPaymentAmount("");
    }
  }, [remainingAmount]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-900/10">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Student fees</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Fee structure and payment</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
              Review your class tuition and development fees. Use the Cashfree checkout modal to pay the pending amount and verify the result immediately after the modal closes.
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
                  Clicking the button creates a Cashfree order, opens the checkout modal, and verifies the payment once the modal closes.
                </p>

                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                  Current status: <span className="font-semibold capitalize text-slate-900">{paymentStatus}</span>
                </div>

                <label className="mt-5 block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Payment amount</span>
                  <input
                    type="number"
                    min="1"
                    max={remainingAmount}
                    step="1"
                    value={paymentAmount}
                    onChange={(event) => setPaymentAmount(event.target.value)}
                    disabled={remainingAmount <= 0}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                    placeholder="Enter amount to pay"
                  />
                  <span className="mt-2 block text-xs text-slate-500">
                    You can pay a partial amount now. Maximum allowed is {formatCurrency(remainingAmount)}.
                  </span>
                </label>

                {!isAmountValid && remainingAmount > 0 ? (
                  <p className="mt-2 text-sm text-rose-600">Enter an amount between 1 and {formatCurrency(remainingAmount)}.</p>
                ) : null}

                <button
                  type="button"
                  onClick={handlePayFees}
                  disabled={isPaymentLoading || !isAmountValid}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPaymentLoading ? "Opening Cashfree..." : remainingAmount > 0 ? "Pay Selected Amount" : "Fees Paid"}
                </button>

                {paymentMessage ? (
                  <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {paymentMessage}
                  </div>
                ) : null}

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
