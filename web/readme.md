# Civic.ai (Project Civic.ai)
Expose gaps. Empower citizens.

## Overview
Citizens often face inconsistencies in public infrastructure, such as roads failing soon after repairs or facilities existing only in official records. Although public spending data is available, it is often buried in complex documents, making verification difficult.

 (Civic.ai) is an AI-Powered Infrastructure Transparency Platform designed to eliminate the gap between government infrastructure records and on-ground reality. It acts as a digital anti-corruption layer for municipalities by combining Agentic AI, custom computer vision, geospatial data, and public documents into a single transparent system.

## Table of Contents
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Core Features](#core-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Team](#team)

## The Problem
There is a significant lack of transparency and accountability in public infrastructure projects. Key challenges include:
- Government spending data is not easily understandable for common citizens.
- No reliable way to verify whether funds were used properly.
- Infrastructure issues (e.g., potholes, broken facilities) are underreported or ignored.
- Authorities often operate without real-time public feedback or audit visibility.

## The Solution
We propose a progressive web application (PWA) that enables citizens to verify public infrastructure, audit government spending, and visualize real-world conditions through AI-driven insights and geospatial mapping.

## Core Features

### 1. Secure Citizen Reporting
- Highly secure identity verification using Aadhar and Phone mapping to prevent spam and fake reports.
- Capture infrastructure images with automatic GPS location and timestamp locking.

### 2. Agentic Audit Workflow
An autonomous, non-blocking multi-agent AI pipeline:
- **Vision Model (Custom):** Detects specific damages (e.g., potholes, structural cracks) and generates bounding boxes with confidence scores.
- **Retrieval:** Fetches official project data (budget, contractor, status) from the database.
- **Reasoning Engine (Gemini):** Analyzes the visual detections against the official records to verify claims, generate a Risk Level (High/Medium/Low), and provide actionable discrepancies.

### 3. Geospatial Transparency Map
- An interactive dashboard mapping all verified reports and government projects.
- Color-coded risk visualization (Green: Compliant, Yellow: Minor Mismatch, Red: High Risk).

### 4. Automated RTI & Complaint Generation
- Citizens can select their AI-verified infrastructure reports and instantly generate formal Right to Information (RTI) requests or complaint drafts.
- Directly routes issues to specific departments (MCGM, PWD, etc.) with attached evidence.

### 5. Admin Control Center
- Dedicated dashboard for municipal authorities.
- View AI insights, manage KYC verifications, track contractor performance, and update project statuses in real-time.

## System Architecture

1. **Information Capture:** Citizen uploads image via PWA.
2. **Initial Storage:** Data stored in Supabase (PostgreSQL & Storage). Return 200 OK to the client.
3. **Non-Blocking AI Audit:** - Background request triggers the custom object detection model.
   - Outputs feed into the LLM (Gemini) along with official project data.
4. **Data Aggregation:** Final risk scores and verdicts update the database.
5. **Visualization & Action:** Data reflects on the live Leaflet map and enables the RTI generation module.

## Tech Stack

**Frontend**
- Next.js (TypeScript, App Router)
- Tailwind CSS (Styling)
- Framer Motion (Animations)
- Leaflet.js / React-Leaflet (Geospatial Mapping)
- Lucide React (Icons)

**Backend & Database**
- Next.js API Routes (Serverless)
- Supabase (PostgreSQL Database)
- Supabase Auth & Storage Buckets

**Artificial Intelligence**
- Google Gemini API (Reasoning, Summary, Document Generation)
- Custom Object Detection Model (Python/Flask)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm
- Supabase Account
- Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/your-org/civic-ai.git](https://github.com/your-org/civic-ai.git)
   cd civic-ai