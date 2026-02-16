# Dokumen Konteks UI: Navigation Controls (Antigravity)

## Deskripsi Umum
Komponen ini adalah **Navigation Controls** (atau sering disebut **Pan & Zoom Controls**). Fungsinya adalah sebagai antarmuka utama bagi pengguna untuk mengelola navigasi visual saat melakukan *preview* dokumen atau gambar dalam aplikasi.

## Komponen Utama & Fungsi

| Tombol | Nama Teknis | Deskripsi Fungsi |
| :--- | :--- | :--- |
| **Atas/Bawah/Kiri/Kanan** | `Directional Pad (D-Pad)` / `Pan Buttons` | Menggeser (*panning*) tampilan dokumen ke arah spesifik tanpa mengubah tingkat zoom. |
| **Kaca Pembesar (+)** | `Zoom In` | Meningkatkan perbesaran dokumen untuk melihat detail lebih dekat. |
| **Kaca Pembesar (-)** | `Zoom Out` | Memperkecil tampilan dokumen agar area yang terlihat lebih luas. |
| **Panah Melingkar** | `Reset / Home View` | Mengembalikan tingkat perbesaran ke posisi default (misal: *Fit to Screen*) dan memusatkan kembali dokumen. |

---

## Spesifikasi Interaksi
* **Hover State:** Tombol harus memberikan feedback visual (misal: perubahan warna border atau background) saat kursor berada di atasnya.
* **Active/Focused State:** Seperti terlihat pada gambar, tombol yang aktif (dalam hal ini `Zoom Out`) ditandai dengan **High-Contrast Border (Orange)** untuk menunjukkan input pengguna saat ini.
* **Layout:** Menggunakan *grid system* 3x3 untuk menjaga ergonomi navigasi.

## Istilah Pencarian (Keyword) untuk Pengembangan
Jika memerlukan referensi pustaka (*library*) atau aset ikon, gunakan kata kunci berikut:
* *Document Viewer Toolbar*
* *Floating Navigation Widget*
* *SVG Pan-Zoom Controller*
* *Canvas Navigation UI*

---
**Catatan Implementasi:** Pastikan setiap tombol memiliki `aria-label` yang jelas untuk aksesibilitas, misalnya: `"Geser ke Atas"`, `"Perbesar Dokumen"`, atau `"Atur Ulang Tampilan"`.