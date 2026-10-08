"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PenghuniPage() {
  const [penghuni, setPenghuni] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const filteredPenghuni = penghuni.filter((tenant) => {
    const keyword = search.toLowerCase().trim();

    const matchesSearch =
      !keyword ||
      tenant.nama?.toLowerCase().includes(keyword) ||
      tenant.no_kamar?.toLowerCase().includes(keyword) ||
      tenant.no_hp?.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && tenant.status_aktif === true) ||
      (statusFilter === "inactive" && tenant.status_aktif === false);

    return matchesSearch && matchesStatus;
  });

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

  const handleDelete = async (tenant) => {
    const { data: payments, error: paymentError } = await supabase
      .from("pembayaran")
      .select("id")
      .eq("penghuni_id", tenant.id);

    if (paymentError) {
      console.error("Gagal mengecek pembayaran:", paymentError);
      alert("Gagal mengecek data pembayaran.");
      return;
    }

    if (payments.length > 0) {
      alert(
        "Penghuni tidak bisa dihapus karena sudah memiliki riwayat pembayaran. Silakan ubah status menjadi Tidak Aktif.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Yakin ingin menghapus penghuni ${tenant.nama}?`,
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("penghuni")
      .delete()
      .eq("id", tenant.id);

    if (error) {
      console.error("Gagal menghapus penghuni:", error);
      alert("Gagal menghapus penghuni.");
      return;
    }

    setPenghuni((current) => current.filter((item) => item.id !== tenant.id));
  };

  const handleToggleStatus = async (tenant) => {
    const newStatus = !tenant.status_aktif;

    const { data, error } = await supabase
      .from("penghuni")
      .update({
        status_aktif: newStatus,
      })
      .eq("id", tenant.id)
      .select()
      .single();

    if (error) {
      console.error("Gagal mengubah status penghuni:", error);
      alert("Gagal mengubah status penghuni.");
      return;
    }

    setPenghuni((current) =>
      current.map((item) => (item.id === tenant.id ? data : item)),
    );
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

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Penghuni</h1>

            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              Kelola data penghuni kontrakan
            </p>
          </div>

          <button
            onClick={() => {
              setEditingId(null);

              setFormData({
                nama: "",
                no_hp: "",
                no_kamar: "",
                tanggal_masuk: "",
                tanggal_jatuh_tempo: "",
                status_aktif: true,
              });

              setShowForm(true);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Tambah Penghuni
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              {editingId ? "Edit Penghuni" : "Tambah Penghuni"}
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
                  setFormData({
                    ...formData,
                    nama: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />

              <input
                type="text"
                placeholder="No. HP"
                value={formData.no_hp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    no_hp: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <input
                type="text"
                placeholder="No. Kamar"
                value={formData.no_kamar}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    no_kamar: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Simpan
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search & Filter */}
        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_auto]">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Cari Penghuni
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nama, no. kamar, atau no. HP..."
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 md:w-auto"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-500">
            Menampilkan{" "}
            <span className="font-medium text-gray-700">
              {filteredPenghuni.length}
            </span>{" "}
            dari {penghuni.length} penghuni
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 sm:px-6 sm:py-4">Nama</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4">Kamar</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4">No. HP</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4">Tanggal Masuk</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4">Jatuh Tempo</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4">Status</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredPenghuni.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 sm:px-6 sm:py-4">
                      {tenant.nama}
                    </td>

                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      Kamar {tenant.no_kamar}
                    </td>

                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      {tenant.no_hp || "-"}
                    </td>

                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      {tenant.tanggal_masuk}
                    </td>

                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      {tenant.tanggal_jatuh_tempo || "-"}
                    </td>

                    <td className="px-4 py-3 sm:px-6 sm:py-4">
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

                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleToggleStatus(tenant)}
                          className={`rounded-lg border px-3 py-2 text-sm ${
                            tenant.status_aktif
                              ? "border-orange-200 text-orange-600 hover:bg-orange-50"
                              : "border-green-200 text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {tenant.status_aktif ? "Nonaktifkan" : "Aktifkan"}
                        </button>

                        <button
                          onClick={() =>
                            (window.location.href = `/penghuni/${tenant.id}/riwayat`)
                          }
                          className="rounded-lg border border-blue-200 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                        >
                          Riwayat
                        </button>

                        <button
                          onClick={() => handleEdit(tenant)}
                          className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(tenant)}
                          className="rounded border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredPenghuni.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-8 text-center text-sm text-gray-500 sm:px-6 sm:py-10"
                    >
                      {penghuni.length === 0
                        ? "Belum ada data penghuni."
                        : "Tidak ada penghuni yang sesuai dengan pencarian atau filter."}
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
