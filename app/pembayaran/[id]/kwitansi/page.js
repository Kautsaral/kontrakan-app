"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function KwitansiPage() {
  const params = useParams();
  const id = params.id;

  const [payment, setPayment] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayment = async () => {
      const { data: paymentData, error: paymentError } = await supabase
        .from("pembayaran")
        .select("*")
        .eq("id", id)
        .single();

      if (paymentError) {
        console.error("Gagal mengambil pembayaran:", paymentError);
        setLoading(false);
        return;
      }

      setPayment(paymentData);

      const { data: tenantData, error: tenantError } = await supabase
        .from("penghuni")
        .select("*")
        .eq("id", paymentData.penghuni_id)
        .single();

      if (tenantError) {
        console.error("Gagal mengambil data penghuni:", tenantError);
        setLoading(false);
        return;
      }

      setTenant(tenantData);
      setLoading(false);
    };

    if (id) {
      fetchPayment();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <p className="text-sm text-gray-500 sm:text-base">
          Memuat kwitansi...
        </p>
      </main>
    );
  }

  if (!payment || !tenant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <p className="text-center text-sm text-red-500 sm:text-base">
          Data kwitansi tidak ditemukan.
        </p>
      </main>
    );
  }

  const formatDate = (date) => {
    return new Date(date + "T00:00:00").toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `Rp${Number(amount).toLocaleString("id-ID")}`;
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <button
            onClick={() => window.history.back()}
            className="w-full rounded-lg border bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-50 sm:w-auto"
          >
            ← Kembali
          </button>

          <button
            onClick={() => window.print()}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 sm:w-auto"
          >
            🖨 Cetak Kwitansi
          </button>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm sm:p-8 print:shadow-none">
          <div className="border-b pb-5 text-center sm:pb-6">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              KWITANSI
            </h1>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Pembayaran Kontrakan
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <span className="text-sm text-gray-500 sm:text-base">
                No. Kwitansi
              </span>
              <span className="break-all text-sm font-medium sm:text-right sm:text-base">
                INV-{payment.tanggal_bayar.replaceAll("-", "")}-{payment.id}
              </span>
            </div>

            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <span className="text-sm text-gray-500 sm:text-base">
                Telah diterima dari
              </span>
              <span className="text-sm font-medium sm:text-right sm:text-base">
                {tenant.nama}
              </span>
            </div>

            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <span className="text-sm text-gray-500 sm:text-base">
                Kamar
              </span>
              <span className="text-sm font-medium sm:text-right sm:text-base">
                {tenant.no_kamar}
              </span>
            </div>

            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <span className="text-sm text-gray-500 sm:text-base">
                Tanggal Bayar
              </span>
              <span className="text-sm font-medium sm:text-right sm:text-base">
                {formatDate(payment.tanggal_bayar)}
              </span>
            </div>

            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <span className="text-sm text-gray-500 sm:text-base">
                Periode
              </span>
              <span className="text-sm font-medium sm:text-right sm:text-base">
                {payment.periode_bulan}
              </span>
            </div>

            <div className="my-6 border-t" />

            <div className="flex items-center justify-between gap-4 text-base sm:text-lg">
              <span className="font-semibold">Jumlah</span>
              <span className="text-right font-bold">
                {formatCurrency(payment.nominal)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-500 sm:text-base">
                Status
              </span>

              <span className="font-semibold text-green-600">
                LUNAS
              </span>
            </div>
          </div>

          <div className="mt-10 border-t pt-5 text-center sm:mt-12 sm:pt-6">
            <p className="font-semibold">Kontrakan Owner</p>

            <p className="mt-1 text-sm text-gray-500">
              Terima kasih atas pembayaran Anda
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

