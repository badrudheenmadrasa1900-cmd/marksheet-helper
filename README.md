# Badrudheen Madrasa - Marksheet Helper & Public Result Portal

A lightweight, modern, and mobile-first examination management application and student result portal designed for madrasas and schools.

It features a 3-tier access system:
1. **Public Examination Result Portal (`/`):** A clean, student-friendly mobile portal optimized for students aged 5–15 and parents to check results using their class and register number.
2. **Teacher Portal (`/teacher`):** Dedicated class marksheet entry, Excel/CSV importer, Gemini AI marksheet photo scanner, and cloud synchronization.
3. **Admin Portal (`/admin`):** Complete management of teachers, class permissions (Classes 1–12), subjects, and institutional data.

---

## 🌟 Key Features

### 1. 🎓 Public Student Result Portal (`/`)
- **Kid-Friendly & Mobile-First UX:** Tailored for Apple iOS (Safari) and Android (Chrome) with large 54px touch targets, safe-area support, and readable fonts (*Plus Jakarta Sans* & *Amiri*).
- **Instant Result Search:** Students select their class (Class 1 to 12) and enter their unique Register Number to see their result card.
- **Detailed Marksheet Card:** Displays Student Name (English & Arabic), Parent/Guardian name, Madrasa Name, Subject-wise scores, Grand Total, and vibrant celebratory status badges (*Pass*, *Distinction*, etc.).
- **Zero Privacy Leak:** Public visitors cannot see teacher or admin links on the result page.

### 2. 🔐 3-Tier Role & Access Control
- **Headmaster / Main Admin:**
  - Create and manage teacher accounts.
  - Assign specific classes (Classes 1–12) to each teacher.
  - Global overview and export capabilities.
- **Teachers:**
  - Access only their assigned classes.
  - Add students with auto-generated or custom roll/register numbers.
  - Rapid inline daily marks entry with keyboard arrow navigation.
  - 1-Click Cloud Sync to publish student marks to Supabase.
- **Public:**
  - Read-only student-specific result lookup without login.

### 3. 📚 Standard Madrasa Syllabus & Subjects
Includes quick one-click dropdown options for official curriculum subjects with English and Arabic names:
- **FIQH** (الفقه)
- **LISANUL QUR'AN** (لسان القرآن)
- **DUROOSUL IHSAN** (دروس الإحسان)
- **THAREEKH** (التّاريخ)
- **QUR'AN, HIFZ** (القرآن والحفظ)
- **THAFSEER** (التّفسير)
- **LISANUL QUR'AN - THAJVEED** (التّجويد)
- **AQEEDA** (العقيدة)

### 4. ⚡ Smart Import & AI Scanner
- **1-Click Excel / CSV Import:** Bulk upload 150+ students with auto-column matching and instant preview.
- **Gemini Flash AI Photo Scanner:** Capture or upload physical marksheet photos to automatically parse student names, roll numbers, and scores using multimodal AI.

### 5. 🖨️ Professional Export & Printing
- **PDF Export:** Clean landscape A4 marksheets with institution headers, pass/fail percentages, and signature blocks.
- **Excel (.xlsx) Export:** Full spreadsheet download with student totals and ranks.
- **Print-Ready Layout (`@media print`):** Formatted for direct A4 paper printing.

---

## 🏛️ Architecture

Built on a clean **Model-View-Controller (MVC)** pattern with Supabase cloud integration and local fallback:

```
Marksheet helper/
├── api/
│   └── index.py                # Vercel Serverless Function / Gemini AI backend
├── templates/
│   ├── index.html              # Admin & Teacher Portal Template
│   └── result.html             # Public Examination Result Portal Template
├── static/
│   ├── css/
│   │   └── style.css           # Minimal modern styles, iOS/Android UI & Print CSS
│   ├── js/
│   │   ├── models/
│   │   │   ├── SupabaseService.js  # Supabase REST client (Profiles & Students)
│   │   │   ├── StorageModel.js     # Session and isolated local storage vault
│   │   │   └── MarksheetModel.js   # Calculation engine (Totals, Ranks, Status)
│   │   ├── views/
│   │   │   ├── AuthView.js         # Staff sign-in & registration UI
│   │   │   ├── DashboardView.js    # Class overview & teacher permissions UI
│   │   │   ├── MarksheetView.js    # Sheet grid, daily entry, AI & Excel import
│   │   │   └── ExportView.js       # PDF and Excel generator
│   │   ├── controllers/
│   │   │   ├── AuthController.js
│   │   │   ├── ClassController.js
│   │   │   └── MarksheetController.js
│   │   └── app.js              # Application entry & router
│   └── vendor/
│       ├── jspdf.umd.min.js
│       ├── jspdf.plugin.autotable.min.js
│       └── xlsx.full.min.js
├── app.py                      # Local development Flask server
├── vercel.json                 # Vercel deployment routing configuration
└── requirements.txt            # Python dependencies
```

---

## 🚀 How to Run Locally

### Option 1: Using Flask (Recommended)
```bash
# 1. Activate Virtual Environment
source .venv/bin/activate

# 2. Run Application
python app.py
```
Open in your browser:
- **Public Result Portal:** [http://localhost:5001/](http://localhost:5001/)
- **Teacher & Admin Portal:** [http://localhost:5001/admin](http://localhost:5001/admin) (or `/teacher`)
  - *Default Admin:* User: `admin` | Password: `admin123`

---

## 🌐 Deployment on Vercel

The application is pre-configured for instant zero-config deployment on Vercel:

1. Push your changes to GitHub.
2. Link your repository at [vercel.com](https://vercel.com).
3. The live deployment will route:
   - `https://your-domain.vercel.app/` ➔ **Public Student Result Portal**
   - `https://your-domain.vercel.app/admin` ➔ **Admin & Teacher Portal**
   - `https://your-domain.vercel.app/teacher` ➔ **Teacher Login Portal**
   - `https://your-domain.vercel.app/api/*` ➔ **Gemini AI Scanner Function**

---

## 🔒 Security & Data Privacy
- Student results are hosted on a secure Supabase cloud database with Row-Level Security (RLS) enabled.
- Teacher credentials and admin privileges are protected under role-based authorization.
- Backups can be downloaded as JSON files anytime from the Teacher/Admin dashboard.

---

## 📊 Analytics & Tag Management (`gganalatics`)
Google Tag Manager / Google Analytics integration is embedded across portal HTML pages:
- **GTM ID:** `GTM-T8F8LM6B`
- **Removal Keyword:** `gganalatics`
  - *Trigger Command:* Whenever the user asks to remove `"gganalatics"` or *"remove gganalatics"*, the assistant will automatically clean and purge the Google Tag Manager scripts from all pages.
