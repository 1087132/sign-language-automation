# Gesture Automation Pipeline Setup

This project is split into a React frontend and a Node.js Express backend. Follow these instructions to run both locally.

## 1. Backend Setup
1. Create a new folder named `backend` and place `server.js` inside it.
2. Open a terminal in the `backend` folder and run:
   ```bash
   npm init -y
   npm install express cors dotenv @google/genai
   ```
3. Open `package.json` in the backend folder and add `"type": "module"` so it looks like this:
   ```json
   {
     "name": "backend",
     "version": "1.0.0",
     "type": "module",
     "main": "server.js",
     ...
   ```
4. Create a file named `.env` in the backend folder and add your Gemini API key:
   ```env
   PORT=3001
   GEMINI_API_KEY=your_actual_api_key_here
   ```
5. Start the server:
   ```bash
   node server.js
   ```

## 2. Frontend Setup
1. Open a **new** terminal window (keep the backend running) and create a Vite React app:
   ```bash
   npm create vite@latest frontend -- --template react
   cd frontend
   npm install
   ```
2. Install Tailwind CSS and the Icons:
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   npm install lucide-react
   ```
3. Configure `tailwind.config.js`:
   ```javascript
   export default {
     content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
     theme: { extend: {} },
     plugins: [],
   }
   ```
4. Add Tailwind directives to `src/index.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
5. Replace the contents of `src/App.jsx` with the React code provided in the `App.jsx` file block.
6. Start the frontend:
   ```bash
   npm run dev
   ```

Open your browser to `http://localhost:5173` (or the port Vite provides) to interact with the full-stack application!