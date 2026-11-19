# Plannest SaaS Hub — Master Control & OTA Distribution Center

> **Central Multi-Tenant SaaS Administration, Store Licensing & Terminal OTA Updates Server**  
> Deployed on Cloudflare Pages • Built with React & Vite • Serves Global Store Distribution

---

## 📌 Overview

**Plannest SaaS Hub** (`pos-saas-hub`) is the master management portal and distribution backbone for the entire Plannest retail ecosystem. It acts as the central authority for store onboarding, software licensing, single-terminal hardware locking (MAC / UUID), over-the-air (OTA) terminal software updates, and centralized operator documentation.

---

## 🌟 Core Responsibilities

1. **Multi-Store Tenant Management**:
   - Register and manage client organizations, retail chains, and individual store outlets.
   - Assign unique store identifiers (`STORE-001`, `STORE-002`, etc.) and database partitions.
   - Configure active subscription tiers, module permissions, and billing cycles.

2. **Terminal Hardware Licensing & Single-Machine Lock**:
   - Issues cryptographic license keys for Windows desktop installations.
   - Enforces 1-Machine-1-License binding by validating the physical terminal's Network MAC Address and Motherboard/BIOS UUID upon first boot.
   - Provides SuperAdmin utilities to de-authorize, transfer, or re-bind hardware licenses when a store upgrades physical counter hardware.

3. **OTA Distribution Center (One-Click In-App Updates)**:
   - Houses the canonical `version.json` specifying the latest production release version, release notes, and SHA-256 integrity checksums.
   - Hosts the highly optimized, compact `plannest-terminal.zip` (1.47 MB differential runtime package) enabling local counter terminals to upgrade without re-downloading heavy dependencies or erasing SQLite database files.
   - Provides the Windows graphical installer (`PlannestPOS-Setup.exe`).

4. **Centralized User & Operations Guide**:
   - Hosts the visual operations manual at `/help/index.html`.
   - Accessible by all client terminals and cloud managers through responsive, printable documentation.

---

## 📁 Repository Structure

```
pos-saas-hub/
├── public/
│   ├── help/
│   │   ├── index.html          # Canonical visual operations guide
│   │   └── screenshots/        # High-resolution UI screenshots
│   ├── plannest-terminal.zip   # Latest production differential OTA update package
│   ├── version.json            # Central version registry & OTA metadata
│   └── favicon.ico
├── src/
│   ├── components/             # SuperAdmin dashboard components
│   ├── App.jsx                 # Main application controller
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

## 🚀 Development & Deployment

### Quick Setup

```bash
cd E:\Plannest\pos-saas-hub
npm install
npm run dev
```

### Production Deployment

The SaaS Hub is built with Vite and deployed directly to **Cloudflare Pages**:
```bash
npm run build
```
- Continuous deployment automatically triggers on git push to `origin main`.
- Edge caching on Cloudflare ensures lightning-fast delivery of `version.json` and `plannest-terminal.zip` to retail terminals nationwide.

---

## 🔄 OTA Release Workflow (Publishing a New Terminal Version)

When releasing a new terminal version (e.g. from `v2.2.8` to `v2.2.9` / `v2.3.0`):

1. **Stage Runtime Artifacts**:
   - Bundle updated frontend `dist/` and backend runtime scripts into `plannest-terminal.zip`.
2. **Update Metadata**:
   - Update `public/version.json`:
     ```json
     {
       "version": "2.3.0",
       "releaseDate": "2026-11-16",
       "mandatory": false,
       "downloadUrl": "https://poshub.plannestapp.com/plannest-terminal.zip",
       "notes": [
         "Two-line navigation wrapping for cleaner sidebar display",
         "Customer Loyalty Program UI parity with Cloud Manager",
         "Controlled Special Discounts with cart activation checkbox",
         "Cloudinary CDN vs Local Terminal Image storage parity"
       ]
     }
     ```
3. **Commit & Push**:
   - Pushing changes to `pos-saas-hub` immediately makes the update available to all counter terminals when they click **"Check for Update"** in their top bar.
