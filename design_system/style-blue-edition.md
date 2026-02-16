# 📘 Antigravity Design System
> **Version:** 1.0 (Blue Edition)  
> **Standardized by:** Gemini AI  
> **Last Updated:** 16 Feb 2026

---

## 1. Filosofi Desain
Antigravity mengusung tema **Modern SaaS Cloud**. Fokus utama adalah pada kejelasan informasi (*Information Clarity*), kedalaman visual menggunakan efek *Glassmorphism*, dan penggunaan warna biru yang memberikan kesan profesional, stabil, dan tepercaya.

---

## 2. Palet Warna (Deep Blue & Sky)
Warna ungu pada referensi asli telah digantikan dengan gradasi biru yang lebih segar.

| Elemen | Warna | Kode Hex | Visual |
| :--- | :--- | :--- | :--- |
| **Primary Blue** | Deep Sea | `#0052D4` | ![#0052D4](https://via.placeholder.com/15/0052D4?text=+) |
| **Accent Blue** | Electric Sky | `#4364F7` | ![#4364F7](https://via.placeholder.com/15/4364F7?text=+) |
| **Background** | Ghost White | `#F8FAFC` | ![#F8FAFC](https://via.placeholder.com/15/F8FAFC?text=+) |
| **Surface/Card** | Pure White | `#FFFFFF` | ![#FFFFFF](https://via.placeholder.com/15/FFFFFF?text=+) |
| **Danger/Action** | Soft Red | `#FF4D4D` | ![#FF4D4D](https://via.placeholder.com/15/FF4D4D?text=+) |

---

## 3. Komponen UI Standar

### 🛡️ A. System Protection Card (Glassmorphism)
Kartu utama di sisi kiri menggunakan efek transparan di atas gradien biru.
* **Background:** `linear-gradient(135deg, #0052D4 0%, #4364F7 100%)`
* **Glass Inset:** `rgba(255, 255, 255, 0.15)` dengan `backdrop-filter: blur(8px)`
* **Border Radius:** `20px`

### 📂 B. Recovery Snapshot List
Daftar file menggunakan layout baris minimalis.
* **Icon:** Database icon dengan background bulat `#EFF6FF` (biru sangat muda).
* **Button:** "Restore" menggunakan font tebal dengan warna `#4364F7` dan ikon putar balik.
* **Hover State:** Baris berubah warna menjadi `#F1F5F9` saat kursor berada di atasnya.

---

## 4. Implementasi Kode (CSS Global)

Gunakan variabel CSS ini di root project Anda untuk menjaga konsistensi:

```css
:root {
  --ag-primary: #0052D4;
  --ag-accent: #4364F7;
  --ag-bg: #F8FAFC;
  --ag-white: #FFFFFF;
  --ag-glass: rgba(255, 255, 255, 0.15);
  --ag-radius: 18px;
}

.ag-glass-card {
  background: var(--ag-glass);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--ag-radius);
}
```

---

## 5. Typography Standard
Fokus pada keterbacaan tinggi dan nuansa modern (Geist Sans).

| Level | Style | Usage |
| :--- | :--- | :--- |
| **H1** | `text-4xl font-black tracking-tighter` | Main Page Titles |
| **H2/CardTitle** | `text-xl font-bold tracking-tight` | Section/Card Headers |
| **Label** | `text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80` | Form Field Labels |
| **Body/Input** | `text-sm font-medium` | General Text & Inputs |
| **Mono** | `font-mono tracking-tight` | Codes, IDs, Data Stats |