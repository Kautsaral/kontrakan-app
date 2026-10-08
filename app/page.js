"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const today = new Date();

  const initialPeriod = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}`;

  const [selectedDate, setSelectedDate] = useState(null);
  const [penghuni, setPenghuni] = useState([]);
  const [pembayaran, setPembayaran] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState(initialPeriod);

  const [year, month] = currentPeriod.split("-").map(Number);

  // =========================
  // CALENDAR
  // =========================

  const firstDay = new Date(year, month - 1, 1).getDay();

  const daysInMonth = new Date(year, month, 0).getDate();

  const calendarDays = [
    ...Array(firstDay === 0 ? 6 : firstDay - 1).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const todayYear = today.getFullYear();
  const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
  const todayDay = today.getDate();

  const todayPeriod = `${todayYear}-${todayMonth}`;

  const changeMonth = (offset) => {
    const date = new Date(year, month - 1 + offset, 1);

    const newYear = date.getFullYear();

    const newMonth = String(date.getMonth() + 1).padStart(2, "0");

    setCurrentPeriod(`${newYear}-${newMonth}`);
    setSelectedDate(null);
  };

  // =========================
  // FETCH DATA
  // =========================

  useEffect(() => {
    const fetchData = async () => {
      const { data: penghuniData, error: penghuniError } = await supabase
        .from("penghuni")
        .select("*");

      if (penghuniError) {
        console.error("Gagal mengambil data penghuni:", penghuniError);
        return;
      }

      setPenghuni(penghuniData);

      const { data: pembayaranData, error: pembayaranError } = await supabase
        .from("pembayaran")
        .select("*");

      if (pembayaranError) {
        console.error("Gagal mengambil data pembayaran:", pembayaranError);
        return;
      }

      setPembayaran(pembayaranData);
    };

    fetchData();
  }, []);

  // =========================
  // PAYMENT DATA
  // =========================

  const pembayaranPeriode = pembayaran.filter(
    (payment) => payment.periode_bulan === currentPeriod,
  );

  const paidTenantIds = pembayaranPeriode.map((payment) => payment.penghuni_id);

  const paidCount = penghuni.filter((tenant) =>
    paidTenantIds.includes(tenant.id),
  ).length;

  const unpaidCount = penghuni.length - paidCount;

  const totalIncome = pembayaranPeriode.reduce(
    (total, payment) => total + Number(payment.nominal || 0),
    0,
  );

  const paymentPercentage =
    penghuni.length > 0 ? Math.round((paidCount / penghuni.length) * 100) : 0;

  // =========================
  // TOTAL ROOM
  // =========================

  const totalRooms = new Set(
    penghuni.map((tenant) => tenant.no_kamar).filter(Boolean),
  ).size;

  // =========================
  // PAYMENT BY DATE
  // =========================

  const paymentsByDate = pembayaranPeriode.reduce((result, payment) => {
    const day = Number(payment.tanggal_bayar.split("-")[2]);

    const tenant = penghuni.find((tenant) => tenant.id === payment.penghuni_id);

    if (!tenant) return result;

    if (!result[day]) {
      result[day] = [];
    }

    result[day].push({
      name: tenant.nama,
      room: `Kamar ${tenant.no_kamar}`,
      amount: `Rp${Number(payment.nominal || 0).toLocaleString("id-ID")}`,
    });

    return result;
  }, {});

  // =========================
  // UNPAID TENANTS
  // =========================

  const unpaidTenants = penghuni.filter(
    (tenant) =>
      !pembayaranPeriode.some((payment) => payment.penghuni_id === tenant.id),
  );

  // =========================
  // UNPAID DATE
  // =========================

  const unpaidDates = {};

  unpaidTenants.forEach((tenant) => {
    if (!tenant.tanggal_jatuh_tempo) return;

    const dueDate = tenant.tanggal_jatuh_tempo;

    if (!dueDate.startsWith(currentPeriod)) {
      return;
    }

    const day = Number(dueDate.split("-")[2]);

    unpaidDates[day] = (unpaidDates[day] || 0) + 1;
  });

  // =========================
  // OVERDUE TENANTS
  // =========================

  const todayFullDate = `${todayYear}-${todayMonth}-${String(todayDay).padStart(
    2,
    "0",
  )}`;

  const overdueTenants = unpaidTenants.filter((tenant) => {
    if (!tenant.tanggal_jatuh_tempo) {
      return false;
    }

    const dueDate = tenant.tanggal_jatuh_tempo;

    return dueDate < todayFullDate && dueDate.startsWith(currentPeriod);
  });

  // =========================
  // PAYMENT STATUS
  // =========================

  const paymentStatusFromDatabase = {};

  pembayaranPeriode.forEach((payment) => {
    const day = Number(payment.tanggal_bayar.split("-")[2]);

    if (!paymentStatusFromDatabase[day]) {
      paymentStatusFromDatabase[day] = 0;
    }

    paymentStatusFromDatabase[day] += 1;
  });

  // =========================
  // RENDER
  // =========================

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Dashboard Kontrakan
          </h1>

          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            Monitoring penghuni dan pembayaran kontrakan
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
            <p className="text-xs font-medium text-gray-500 sm:text-sm">
              Total Penghuni
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              {penghuni.length}
            </p>

            <p className="mt-1 text-xs text-gray-400">Penghuni terdaftar</p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
            <p className="text-xs font-medium text-gray-500 sm:text-sm">
              Total Kamar
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              {totalRooms}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Berdasarkan data penghuni
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
            <p className="text-xs font-medium text-gray-500 sm:text-sm">
              Sudah Bayar
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600 sm:text-3xl">
              {paidCount}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {paymentPercentage}% dari penghuni
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
            <p className="text-xs font-medium text-gray-500 sm:text-sm">
              Belum Bayar
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600 sm:text-3xl">
              {unpaidCount}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Periode {currentPeriod}
            </p>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
            <p className="text-sm font-medium text-gray-500">Total Pemasukan</p>

            <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              Rp{totalIncome.toLocaleString("id-ID")}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Periode pembayaran {currentPeriod}
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Progress Pembayaran
              </p>

              <span className="text-sm font-semibold text-gray-900">
                {paymentPercentage}%
              </span>
            </div>

            <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{
                  width: `${paymentPercentage}%`,
                }}
              />
            </div>

            <p className="mt-2 text-xs text-gray-400">
              {paidCount} dari {penghuni.length} penghuni sudah melakukan
              pembayaran
            </p>
          </div>
        </div>

        {/* Overdue */}
        {overdueTenants.length > 0 && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm sm:p-5">
            <div className="mb-4">
              <h2 className="font-semibold text-red-700">
                Pembayaran Terlambat
              </h2>

              <p className="mt-1 text-sm text-red-600">
                Terdapat {overdueTenants.length} penghuni yang melewati tanggal
                jatuh tempo.
              </p>
            </div>

            <div className="space-y-3">
              {overdueTenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="flex flex-col gap-2 rounded-lg bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{tenant.nama}</p>

                    <p className="text-sm text-gray-500">
                      Kamar {tenant.no_kamar}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-sm font-medium text-red-600">
                      Jatuh tempo
                    </p>

                    <p className="text-sm text-gray-500">
                      {tenant.tanggal_jatuh_tempo}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {new Date(year, month - 1, 1).toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={() => changeMonth(-1)}
                  className="rounded-lg border px-3 py-2 hover:bg-gray-50"
                >
                  ←
                </button>

                <button
                  onClick={() => changeMonth(1)}
                  className="rounded-lg border px-3 py-2 hover:bg-gray-50"
                >
                  →
                </button>
              </div>
            </div>

            {/* Calendar Header */}
            <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500">
              <div>Sen</div>
              <div>Sel</div>
              <div>Rab</div>
              <div>Kam</div>
              <div>Jum</div>
              <div>Sab</div>
              <div>Min</div>
            </div>

            {/* Calendar */}
            <div className="mt-4 grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  onClick={() => day && setSelectedDate(day)}
                  className={`min-h-16 rounded-lg border p-1.5 text-xs sm:min-h-20 sm:p-2 sm:text-sm ${
                    day === null
                      ? "border-transparent bg-gray-50"
                      : currentPeriod === todayPeriod && day === todayDay
                        ? "border-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                  }`}
                >
                  {day && (
                    <div className="flex h-full flex-col">
                      <span className="font-medium">{day}</span>

                      {/* Paid */}
                      {paymentStatusFromDatabase[day] > 0 && (
                        <div className="mt-2 flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-green-500" />

                          <span className="text-xs text-green-600">
                            {paymentStatusFromDatabase[day]} Bayar
                          </span>
                        </div>
                      )}

                      {/* Unpaid */}
                      {unpaidDates[day] > 0 && (
                        <div className="mt-1 flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-red-500" />

                          <span className="text-xs text-red-600">
                            {unpaidDates[day]} Belum
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Selected Date Detail */}
            {selectedDate && (
              <div className="mt-6 rounded-lg border bg-gray-50 p-3 sm:p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    Pembayaran Tanggal {selectedDate}
                  </h3>

                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Tutup
                  </button>
                </div>

                {paymentsByDate[selectedDate] ? (
                  <div className="space-y-3">
                    {paymentsByDate[selectedDate].map((payment, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-2 border-b pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-medium">{payment.name}</p>

                          <p className="text-sm text-gray-500">
                            {payment.room}
                          </p>
                        </div>

                        <p className="font-medium">{payment.amount}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Tidak ada pembayaran pada tanggal ini.
                  </p>
                )}
              </div>
            )}

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-gray-600 sm:gap-4 sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-green-500" />
                Sudah Bayar
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                Belum Bayar
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500" />
                Hari Ini
              </div>
            </div>
          </div>

          {/* Payment List */}
          <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Pembayaran
              </h2>

              <select
                value={currentPeriod}
                onChange={(e) => {
                  setCurrentPeriod(e.target.value);

                  setSelectedDate(null);
                }}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-auto"
              >
                {Array.from({ length: 24 }, (_, index) => {
                  const date = new Date(2026, index, 1);

                  const value = `${date.getFullYear()}-${String(
                    date.getMonth() + 1,
                  ).padStart(2, "0")}`;

                  const label = date.toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                  });

                  return (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Payment Summary & List */}
            <div className="space-y-4">
              {/* Total Income */}
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm text-gray-600">Total pemasukan</p>

                <p className="mt-1 text-xl font-bold text-green-700">
                  Rp{totalIncome.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Unpaid */}
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-sm text-gray-600">
                  Belum melakukan pembayaran
                </p>

                <p className="mt-1 text-xl font-bold text-red-600">
                  {unpaidCount} penghuni
                </p>
              </div>

              {/* Selected Date */}
              {selectedDate ? (
                <div className="rounded-lg border bg-gray-50 p-4">
                  <h3 className="mb-4 font-semibold text-gray-900">
                    Pembayaran Tanggal {selectedDate}
                  </h3>

                  {paymentsByDate[selectedDate] ? (
                    <div className="space-y-4">
                      {paymentsByDate[selectedDate].map((payment, index) => (
                        <div
                          key={index}
                          className="flex flex-col gap-2 border-b pb-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-medium">{payment.name}</p>

                            <p className="text-sm text-gray-500">
                              {payment.room}
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="font-medium">{payment.amount}</p>

                            <p className="text-sm text-green-600">
                              Sudah bayar
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Tidak ada pembayaran pada tanggal ini.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Klik tanggal pada kalender untuk melihat pembayaran.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
