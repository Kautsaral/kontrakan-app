"use client";

import { useState } from "react";
const calendarDays = [
  null,
  null,
  null,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
];
const paymentStatus = {
  2: "paid",
  5: "unpaid",
  10: "paid",
  15: "paid",
  20: "unpaid",
  25: "paid",
};
const paymentsByDate = {
  2: [
    { name: "Budi", room: "Kamar 01", amount: "Rp1.000.000" },
    { name: "Andi", room: "Kamar 03", amount: "Rp1.000.000" },
  ],
  5: [{ name: "Sinta", room: "Kamar 05", amount: "Rp1.000.000" }],
  10: [{ name: "Doni", room: "Kamar 02", amount: "Rp1.000.000" }],
};
export default function Home() {
  const [selectedDate, setSelectedDate] = useState(null);
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Kontrakan
          </h1>
          <p className="mt-1 text-gray-500">
            Monitoring penghuni dan pembayaran kontrakan
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Penghuni</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">12</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Kamar</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">15</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Sudah Bayar</p>
            <p className="mt-2 text-3xl font-bold text-green-600">8</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Belum Bayar</p>
            <p className="mt-2 text-3xl font-bold text-red-600">4</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Oktober 2026
              </h2>

              <div className="flex gap-2">
                <button className="rounded-lg border px-3 py-2 hover:bg-gray-50">
                  ←
                </button>

                <button className="rounded-lg border px-3 py-2 hover:bg-gray-50">
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

            {/* Calendar Placeholder */}
            <div className="mt-4 grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  onClick={() => day && setSelectedDate(day)}
                  className={`min-h-20 rounded-lg border p-2 text-sm ${
                    day === null
                      ? "border-transparent bg-gray-50"
                      : day === 5
                        ? "border-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                  }`}
                >
                  {day && (
                    <div className="flex h-full flex-col">
                      <span className="font-medium">{day}</span>

                      {paymentStatus[day] === "paid" && (
                        <div className="mt-2 flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-green-500"></span>
                          <span className="text-xs text-green-600">Bayar</span>
                        </div>
                      )}

                      {paymentStatus[day] === "unpaid" && (
                        <div className="mt-2 flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-red-500"></span>
                          <span className="text-xs text-red-600">Belum</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {selectedDate && (
              <div className="mt-6 rounded-lg border bg-gray-50 p-4">
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
                        className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
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
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-green-500"></span>
                Sudah Bayar
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500"></span>
                Belum Bayar
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                Hari Ini
              </div>
            </div>
          </div>

          {/* Payment List */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              {selectedDate
                ? `Pembayaran Tanggal ${selectedDate}`
                : "Pembayaran"}
            </h2>

            {selectedDate && paymentsByDate[selectedDate] ? (
              <div className="space-y-4">
                {paymentsByDate[selectedDate].map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-4 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">{payment.name}</p>
                      <p className="text-sm text-gray-500">{payment.room}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-medium">{payment.amount}</p>
                      <p className="text-sm text-green-600">Sudah bayar</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedDate ? (
              <p className="text-sm text-gray-500">
                Tidak ada pembayaran pada tanggal ini.
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Klik tanggal pada kalender untuk melihat pembayaran.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
