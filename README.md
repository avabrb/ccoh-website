# Consular Corps of Houston Website

This project is a web platform built for the Consular Corps of Houston (CCoH) to improve the management of members, events, and organizational activities. Developed with React and deployed on Vercel, the website provides an integrated and user-friendly system for both members and administrators.

## Features

### Member Management
- Secure user authentication and profiles
- Member database with searchable and filterable entries
- Individual profile pages with contact information
- Admin tools to manage member details and update records

### Event Integration
- Google Calendar integration for upcoming events and activities
- Event photo feed in masonry grid display, with integrated photo upload management
- Events automatically displayed and ordered by date
- Admins can update and synchronize events directly

### Payments
- Support for yearly membership fee payments
- Admin dashboard to track payment status and send reminders
- Secure integration with payment processing tools

### Administration
- Role-based access control for admins and members
- Admin dashboard for:
  - Managing member registrations and renewals
  - Approving new accounts
  - Tracking payments and member activity
  - Uploading official club information

### General Information
- Public-facing sections for:
  - General information about the Consular Corps
  - Mission and activities
  - Upcoming events overview
  - National holidays
  - Member uploaded photos

## Tech Stack

- Frontend: React, Vite
- Styling: CSS
- Backend / Database: Firebase (Firestore, Authentication, Storage)
- Authentication: Firebase Authentication
- Hosting: Vercel
- Calendar Integration: Google Calendar API

## Project Structure

/src
  /components      # Reusable UI components
  /pages           # Main pages (Members, Events, Profile, Admin, etc.)
  /login           # Authentication system
  /exec-comm       # Executive committee pages
  /assets          # Images and static files
  App.js           # Main app entry
  index.js         # Render root

## Environment Variables

To run the project locally, create a .env file with the following keys:

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_CALENDAR_API_KEY=your_calendar_api_key
VITE_GOOGLE_CALENDAR_ID=your_calendar_id

## Getting Started

1. Clone the repository:
   git clone https://github.com/your-repo/ccoh-website.git
   cd ccoh-website

2. Install dependencies:
   npm install

3. Run locally:
   npm run dev

4. Open http://localhost:5173 to view it in the browser.

## Deployment

The project is automatically deployed via Vercel:
https://ccoh-website.vercel.app

