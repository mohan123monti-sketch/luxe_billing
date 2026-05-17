# LUXE - Modern POS & Billing System

LUXE is a premium, modern Point of Sale (POS) and Billing application designed for retail boutiques and stores. It features a sleek, typography-driven user interface and provides everything needed to manage a retail business, from inventory and customer tracking to billing and analytics.

## Features

- **Point of Sale (POS) Billing:**
  - Fast, intuitive billing interface.
  - Support for multiple payment methods (Cash, Card, UPI).
  - Built-in thermal-style receipt generation and printing.
  - Automatic stock deduction upon checkout.
  - Add extra discounts and calculate GST dynamically.

- **Inventory Management:**
  - Add, edit, and track products.
  - Monitor stock levels and receive low-stock alerts.
  - Categorize products and manage pricing/discounts.

- **Customer CRM:**
  - Automatically create customer profiles during checkout.
  - Track customer purchase history, including products purchased.
  - Monitor total customer spend and last visit date.
  
- **Analytics Dashboard:**
  - Real-time insights into today's and this week's revenue.
  - Visual charts for weekly revenue trends and best-selling products.
  - Track total products and lifetime customers.

- **Store Settings:**
  - Configure shop name, address, contact details, and GSTIN.
  - Set default GST rates and customize the receipt footer message.

## Tech Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS v4
- Recharts (for analytics)
- Lucide React (for icons)
- React Router DOM

**Backend:**
- Node.js & Express
- SQLite (via `better-sqlite3`)
- Drizzle ORM (for type-safe database queries)
- JSON Web Tokens (JWT) & bcryptjs (for authentication)

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- npm or yarn

### Installation

1. Install all dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Ensure you have a `.env` file in the root directory. You can copy the template if one exists:
   ```bash
   cp .env.example .env
   ```

3. Run the application:
   ```bash
   npm run dev
   ```
   This will start both the backend server and the frontend Vite development server concurrently on `http://localhost:3000`.

### Building for Production

To build the application for production, run:
```bash
npm run build
```
This will compile the frontend assets into the `dist` directory and bundle the backend code. You can then start the production server with:
```bash
npm start
```

## Project Structure
- `/src` - Frontend React application (Pages, Components, Context).
- `/server` - Backend Node.js/Express server (Routes, DB Schema, Middleware).
- `/scripts` - Utility scripts (e.g., seeding the database).

## License
Proprietary - All rights reserved.
