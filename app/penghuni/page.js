"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PenghuniPage() {
  const [penghuni, setPenghuni] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    nama: "",
    no_hp: "",
    no_kamar: "",
    tanggal_masuk: "",
    tanggal_jatuh_tempo: "",
    status_aktif: true,
  });

  useEffect(() => {
    const fetchPenghuni = async () => {
      const { data, error } = await supabase
        .from("penghuni")
        .select("*")
        .order("no_kamar", { ascending: true });

      if (error) {
        console.error("Gagal mengambil data penghuni:", error);
        return;
      }

      setPenghuni(data);
    };

    fetchPenghuni();
  }, []);

  const handleEdit = (tenant) => {
    setEditingId(tenant.id);

    setFormData({
      nama: tenant.nama,
      no_hp: tenant.no_hp || "",
      no_kamar: tenant.no_kamar,
      tanggal_masuk: tenant.tanggal_masuk,
      tanggal_jatuh_tempo: tenant.tanggal_jatuh_tempo || "",
      status_aktif: tenant.status_aktif,
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus penghuni ini?",
    );

    if (!confirmed) return;

    const { error } = await supabase.from("penghuni").delete().eq("id", id);

    if (error) {
      console.error("Gagal menghapus penghuni:", error);
      alert("Gagal menghapus penghuni.");
      return;
    }

    setPenghuni((current) => current.filter((tenant) => tenant.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      const { data, error } = await supabase
        .from("penghuni")
        .update(formData)
        .eq("id", editingId)
        .select()
        .single();

      if (error) {
        console.error("Gagal mengubah penghuni:", error);
        alert("Gagal mengubah penghuni.");
        return;
      }

      setPenghuni((current) =>
        current.map((tenant) => (tenant.id === editingId ? data : tenant)),
      );
    } else {
      const { data, error } = await supabase
        .from("penghuni")
        .insert([formData])
        .select()
        .single();

      if (error) {
        console.error("Gagal menambahkan penghuni:", error);
        alert("Gagal menambahkan penghuni.");
        return;
      }

      setPenghuni((current) => [...current, data]);
    }

    setFormData({
      nama: "",
      no_hp: "",
      no_kamar: "",
      tanggal_masuk: "",
      tanggal_jatuh_tempo: "",
      status_aktif: true,
    });

    setEditingId(null);
    setShowForm(false);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Penghuni</h1>
            <p className="mt-1 text-gray-500">Kelola data penghuni kontrakan</p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Tambah Penghuni
          </button>
        </div>
        {showForm && (
          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Tambah Penghuni
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <input
                type="text"
                placeholder="Nama"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className="rounded-lg border px-4 py-2"
                required
              />

              <input
                type="text"
                placeholder="No. HP"
                value={formData.no_hp}
                onChange={(e) =>
                  setFormData({ ...formData, no_hp: e.target.value })
                }
                className="rounded-lg border px-4 py-2"
              />

              <input
                type="text"
                placeholder="No. Kamar"
                value={formData.no_kamar}
                onChange={(e) =>
                  setFormData({ ...formData, no_kamar: e.target.value })
                }
                className="rounded-lg border px-4 py-2"
                required
              />

              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Tanggal Masuk
                </label>
                <input
                  type="date"
                  value={formData.tanggal_masuk}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tanggal_masuk: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Tanggal Jatuh Tempo
                </label>
                <input
                  type="date"
                  value={formData.tanggal_jatuh_tempo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tanggal_jatuh_tempo: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border px-4 py-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.status_aktif}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status_aktif: e.target.checked,
                    })
                  }
                />

                <label className="text-sm text-gray-700">Penghuni Aktif</label>
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
                  onClick={() => setShowForm(false)}
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
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Kamar</th>
                  <th className="px-6 py-4">No. HP</th>
                  <th className="px-6 py-4">Tanggal Masuk</th>
                  <th className="px-6 py-4">Jatuh Tempo</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {penghuni.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {tenant.nama}
                    </td>

                    <td className="px-6 py-4">Kamar {tenant.no_kamar}</td>

                    <td className="px-6 py-4">{tenant.no_hp || "-"}</td>

                    <td className="px-6 py-4">{tenant.tanggal_masuk}</td>

                    <td className="px-6 py-4">
                      {tenant.tanggal_jatuh_tempo || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          tenant.status_aktif
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {tenant.status_aktif ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(tenant)}
                          className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(tenant.id)}
                          className="rounded border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {penghuni.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      Belum ada data penghuni.
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
