"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BackupPage() {
  const [penghuni, setPenghuni] = useState([]);
  const [pembayaran, setPembayaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage("");

      const [penghuniResult, pembayaranResult] = await Promise.all([
        supabase
          .from("penghuni")
          .select("*")
          .order("no_kamar", { ascending: true }),

        supabase
          .from("pembayaran")
          .select("*")
          .order("tanggal_bayar", { ascending: false }),
      ]);

      if (penghuniResult.error || pembayaranResult.error) {
        console.error("Gagal mengambil data backup:", {
          penghuniError: penghuniResult.error,
          pembayaranError: pembayaranResult.error,
        });

        setErrorMessage("Gagal mengambil data untuk backup.");
        setLoading(false);
        return;
      }

      setPenghuni(penghuniResult.data || []);
      setPembayaran(pembayaranResult.data || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  const getToday = () => {
    return new Date().toISOString().split("T")[0];
  };

  const downloadJSON = (data, filename) => {
    const jsonContent = JSON.stringify(data, null, 2);

    const blob = new Blob([jsonContent], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const handleBackupPenghuni = () => {
    if (penghuni.length === 0) {
      alert("Tidak ada data penghuni untuk dibackup.");
      return;
    }

    downloadJSON(
      penghuni,
      `backup-penghuni-${getToday()}.json`,
    );
  };

  const handleBackupPembayaran = () => {
    if (pembayaran.length === 0) {
      alert("Tidak ada data pembayaran untuk dibackup.");
      return;
    }

    downloadJSON(
      pembayaran,
      `backup-pembayaran-${getToday()}.json`,
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Memuat data backup...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Backup Data
          </h1>

          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            Backup data penghuni dan pembayaran dalam format JSON
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Backup Penghuni */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-gray-900">
                Data Penghuni
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Backup seluruh data penghuni dari database.
              </p>
            </div>

            <div className="mb-5 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Total Data
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {penghuni.length}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                penghuni
              </p>
            </div>

            <button
              onClick={handleBackupPenghuni}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Download Backup Penghuni
            </button>
          </div>

          {/* Backup Pembayaran */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-gray-900">
                Data Pembayaran
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Backup seluruh data pembayaran dari database.
              </p>
            </div>

            <div className="mb-5 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Total Data
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {pembayaran.length}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                transaksi
              </p>
            </div>

            <button
              onClick={handleBackupPembayaran}
              className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700"
            >
              Download Backup Pembayaran
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm font-medium text-yellow-800">
            Informasi Backup
          </p>

          <p className="mt-1 text-sm text-yellow-700">
            File backup berisi data langsung dari database dalam
            format JSON. Simpan file backup di tempat yang aman.
          </p>
        </div>
      </div>
    </main>
  );
}