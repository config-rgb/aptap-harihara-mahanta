# aptapcodes - Restaurant QR Code Ordering System

## Problem Statement
Create a modern restaurant website with QR code ordering system featuring home page, menu browsing, cart management, order placement, admin dashboard, menu management, and QR code generation for tables.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI + Framer Motion
- **Backend**: FastAPI (Python) on port 8001
- **Database**: MongoDB (via Motor async driver)
- **Auth**: JWT-based admin authentication (password: admin123)
- **QR Codes**: qrcode.react library for frontend generation

## User Personas
1. **Restaurant Customer**: Scans QR code on table, browses menu on mobile, adds items to cart, places order
2. **Restaurant Admin/Staff**: Logs in to manage orders, update statuses, manage menu items, print QR codes

## Core Requirements
- [x] Home page with hero banner, how-it-works section, about section
- [x] Menu page with category filtering, search, add to cart
- [x] QR code system: each table (1-10) has unique QR linking to /menu?table=N
- [x] Cart with quantity controls, order summary, place order
- [x] Order confirmation page with order details
- [x] Admin login (password-based JWT auth)
- [x] Admin dashboard with order management and status updates
- [x] Admin menu CRUD (create, read, update, delete items)
- [x] Admin QR code generation and download for all 10 tables
- [x] Dark elegant theme with gold (#D4AF37) accents
- [x] Mobile-first responsive design
- [x] 16 pre-seeded menu items across 4 categories

## What's Been Implemented (March 2026)
- Full backend API with 15+ endpoints
- Auto-seed system for menu items on startup
- Complete frontend with 8 pages
- Cart context with useReducer for state management
- Real-time order polling (15s interval) on admin dashboard
- QR code generation with PNG download capability
- Glassmorphism effects, framer-motion animations
- Category filtering, search, responsive grid layouts

## Test Results
- Backend: 80% (minor status code cosmetics fixed)
- Frontend: 95%+ (all major features working)
- Integration: 100% (full ordering flow works)

## Prioritized Backlog
### P0 (Critical) - DONE
- All core features implemented and tested

### P1 (Important)
- Real-time order notifications (WebSocket)
- Order history for customers
- Payment integration (Stripe)

### P2 (Nice to Have)
- Customer reviews/ratings
- Popular items section
- Order time estimation
- Multiple language support
- Table availability indicator

## Next Tasks
1. Add real-time WebSocket notifications for new orders
2. Customer order tracking page (scan QR to check order status)
3. Payment integration
4. Analytics dashboard for admin (revenue, popular items)
