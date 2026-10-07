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
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-500">Memuat kwitansi...</p>
      </main>
    );
  }

  if (!payment || !tenant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-red-500">Data kwitansi tidak ditemukan.</p>
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
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex justify-between print:hidden">
          <button
            onClick={() => window.history.back()}
            className="rounded-lg border bg-white px-4 py-2 hover:bg-gray-50"
          >
            ← Kembali
          </button>

          <button
            onClick={() => window.print()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            🖨 Cetak Kwitansi
          </button>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-sm print:shadow-none">
          <div className="border-b pb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              KWITANSI
            </h1>
            <p className="mt-2 text-gray-500">
              Pembayaran Kontrakan
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">No. Kwitansi</span>
              <span className="font-medium">
                INV-{payment.tanggal_bayar.replaceAll("-", "")}-{payment.id}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Telah diterima dari</span>
              <span className="font-medium">{tenant.nama}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Kamar</span>
              <span className="font-medium">
                {tenant.no_kamar}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Tanggal Bayar</span>
              <span className="font-medium">
                {formatDate(payment.tanggal_bayar)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Periode</span>
              <span className="font-medium">
                {payment.periode_bulan}
              </span>
            </div>

            <div className="my-6 border-t" />

            <div className="flex justify-between text-lg">
              <span className="font-semibold">Jumlah</span>
              <span className="font-bold">
                {formatCurrency(payment.nominal)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="font-semibold text-green-600">
                LUNAS
              </span>
            </div>
          </div>

          <div className="mt-12 border-t pt-6 text-center">
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