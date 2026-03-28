# Supabase Database Schema – Integrity Platform

This document describes the **database schema** used in the Integrity / Civic Monitoring platform built using **Supabase (PostgreSQL)**. The schema supports citizen reporting, government project tracking, AI-based audits, and legal documentation.

---

## 🧠 System Overview

The platform enables:
- Citizens to report issues related to government projects
- AI systems to analyze reports and assess integrity risks
- Auditors to generate audit results
- Storage of legal documents related to reports
- Central tracking of government projects

---

## 🗂️ Schema: `public`

All tables belong to the `public` schema.

---

## 📌 Tables

### 1️⃣ `citizen_reports`
Stores reports submitted by citizens.

**Columns**
- `id` (uuid, PK)
- `user_id` (uuid → auth.users.id)
- `project_id` (uuid → projects.id)
- `image_url` (text)
- `user_notes` (text)
- `lat` (float8)
- `lng` (float8)
- `created_at` (timestamptz)

**Purpose**
- Core input layer for the platform
- Captures geotagged issues with evidence

---

### 2️⃣ `projects`
Represents monitored projects.

**Columns**
- `id` (uuid, PK)
- `title` (text)
- `description` (text)
- `budget_allocated` (int8)
- `lat` (float8)
- `lng` (float8)
- `status_claimed` (text)
- `created_at` (timestamptz)

**Purpose**
- High-level abstraction for projects
- Linked to citizen reports

---

### 3️⃣ `government_projects`
Stores official government project data.

**Columns**
- `id` (uuid, PK)
- `project_name` (text)
- `budget` (numeric)
- `contractor` (text)
- `status` (text)
- `latitude` (float8)
- `longitude` (float8)
- `category` (text)
- `updated_at` (timestamptz)

**Purpose**
- Source of truth for official projects
- Used for validation and comparison

---

### 4️⃣ `audits`
Stores AI-generated audit metadata for reports.

**Columns**
- `id` (uuid, PK)
- `report_id` (uuid → citizen_reports.id)
- `integrity_score` (int4)
- `risk_level` (text)
- `ai_analysis` (text)
- `created_at` (timestamptz)

**Purpose**
- AI-driven integrity assessment
- Feeds dashboards and alerts

---

### 5️⃣ `audit_results`
Detailed audit findings.

**Columns**
- `id` (uuid, PK)
- `report_id` (uuid)
- `project_id` (uuid)
- `risk_level` (text)
- `discrepancies` (jsonb)
- `ai_verdict` (text)
- `created_at` (timestamptz)

**Purpose**
- Structured AI conclusions
- Used for review and escalation

---

### 6️⃣ `legal_documents`
Stores legal or compliance documents linked to reports.

**Columns**
- `id` (uuid, PK)
- `user_id` (uuid)
- `report_id` (uuid)
- `type` (text)
- `title` (text)
- `content` (text)
- `status` (text)
- `created_at` (timestamptz)

**Purpose**
- Legal follow-ups
- RTI, notices, compliance tracking

---

## 🔗 Relationships

- `citizen_reports.user_id` → `auth.users.id`
- `citizen_reports.project_id` → `projects.id`
- `audits.report_id` → `citizen_reports.id`
- `audit_results.report_id` → `citizen_reports.id`
- `audit_results.project_id` → `projects.id`
- `legal_documents.report_id` → `citizen_reports.id`

---

## 🔐 Security & Access

- Supabase Row Level Security (RLS) can be applied per table
- `auth.users` is used for authentication
- Policies can restrict access by user roles (citizen, auditor, admin)

---

## 🚀 Use Cases Supported

- Citizen issue reporting with location & images
- AI-based corruption & integrity detection
- Government project verification
- Legal escalation workflows
- Analytics dashboards for authorities

---

## 📦 Tech Stack

- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Frontend**: Next.js
- **AI Layer**: External AI tools (analysis & scoring)

---

## ✅ Status

This schema is **production-ready**, scalable, and suitable for hackathons as well as real-world civic tech deployments.

---

📌 *Auto-generated from Supabase Schema Visualizer*

