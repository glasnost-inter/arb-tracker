# 📋 ARB Tracker Dashboard Specification

Dokumen ini mendefinisikan struktur UI/UX dan arsitektur logika untuk **ARB Tracker Dashboard** dengan standar *Clean Architecture* dan *Scalability*.

---

## 🏗️ 1. Header & Aksi Utama
*Menangani identitas halaman dan entry point pembuatan data baru.*

- **Judul Halaman**: `ARB Tracker Dashboard`
- **Tombol Aksi**: 
  - **Label**: `New Project`
  - **Tipe**: Primary Button
  - **Fungsi**: Membuka form pembuatan proyek baru.

> **Architect Note:** Implementasikan **Idempotency Key** pada saat submit project baru untuk mencegah duplikasi data jika terjadi gangguan jaringan.

---

## 🔍 2. Global Search & Filter Section
*Didesain untuk efisiensi pencarian data dengan validasi skema di sisi client/server.*

### A. Search Entry
* **Input Field**: `Filter by name...`
* **Action Button**: `Search` (Primary Blue)
* **Logic**: Implementasikan *Debouncing* 300ms untuk input teks guna mengurangi beban query ke database.

### B. Filter Matrix
| **Status Filter** | Dropdown | `All Statuses`, `Submitted`, `In-Review`, `Revision Needed`, `Approved`, `Rejected` |
| **Decision Filter** | Dropdown | `All Decisions`, `Approved`, `Approved with Conditions`, `Rejected` |
| **Task Filter** | Checkbox | `Show only projects with pending follow-up tasks` |

---

## 📊 3. Strategi Pengurutan (Sorting)
*Menggunakan Dynamic Path Resolution untuk mendukung skalabilitas data.*

- **Pilihan Pengurutan (Sort By)**:
  - `Last Updated` (Default)
  - `Date Created`
  - `Owner Squad`
  - `Project Name`
- **Arah Urutan**: 
  - `Descending (Z-A)`
  - `Ascending (A-Z)`
- **Aksi Tambahan**: `[+ Add Sort Condition]` untuk pengurutan multi-level.

---

## 🛡️ 4. Guidelines Arsitektur

### ⚡ Data Handling, Validasi & Scalability
1. **Indexing**: Pastikan kolom `project_name`, `status`, dan `updated_at` sudah di-index pada database.
2. **Error Handling**: Gunakan *Informative Error Handlers*. Jika fetch data gagal, tampilkan pesan spesifik (misal: `ERR_DB_CONNECTION_TIMEOUT`) alih-alih "Something went wrong".
3. **Validation**: Gunakan skema validasi (seperti **Zod** atau **Joi**) untuk memastikan parameter filter yang dikirim ke API valid secara tipe data.
4. **Strict Enums**: Nilai pada dropdown **Status** dan **Decision** harus dipetakan langsung ke tipe data `Enum` di database untuk mencegah inkonsistensi data.
5. **Clean Architecture**: Pisahkan logika filter menjadi *Use Case* tersendiri sehingga mudah diuji menggunakan **TDD (Test Driven Development)**.
6. **Informative Error**: Jika pencarian tidak membuahkan hasil, sistem harus memberikan feedback: *"No projects found with current filter. Please adjust your criteria."*

### 💾 Security & Backup
* **No Destructive Actions**: Dilarang menjalankan perintah yang merusak data tanpa otomasi backup ke folder `/backups`.
* **Audit Trail**: Setiap pembuatan project baru via tombol **+ New Project** harus tercatat dalam tabel log aktivitas.

---
*Generated for Lead Architect Standard - 2026*