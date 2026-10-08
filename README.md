# 🏠 Kontrakan App

Aplikasi web sederhana untuk membantu pengelolaan data penghuni, pembayaran kontrakan, dan pencatatan kwitansi secara digital.

Project ini dibuat sebagai **personal project** untuk mengimplementasikan aplikasi CRUD berbasis web dengan Next.js dan Supabase, sekaligus menerapkan authentication, validation, data management, reporting, dan deployment.

## ✨ Features

### 🔐 Authentication & Security

* Admin login
* Protected routes menggunakan middleware
* Secure session menggunakan signed token
* Session expiration
* Logout
* Environment variables untuk credential dan secret

### 👤 Pengelolaan Penghuni

* Tambah penghuni
* Edit penghuni
* Hapus penghuni
* Aktifkan / nonaktifkan penghuni
* Data tanggal masuk
* Data tanggal jatuh tempo
* Search penghuni
* Filter status penghuni
* Riwayat pembayaran per penghuni

### 💰 Pengelolaan Pembayaran

* Tambah pembayaran
* Edit pembayaran
* Hapus pembayaran
* Validasi tanggal dan nominal pembayaran
* Search pembayaran
* Filter berdasarkan periode
* Filter berdasarkan tanggal pembayaran
* Digital kwitansi
* Print / Save as PDF

### 📊 Dashboard

* Kalender pembayaran
* Status pembayaran
* Detail pembayaran berdasarkan tanggal
* Reminder jatuh tempo
* Total pemasukan
* Total transaksi
* Rata-rata pembayaran
* Analytics pemasukan
* Tren pemasukan 6 bulan terakhir

### 📁 Data Management

* Export laporan pembayaran ke CSV
* Backup data penghuni ke JSON
* Backup data pembayaran ke JSON
* Informasi jumlah data yang tersedia

### 📱 Responsive UI

* Desktop
* Tablet
* Mobile
* Responsive navigation
* Responsive tables

---

## 🛠️ Tech Stack

* **Next.js 16**
* **React**
* **JavaScript**
* **Tailwind CSS**
* **Supabase**
* **PostgreSQL**
* **Vercel**
* **Git & GitHub**

---

## 🗄️ Database

Database menggunakan Supabase PostgreSQL.

### Tables

#### `penghuni`

Menyimpan data penghuni kontrakan.

| Column                | Description           |
| --------------------- | --------------------- |
| `id`                  | ID penghuni           |
| `nama`                | Nama penghuni         |
| `no_hp`               | Nomor HP / identitas  |
| `no_kamar`            | Nomor kamar           |
| `tanggal_masuk`       | Tanggal masuk         |
| `tanggal_jatuh_tempo` | Tanggal jatuh tempo   |
| `status_aktif`        | Status aktif penghuni |

#### `pembayaran`

Menyimpan data pembayaran.

| Column          | Description        |
| --------------- | ------------------ |
| `id`            | ID pembayaran      |
| `penghuni_id`   | Relasi ke penghuni |
| `tanggal_bayar` | Tanggal pembayaran |
| `nominal`       | Nominal pembayaran |
| `periode_bulan` | Periode tagihan    |

Relationship:

```text
penghuni
   │
   │ 1
   │
   └──────────< pembayaran
                  N
```

---

## 🚀 Getting Started

### 1. Clone repository

```bash
git clone https://github.com/Kautsaral/kontrakan-app.git
cd kontrakan-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

ADMIN_PASSWORD=your_admin_password
SESSION_SECRET=your_session_secret
```

> Jangan commit `.env.local` ke repository.

### 4. Run development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🔒 Environment Variables

| Variable                        | Purpose                     |
| ------------------------------- | --------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client key         |
| `ADMIN_PASSWORD`                | Admin login password        |
| `SESSION_SECRET`                | Secret untuk signed session |

Secret seperti `ADMIN_PASSWORD` dan `SESSION_SECRET` harus disimpan sebagai environment variables dan tidak boleh dimasukkan ke source code.

---

## 🌐 Deployment

Application is deployed using **Vercel**.

Deployment workflow:

```text
Local Development
       ↓
Feature Branch
       ↓
Commit
       ↓
Push to GitHub
       ↓
Pull Request
       ↓
Merge to main
       ↓
Vercel Automatic Deployment
       ↓
Production
```

Setiap perubahan yang sudah di-merge ke `main` akan otomatis diproses oleh Vercel untuk deployment.

---

## 🧪 Testing

Sebelum production deployment, aplikasi telah melalui:

* Smoke testing
* Regression testing
* Authentication testing
* CRUD testing
* Payment validation testing
* Responsive UI testing
* Print / PDF testing
* Search & filter testing
* Export testing
* Backup testing
* Security testing
* Production smoke testing
* Production regression testing

---

## 📌 Project Status

**Production Ready ✅**

Current version includes the complete planned feature set from the project roadmap.

---

## 🎯 Project Goals

Project ini dibuat dengan fokus pada:

* Simple administration
* Minimal infrastructure cost
* Easy maintenance
* Secure authentication
* Reliable data management
* Responsive user interface
* Production deployment

---

## 👨‍💻 Author

**Kautsar**

GitHub:
https://github.com/Kautsaral
