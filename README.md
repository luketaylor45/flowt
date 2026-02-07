# 🌊 Flowt

**Flowt** is a modern, sleek, and self-hosted project management application designed for teams who value data ownership and a premium user experience. Built with performance and aesthetics in mind, Flowt provides a comprehensive suite of tools to manage your projects from conception to completion.
---

## ✨ Features

### 📋 Project & Task Management
- **Kanban Boards**: Visualize your workflow with dynamic, drag-and-drop boards.
- **Task Hierarchy**: Break down complex tasks into manageable subtasks.
- **Rich Task Details**: Support for Markdown descriptions, labels, and due dates.
- **Dependencies**: Link tasks to visualize blockers and critical paths.

### 👥 Team Collaboration
- **Role-Based Access**: Granular permissions via Admin and Member roles.
- **Task Assignment**: Clear ownership with primary assignees for every task.
- **Activity Streams**: Real-time audit logs of changes within every project and task.

### 📊 Insights & Organization
- **Unified Dashboard**: Quick overview of project stats, upcoming deadlines, and recent activity.
- **Timeline View**: Track project progress over time.
- **Global Search**: Find tasks and projects instantly.
- **Dark Mode**: Fully immersive dark and light themes.

---

## 🚀 Tech Stack

Flowt is built on a cutting-edge stack for maximum reliability and speed:

- **Frontend**: [Next.js 15/16](https://nextjs.org/) (App Router), [React 19](https://reactjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Components**: [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/)
- **Database**: [Prisma](https://www.prisma.io/) (SQLite by default, compatible with PostgreSQL/MySQL)
- **State Management**: Server Actions & Next.js Cache

---

## 🛠️ Installation

### Prerequisites
- [Node.js 18.x](https://nodejs.org/) or higher
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 1. Clone the repository
```bash
git clone https://github.com/luketaylor45/flowt.git
cd flowt
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file and update your `SESSION_SECRET`:
```bash
cp .env.example .env
```
*Note: Ensure `SESSION_SECRET` is a long, random string.*

### 4. Database Setup
Initialize the database and generate the Prisma client:
```bash
npx prisma db push
```

### 5. Build for Production
```bash
npm run build
```

---

## 🏁 Getting Started

### Initial Setup
Once the application is running, navigate to `/setup` in your browser to:
1. Create the initial **Admin Account**.
2. Configure basic system settings.
3. Initialize default project templates.

### Running the App
**Production Mode:**
```bash
npm start
```

**Development Mode:**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 📖 Usage Instructions

### Creating your first project
1. Log in and head to the **Dashboard**.
2. Click on **"View All Projects"** or the **"+"** icon in the sidebar.
3. Enter a title and select a template (or start from scratch).

### Managing Tasks
- **Drag & Drop**: Move tasks between columns (To Do, In Progress, Done) to update status.
- **Deep Dive**: Click a task to open the **Task Detail Modal**. Here you can add subtasks, set due dates, and link dependencies.
- **Labeling**: Use the **"Manage Labels"** option in the sidebar to create color-coded tags for your board.

### Admin Settings
Admins can access the **Settings** gear in the sidebar to:
- Manage Users and Groups.
- Adjust global system configurations.
- View system-wide activity logs.

---

## 🐳 Docker Deployment

Flowt is ready for containerized deployment:

```bash
docker build -t flowt .
docker run -p 3000:3000 --env-file .env flowt
```

---

## 📄 License
Flowt is released under the [MIT License](LICENSE).
