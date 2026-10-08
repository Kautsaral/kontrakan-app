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

  // Calendar period
  const [year, month] = currentPeriod.split("-").map(Number);

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

  const todayFullDate = `${todayYear}-${todayMonth}-${String(todayDay).padStart(
    2,
    "0",
  )}`;

  const changeMonth = (offset) => {
    const date = new Date(year, month - 1 + offset, 1);

    const newYear = date.getFullYear();

    const newMonth = String(date.getMonth() + 1).padStart(2, "0");

    setCurrentPeriod(`${newYear}-${newMonth}`);

    setSelectedDate(null);
  };

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
  // PAYMENT SUMMARY
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
  // UNPAID
  // =========================

  const unpaidTenants = penghuni.filter(
    (tenant) =>
      !pembayaranPeriode.some((payment) => payment.penghuni_id === tenant.id),
  );

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
  // OVERDUE
  // =========================

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
  // REMINDER
  // =========================

  const parseDate = (dateString) => {
    const [dateYear, dateMonth, dateDay] = dateString.split("-").map(Number);

    return new Date(Date.UTC(dateYear, dateMonth - 1, dateDay));
  };

  const getDateDifference = (startDate, endDate) => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    return Math.round((end - start) / (1000 * 60 * 60 * 24));
  };

  const reminderTenants = penghuni
    .filter(
      (tenant) => tenant.status_aktif === true && tenant.tanggal_jatuh_tempo,
    )
    .map((tenant) => {
      const dueDate = tenant.tanggal_jatuh_tempo;

      const duePeriod = dueDate.slice(0, 7);

      const alreadyPaid = pembayaran.some(
        (payment) =>
          payment.penghuni_id === tenant.id &&
          payment.periode_bulan === duePeriod,
      );

      if (alreadyPaid) return null;

      const daysUntilDue = getDateDifference(todayFullDate, dueDate);

      let category = null;

      if (daysUntilDue < 0) {
        category = "overdue";
      } else if (daysUntilDue === 0) {
        category = "today";
      } else if (daysUntilDue <= 7) {
        category = "soon";
      }

      if (!category) return null;

      return {
        ...tenant,
        duePeriod,
        daysUntilDue,
        category,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  const overdueReminders = reminderTenants.filter(
    (tenant) => tenant.category === "overdue",
  );

  const todayReminders = reminderTenants.filter(
    (tenant) => tenant.category === "today",
  );

  const soonReminders = reminderTenants.filter(
    (tenant) => tenant.category === "soon",
  );

  // =========================
  // ANALYTICS
  // =========================

  const totalTransactions = pembayaran.length;

  const totalPaymentAmount = pembayaran.reduce(
    (total, payment) => total + Number(payment.nominal || 0),
    0,
  );

  const averagePayment =
    totalTransactions > 0
      ? Math.round(totalPaymentAmount / totalTransactions)
      : 0;

  const getLastSixMonths = () => {
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(todayYear, today.getMonth() - (5 - index), 1);

      const period = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;

      const monthName = date.toLocaleDateString("id-ID", {
        month: "short",
      });

      return {
        period,
        label: monthName,
      };
    });
  };

  const monthlyAnalytics = getLastSixMonths().map((item) => {
    const monthlyPayments = pembayaran.filter((payment) =>
      payment.tanggal_bayar?.startsWith(item.period),
    );

    const income = monthlyPayments.reduce(
      (total, payment) => total + Number(payment.nominal || 0),
      0,
    );

    return {
      ...item,
      income,
      transactions: monthlyPayments.length,
    };
  });

  const maxMonthlyIncome = Math.max(
    ...monthlyAnalytics.map((item) => item.income),
    1,
  );

  // =========================
  // FORMATTERS
  // =========================

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    return new Date(`${dateString}T00:00:00`).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (value) => {
    return `Rp${Number(value || 0).toLocaleString("id-ID")}`;
  };

  const periodLabel = new Date(
    `${currentPeriod}-01T00:00:00`,
  ).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

          <p className="mt-1 text-sm text-gray-500">
            Ringkasan pembayaran dan kondisi penghuni kontrakan
          </p>
        </div>

        {/* MAIN DASHBOARD */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* =========================
              LEFT CONTENT
          ========================= */}
          <div className="space-y-6 lg:col-span-2">
            {/* DETAIL + REMINDER + CALENDAR */}
            <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
              {/* DETAIL PEMBAYARAN */}
              <div className="mb-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Detail Pembayaran
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Periode Pembayaran</p>

                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {periodLabel}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Total Pemasukan</p>

                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {formatCurrency(totalIncome)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Sudah Bayar</p>

                    <p className="mt-1 text-lg font-semibold text-green-600">
                      {paidCount} penghuni
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Belum Bayar</p>

                    <p className="mt-1 text-lg font-semibold text-red-600">
                      {unpaidCount} penghuni
                    </p>
                  </div>
                </div>
              </div>

              {/* REMINDER */}
              <div className="mb-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Reminder Jatuh Tempo
                </h2>

                {reminderTenants.length === 0 ? (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="font-medium text-green-700">
                      Tidak Ada Reminder
                    </p>

                    <p className="mt-1 text-sm text-green-600">
                      Tidak ada penghuni yang perlu diingatkan dalam 7 hari ke
                      depan.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* OVERDUE */}
                    {overdueReminders.length > 0 && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="mb-2 font-semibold text-red-700">
                          🔴 Terlambat
                        </p>

                        <div className="space-y-2">
                          {overdueReminders.map((tenant) => (
                            <div
                              key={tenant.id}
                              className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center"
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  {tenant.nama}
                                </p>

                                <p className="text-sm text-gray-500">
                                  Kamar {tenant.no_kamar}
                                </p>
                              </div>

                              <p className="text-sm font-medium text-red-600">
                                Jatuh tempo{" "}
                                {formatDate(tenant.tanggal_jatuh_tempo)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TODAY */}
                    {todayReminders.length > 0 && (
                      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                        <p className="mb-2 font-semibold text-yellow-700">
                          🟡 Jatuh Tempo Hari Ini
                        </p>

                        <div className="space-y-2">
                          {todayReminders.map((tenant) => (
                            <div
                              key={tenant.id}
                              className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center"
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  {tenant.nama}
                                </p>

                                <p className="text-sm text-gray-500">
                                  Kamar {tenant.no_kamar}
                                </p>
                              </div>

                              <p className="text-sm font-medium text-yellow-700">
                                Jatuh tempo hari ini
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SOON */}
                    {soonReminders.length > 0 && (
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <p className="mb-2 font-semibold text-blue-700">
                          🟢 Segera Jatuh Tempo
                        </p>

                        <div className="space-y-2">
                          {soonReminders.map((tenant) => (
                            <div
                              key={tenant.id}
                              className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center"
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  {tenant.nama}
                                </p>

                                <p className="text-sm text-gray-500">
                                  Kamar {tenant.no_kamar}
                                </p>
                              </div>

                              <p className="text-sm font-medium text-blue-700">
                                Jatuh tempo{" "}
                                {formatDate(tenant.tanggal_jatuh_tempo)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CALENDAR */}
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    ←
                  </button>

                  <h2 className="text-lg font-semibold text-gray-900">
                    {periodLabel}
                  </h2>

                  <button
                    onClick={() => changeMonth(1)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    →
                  </button>
                </div>

                {/* WEEKDAY */}
                <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-500 sm:text-sm">
                  <div>Sen</div>
                  <div>Sel</div>
                  <div>Rab</div>
                  <div>Kam</div>
                  <div>Jum</div>
                  <div>Sab</div>
                  <div>Min</div>
                </div>

                {/* CALENDAR DAYS */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="min-h-20 rounded-xl"
                        />
                      );
                    }

                    const paymentCount = paymentStatusFromDatabase[day] || 0;

                    const unpaidCountForDay = unpaidDates[day] || 0;

                    const isSelected = selectedDate === day;

                    const isToday =
                      currentPeriod === todayPeriod && day === todayDay;

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(day)}
                        className={`min-h-20 rounded-xl border p-2 text-left transition ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : isToday
                              ? "border-blue-300 bg-blue-50/50"
                              : "border-gray-100 bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm font-semibold ${
                              isToday ? "text-blue-600" : "text-gray-700"
                            }`}
                          >
                            {day}
                          </span>
                        </div>

                        <div className="mt-2 space-y-1">
                          {paymentCount > 0 && (
                            <div className="rounded-md bg-green-100 px-1.5 py-1 text-center text-[10px] font-medium text-green-700 sm:text-xs">
                              {paymentCount} Bayar
                            </div>
                          )}

                          {unpaidCountForDay > 0 && (
                            <div className="rounded-md bg-red-100 px-1.5 py-1 text-center text-[10px] font-medium text-red-700 sm:text-xs">
                              {unpaidCountForDay} Belum
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* SELECTED DATE */}
                {selectedDate && (
                  <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <h3 className="mb-3 font-semibold text-gray-900">
                      Pembayaran Tanggal {selectedDate} {periodLabel}
                    </h3>

                    {paymentsByDate[selectedDate]?.length > 0 ? (
                      <div className="space-y-3">
                        {paymentsByDate[selectedDate].map((payment, index) => (
                          <div
                            key={index}
                            className="flex flex-col justify-between gap-2 rounded-lg border border-gray-200 bg-white p-3 sm:flex-row sm:items-center"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {payment.name}
                              </p>

                              <p className="text-sm text-gray-500">
                                {payment.room}
                              </p>
                            </div>

                            <p className="font-semibold text-green-600">
                              {payment.amount}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Belum ada pembayaran pada tanggal ini.
                      </p>
                    )}
                  </div>
                )}

                {/* LEGEND */}
                <div className="mt-5 flex flex-wrap gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-green-100" />
                    Sudah Bayar
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-red-100" />
                    Belum Bayar
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-blue-100" />
                    Hari Dipilih
                  </div>
                </div>
              </div>
            </div>

            {/* PAYMENT LIST */}
            <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Daftar Pembayaran
                  </h2>

                  <p className="text-sm text-gray-500">
                    Ringkasan pembayaran berdasarkan periode
                  </p>
                </div>

                <select
                  value={currentPeriod}
                  onChange={(e) => {
                    setCurrentPeriod(e.target.value);
                    setSelectedDate(null);
                  }}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  {Array.from({ length: 24 }, (_, index) => {
                    const date = new Date(2026, index, 1);

                    const value = `${date.getFullYear()}-${String(
                      date.getMonth() + 1,
                    ).padStart(2, "0")}`;

                    return (
                      <option key={value} value={value}>
                        {date.toLocaleDateString("id-ID", {
                          month: "long",
                          year: "numeric",
                        })}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Total Pemasukan</p>

                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Belum Bayar</p>

                  <p className="mt-1 text-xl font-bold text-red-600">
                    {unpaidCount}
                  </p>
                </div>
              </div>

              {selectedDate && (
                <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-700">
                    Detail tanggal {selectedDate}
                  </p>

                  {paymentsByDate[selectedDate]?.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {paymentsByDate[selectedDate].map((payment, index) => (
                        <div
                          key={index}
                          className="flex justify-between gap-3 rounded-lg bg-white p-3"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {payment.name}
                            </p>

                            <p className="text-sm text-gray-500">
                              {payment.room}
                            </p>
                          </div>

                          <p className="font-semibold text-green-600">
                            {payment.amount}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">
                      Tidak ada pembayaran pada tanggal ini.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* =========================
              RIGHT SIDEBAR
          ========================= */}
          <div className="space-y-6">
            {/* SUMMARY */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Total Penghuni</p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {penghuni.length}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Total Kamar</p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {totalRooms}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Sudah Bayar</p>

                <p className="mt-1 text-2xl font-bold text-green-600">
                  {paidCount}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Belum Bayar</p>

                <p className="mt-1 text-2xl font-bold text-red-600">
                  {unpaidCount}
                </p>
              </div>
            </div>

            {/* PAYMENT SUMMARY */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Total Pemasukan</p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatCurrency(totalIncome)}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Progress Pembayaran</p>

                  <p className="font-semibold text-gray-900">
                    {paymentPercentage}%
                  </p>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{
                      width: `${paymentPercentage}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  {paidCount} dari {penghuni.length} penghuni sudah membayar.
                </p>
              </div>
            </div>

            {/* ANALYTICS */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Dashboard Analytics
              </h2>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Total Transaksi</p>

                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {totalTransactions}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Total Pemasukan</p>

                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {formatCurrency(totalPaymentAmount)}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Rata-rata Pembayaran</p>

                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {formatCurrency(averagePayment)}
                  </p>
                </div>
              </div>

              {/* SIX MONTH TREND */}
              <div className="mt-5">
                <p className="mb-3 text-sm font-semibold text-gray-700">
                  Tren Pemasukan 6 Bulan Terakhir
                </p>

                <div className="space-y-3">
                  {monthlyAnalytics.map((item) => (
                    <div key={item.period}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-600">
                          {item.label}
                        </span>

                        <span className="text-gray-500">
                          {formatCurrency(item.income)}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${
                              item.income > 0
                                ? Math.max(
                                    (item.income / maxMonthlyIncome) * 100,
                                    3,
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
