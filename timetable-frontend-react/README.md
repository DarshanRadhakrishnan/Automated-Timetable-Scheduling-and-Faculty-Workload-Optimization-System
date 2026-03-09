# Timetable Management System - React Frontend

A modern, professional React dashboard for managing university/corporate timetables with conflict detection and resolution.

## 🚀 Features

- **📊 Dashboard**: Real-time statistics and system health monitoring
- **📅 Schedule View**: Interactive timetable grid with day/time slot layout
- **⚠️ Conflict Management**: Visual conflict detection and auto-resolution
- **⚙️ Settings**: Customizable preferences and configurations
- **🎨 Modern UI/UX**: 
  - Dark mode support
  - Smooth animations and transitions
  - Responsive design
  - Glassmorphism effects
  - Gradient accents

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Font**: Inter (Google Fonts)

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## 🔌 Backend Integration

The frontend connects to the backend API at `http://localhost:5000/api`. Make sure your backend server is running before starting the frontend.

### API Endpoints Used:
- `GET /api/timetable/versions` - Fetch all timetable versions
- `GET /api/timetable?proposalId=X` - Fetch specific timetable
- `POST /api/timetable/generate` - Generate new timetable
- `POST /api/timetable/conflicts/detect` - Detect conflicts
- `POST /api/timetable/conflicts/resolve` - Resolve conflicts

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx       # Navigation sidebar
│   │   └── Header.jsx         # Top header with search
│   ├── timetable/
│   │   └── TimetableGrid.jsx  # Main timetable grid
│   └── views/
│       ├── Dashboard.jsx      # Dashboard view
│       ├── Schedule.jsx       # Schedule management
│       ├── Conflicts.jsx      # Conflict management
│       └── Settings.jsx       # Settings page
├── store/
│   └── timetableStore.js      # Zustand state management
├── App.jsx                    # Main app component
├── main.jsx                   # Entry point
└── index.css                  # Global styles with Tailwind
```

## 🎨 Design System

### Colors
- **Primary**: Blue shades (for main actions and highlights)
- **Accent**: Teal shades (for secondary highlights)
- **Status Colors**: Green (success), Red (conflicts), Yellow (warnings)

### Components
- **Cards**: Soft shadows with rounded corners
- **Buttons**: Gradient backgrounds with hover effects
- **Grid Cells**: Color-coded by status (scheduled, conflict, free)

## 🔑 Key Features Explained

### Timetable Grid
- **Days**: Monday to Friday (columns)
- **Time Slots**: 8 AM - 5 PM (rows)
- **Interactive Cells**: Hover to see details (professor, room, course)
- **Conflict Highlighting**: Red borders and badges for conflicts
- **Responsive**: Scrollable on smaller screens

### Conflict Detection
- Automatic detection when viewing timetables
- Visual indicators on problematic slots
- Detailed conflict information with affected entries
- One-click auto-resolution

### Version Management
- Multiple timetable versions with quality scores
- Easy switching between versions via dropdown
- Ranking based on optimization scores

## 🚦 Getting Started

1. **Ensure Backend is Running**:
   ```bash
   cd ../timetable-backend-mern
   npm start
   ```

2. **Start Frontend**:
   ```bash
   npm run dev
   ```

3. **Access the App**:
   Open `http://localhost:5173` in your browser

4. **Generate Timetable**:
   - Navigate to "Schedule" view
   - Click "Generate New" button
   - View the generated timetable in the grid

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile devices adapt with horizontal scrolling for the timetable grid

## 🌙 Dark Mode

Toggle dark mode using the moon/sun icon in the header. Dark mode preferences are automatically applied to all components.

## 🔄 State Management

Using Zustand for lightweight, efficient state management:
- Centralized timetable data
- Version management
- Conflict tracking
- Loading states
- Error handling

## 📄 License

This project is part of the Automated Timetable Scheduling and Faculty Workload Optimization System.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!
