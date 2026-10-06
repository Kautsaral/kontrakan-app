"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PembayaranPage() {
  const [pembayaran, setPembayaran] = useState([]);
  const [penghuni, setPenghuni] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    penghuni_id: "",
    tanggal_bayar: "",
    nominal: "",
    periode_bulan: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: pembayaranData, error: pembayaranError } = await supabase
        .from("pembayaran")
        .select("*")
        .order("tanggal_bayar", { ascending: false });

      if (pembayaranError) {
        console.error("Gagal mengambil data pembayaran:", pembayaranError);
        return;
      }

      const { data: penghuniData, error: penghuniError } = await supabase
        .from("penghuni")
        .select("*")
        .order("no_kamar", { ascending: true });

      if (penghuniError) {
        console.error("Gagal mengambil data penghuni:", penghuniError);
        return;
      }

      setPembayaran(pembayaranData);
      setPenghuni(penghuniData);
    };

    fetchData();
  }, []);

  const getTenantName = (tenantId) => {
    const tenant = penghuni.find((tenant) => tenant.id === tenantId);

    return tenant ? tenant.nama : "-";
  };

  const handleEdit = (payment) => {
    setEditingId(payment.id);

    setFormData({
      penghuni_id: String(payment.penghuni_id),
      tanggal_bayar: payment.tanggal_bayar,
      nominal: String(payment.nominal),
      periode_bulan: payment.periode_bulan,
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus pembayaran ini?",
    );

    if (!confirmed) return;

    const { error } = await supabase.from("pembayaran").delete().eq("id", id);

    if (error) {
      console.error("Gagal menghapus pembayaran:", error);
      alert("Gagal menghapus pembayaran.");
      return;
    }

    setPembayaran((current) => current.filter((payment) => payment.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const paymentData = {
      penghuni_id: Number(formData.penghuni_id),
      tanggal_bayar: formData.tanggal_bayar,
      nominal: Number(formData.nominal),
      periode_bulan: formData.periode_bulan,
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("pembayaran")
        .update(paymentData)
        .eq("id", editingId)
        .select()
        .single();

      if (error) {
        console.error("Gagal mengubah pembayaran:", error);
        alert("Gagal mengubah pembayaran.");
        return;
      }

      setPembayaran((current) =>
        current.map((payment) => (payment.id === editingId ? data : payment)),
      );
    } else {
      const { data, error } = await supabase
        .from("pembayaran")
        .insert([paymentData])
        .select()
        .single();

      if (error) {
        console.error("Gagal menambahkan pembayaran:", error);
        alert("Gagal menambahkan pembayaran.");
        return;
      }

      setPembayaran((current) => [data, ...current]);
    }

    setFormData({
      penghuni_id: "",
      tanggal_bayar: "",
      nominal: "",
      periode_bulan: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Data Pembayaran
            </h1>
            <p className="mt-1 text-gray-500">
              Kelola pembayaran penghuni kontrakan
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Tambah Pembayaran
          </button>
        </div>
        {showForm && (
          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              {editingId ? "Edit Pembayaran" : "Tambah Pembayaran"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Penghuni
                </label>

                <select
                  value={formData.penghuni_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      penghuni_id: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border px-4 py-2"
                  required
                >
                  <option value="">Pilih Penghuni</option>

                  {penghuni.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      Kamar {tenant.no_kamar} - {tenant.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Tanggal Bayar
                </label>

                <input
                  type="date"
                  value={formData.tanggal_bayar}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tanggal_bayar: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Nominal
                </label>

                <input
                  type="number"
                  placeholder="Contoh: 1200000"
                  value={formData.nominal}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nominal: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border px-4 py-2"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Periode Bulan
                </label>

                <input
                  type="month"
                  value={formData.periode_bulan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      periode_bulan: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border px-4 py-2"
                  required
                />
              </div>

              <div className="flex gap-2 md:col-span-2">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Simpan
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      penghuni_id: "",
                      tanggal_bayar: "",
                      nominal: "",
                      periode_bulan: "",
                    });
                  }}
                  className="rounded-lg border px-4 py-2 hover:bg-gray-50"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-4">Penghuni</th>
                  <th className="px-6 py-4">Tanggal Bayar</th>
                  <th className="px-6 py-4">Nominal</th>
                  <th className="px-6 py-4">Periode</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {pembayaran.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {getTenantName(payment.penghuni_id)}
                    </td>

                    <td className="px-6 py-4">{payment.tanggal_bayar}</td>

                    <td className="px-6 py-4">
                      Rp
                      {Number(payment.nominal).toLocaleString("id-ID")}
                    </td>

                    <td className="px-6 py-4">{payment.periode_bulan}</td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(payment)}
                          className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(payment.id)}
                          className="rounded border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {pembayaran.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      Belum ada data pembayaran.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
