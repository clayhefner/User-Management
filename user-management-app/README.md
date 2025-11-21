# User Management Web App PoC

A React-based user management web application built with Ant Design.

## Features

- **Top Navigation Bar** with user avatar and dropdown menu
- **Left Sidebar Navigation** for easy page navigation
- **Users Management Page** with a comprehensive data table including:
  - Full Name
  - Email
  - Phone
  - Role (with color-coded tags)
  - Invited Date
  - SSO Status
  - Active/Inactive Status
  - Lock/Unlock Status
  - Action buttons (Edit, Lock/Unlock, Delete)

## Table Features

- Search functionality across name, email, and phone
- Sortable columns
- Filterable by role, SSO status, account status, and lock status
- Pagination with configurable page size
- Responsive design with horizontal scrolling for smaller screens

## Tech Stack

- React 18
- Vite
- Ant Design (antd)
- Ant Design Icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation & Running

1. Navigate to the project directory:
   ```bash
   cd user-management-app
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:5173/
   ```

## Project Structure

```
user-management-app/
├── src/
│   ├── data/
│   │   └── mockUsers.js       # Sample user data
│   ├── pages/
│   │   └── Users.jsx          # Users management page
│   ├── App.jsx                # Main application layout
│   ├── App.css                # Application styles
│   ├── index.css              # Global styles
│   └── main.jsx               # Application entry point
├── package.json
└── README.md
```

## Sample Data

The application includes 12 sample users with varying:
- Roles (Super Admin, Admin, Manager, User, Viewer)
- Status (Active, Inactive, Pending Verification)
- Lock status
- SSO enabled/disabled
- Verified/unverified accounts

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Future Enhancements

- Add user creation/editing functionality
- Implement user deletion with confirmation
- Add user lock/unlock functionality
- Integrate with backend API
- Add authentication and authorization
- Implement role-based access control
