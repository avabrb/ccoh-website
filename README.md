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
- Backend / Database: Firebase (Firestore, Authentication, Storage), Stripe
- Authentication: Firebase Authentication
- Hosting: Vercel
- Calendar Integration: Google Calendar API

## Project Structure

/src
  /components      # Reusable UI components
  /admin           # Admin dashboard page
  /home            # Home page (model, view, and view model)
  /login           # Authentication system
  /members         # Members page and database
  /exec-comm       # Executive committee page
  /program         # Events page (upcoming events calendar and event photos)
  /national-days   # National days page
  /payment         # Payment integrated system
  /assets          # Images and static files
  App.jsx          # Main app entry
  App.css          # Main app stylings
  firebase.js      # Firebase set-up
  main.jsx         # Render root
  index.css        # Root styling

## Environment Variables

To run the project locally, create a .env file with the following keys:

VITE_FB_API_KEY=your_api_key
VITE_AUTH_DOMAIN=your_auth_domain
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_storage_bucket
VITE_MSG_ID=your_sender_id
VITE_APP_ID=your_app_id
VITE_MEASUREMENT_ID=your_measurement_id
VITE_STRIPE_SECRET_KEY=your_stripe_key
VITE_STRIPE_PUBLISH=your_publish_id
VITE_FETCH_URL=your_fetch_url
VITE_API_KEY=your_calendar_api_key
VITE_CALENDAR_ID=your_calendar_id

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

