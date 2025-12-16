# VirtuKey Employee Portal

A modern employee portal for VirtuKey Technologies featuring project management, meeting scheduling, and collaboration tools.

## Features

- **Authentication**: Secure login and registration system
- **Dashboard**: Overview of current projects, upcoming projects, and meetings
- **Projects**: Track current and upcoming projects with details
- **Meetings**: View and manage upcoming meetings
- **Comments**: Add comments to projects and meetings for collaboration
- **Modern UI**: Clean, minimal design matching VirtuKey's brand theme

## Tech Stack

### Backend
- Node.js with Express
- SQLite database
- JWT authentication
- RESTful API

### Frontend
- React with Vite
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install all dependencies:
```bash
npm run install-all
```

2. Set up environment variables:
```bash
cd server
cp .env.example .env
# Edit .env and set your JWT_SECRET
```

3. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

### Manual Start

If you prefer to run them separately:

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

## Usage

1. Navigate to `http://localhost:3000`
2. Register a new account or login with existing credentials
3. View your dashboard with projects and meetings
4. Click on any project or meeting to view/add comments

## Project Structure

```
.
├── server/           # Backend API
│   ├── routes/       # API routes
│   ├── middleware/   # Auth middleware
│   └── database.js   # Database setup
├── client/           # Frontend React app
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── components/ # Reusable components
│   │   └── context/   # React context
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/current` - Get current projects
- `GET /api/projects/upcoming` - Get upcoming projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Meetings
- `GET /api/meetings` - Get all meetings
- `GET /api/meetings/upcoming` - Get upcoming meetings
- `GET /api/meetings/:id` - Get single meeting
- `POST /api/meetings` - Create meeting
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting

### Comments
- `GET /api/comments?project_id=:id` - Get comments for project
- `GET /api/comments?meeting_id=:id` - Get comments for meeting
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## Deployment on Render

### Prerequisites
- A Render account (sign up at https://render.com)
- Your GitHub repository connected to Render

### Deployment Steps

1. **Create a new Web Service on Render:**
   - Go to your Render dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `https://github.com/ano4l/VKTportal.git`

2. **Configure Build & Start Commands:**
   - **Build Command:** `yarn install && cd server && yarn install && cd ../client && yarn install && yarn build`
   - **Start Command:** `yarn start`
   - **Environment:** `Node`

3. **Set Environment Variables:**
   Add these in the Render dashboard under "Environment":
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-secret-key-here
   CORS_ORIGIN=https://your-app-name.onrender.com
   DATABASE_PATH=/opt/render/project/src/server/database.sqlite
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application
   - Your app will be available at `https://your-app-name.onrender.com`

### Using Yarn Locally

If you prefer using Yarn instead of npm:

```bash
# Install Yarn globally (if not already installed)
npm install -g yarn

# Install all dependencies
yarn install
cd server && yarn install && cd ../client && yarn install

# Start development
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

## License

© 2025 VirtuKey Technologies. All rights reserved.

