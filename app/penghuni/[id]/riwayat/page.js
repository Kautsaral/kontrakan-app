"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PaymentHistoryPage() {
  const { id } = useParams();
  const router = useRouter();

  const [tenant, setTenant] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage("");

      const { data: tenantData, error: tenantError } = await supabase
        .from("penghuni")
        .select("*")
        .eq("id", id)
        .single();

      if (tenantError) {
        console.error("Gagal mengambil data penghuni:", tenantError);

        setErrorMessage("Data penghuni tidak ditemukan.");
        setLoading(false);
        return;
      }

      setTenant(tenantData);

      const { data: paymentData, error: paymentError } = await supabase
        .from("pembayaran")
        .select("*")
        .eq("penghuni_id", id)
        .order("tanggal_bayar", {
          ascending: false,
        });

      if (paymentError) {
        console.error("Gagal mengambil riwayat pembayaran:", paymentError);

        setErrorMessage("Gagal mengambil riwayat pembayaran.");

        setLoading(false);
        return;
      }

      setPayments(paymentData || []);
      setLoading(false);
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const totalPayment = payments.reduce(
    (total, payment) => total + Number(payment.nominal || 0),
    0,
  );

  const formatCurrency = (amount) => {
    return `Rp${Number(amount || 0).toLocaleString("id-ID")}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatPeriod = (period) => {
    if (!period) return "-";

    const [year, month] = period.split("-");

    return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
      "id-ID",
      {
        month: "long",
        year: "numeric",
      },
    );
  };

  const handleBack = () => {
    router.push("/penghuni");
  };

  const handleKwitansi = (paymentId) => {
    router.push(`/pembayaran/${paymentId}/kwitansi`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Memuat riwayat pembayaran...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-600">{errorMessage}</p>

            <button
              onClick={handleBack}
              className="mt-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Kembali ke Penghuni
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Riwayat Pembayaran
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Riwayat pembayaran penghuni
            </p>
          </div>

          <button
            onClick={handleBack}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 sm:w-auto"
          >
            ← Kembali ke Penghuni
          </button>
        </div>

        {/* Tenant Info */}
        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">Penghuni</p>

              <h2 className="mt-1 text-xl font-bold text-gray-900">
                {tenant?.nama}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Kamar {tenant?.no_kamar}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-4 sm:min-w-52">
              <p className="text-sm text-gray-500">Total Pembayaran</p>

              <p className="mt-1 text-xl font-bold text-green-700">
                {formatCurrency(totalPayment)}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                {payments.length} transaksi
              </p>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="rounded-xl bg-white shadow-sm">
          <div className="border-b px-4 py-4 sm:px-6">
            <h2 className="font-semibold text-gray-900">Daftar Pembayaran</h2>
          </div>

          {payments.length === 0 ? (
            <div className="px-4 py-10 text-center sm:px-6">
              <p className="text-sm text-gray-500">
                Belum ada riwayat pembayaran.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-gray-500">
                    <th className="px-4 py-3 font-medium sm:px-6">No</th>

                    <th className="px-4 py-3 font-medium">Tanggal Bayar</th>

                    <th className="px-4 py-3 font-medium">Periode</th>

                    <th className="px-4 py-3 font-medium">Nominal</th>

                    <th className="px-4 py-3 font-medium">Status</th>

                    <th className="px-4 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment, index) => (
                    <tr
                      key={payment.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 sm:px-6">{index + 1}</td>

                      <td className="px-4 py-4">
                        {formatDate(payment.tanggal_bayar)}
                      </td>

                      <td className="px-4 py-4">
                        {formatPeriod(payment.periode_bulan)}
                      </td>

                      <td className="px-4 py-4 font-medium text-gray-900">
                        {formatCurrency(payment.nominal)}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Lunas
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => handleKwitansi(payment.id)}
                          className="rounded-lg border border-green-200 px-3 py-2 text-xs font-medium text-green-600 hover:bg-green-50"
                        >
                          Kwitansi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
