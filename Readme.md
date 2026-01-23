
# 🌍 TravelTales – Travel Story Sharing Platform

**TravelTales** is a full-stack MERN web application that allows users to share their travel experiences through stories with images, explore stories shared by others, and interact using likes and comments. The platform focuses on secure authentication, smooth UI, and scalable backend architecture.

🔗 **Live Demo**: [https://traveltales-frontend.onrender.com](https://traveltales-mgk9.onrender.com/)

---

## ✨ Features

🔐 **User Authentication**

* Signup & Login using JWT
* Secure password hashing with bcrypt

📝 **Travel Stories**

* Create stories with title, location, image, tags, and description
* View all travel stories
* Edit & delete own stories

❤️ **Engagement**

* Like & unlike stories
* Comment on stories
* Delete own comments

🖼 **Image Upload**

* Image upload support with Cloudinary / server storage

📱 **Responsive UI**

* Works on mobile & desktop
* Clean and modern user interface

🛡 **Security**

* Protected routes using JWT middleware
* Environment variables for sensitive data
* CORS enabled for safe frontend–backend communication

---

## 🛠 Tech Stack

### Frontend

* React
* Vite
* Axios
* CSS

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication
* bcrypt
* Multer (Image upload)
* Cloudinary

---

## 📂 Project Structure

### Frontend

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── StoryCard.jsx
│   └── StoryCard.jsx
├── context/
│   ├── AuthContext.jsx
│   └── ToastContext.jsx
├── pages/
│   ├── CreateStory.jsx
│   ├── Dashboard.jsx
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── SingleStory.jsx
├── styles/
│   └── auth.css
├── utils/
│   └── api.js
├── App.jsx
├── main.jsx
└── index.css
```

### Backend

```
server/
├── config/
│   └── cloudinary.js
├── middleware/
│   ├── auth.js
│   └── upload.js
├── models/
│   ├── User.js
│   └── Story.js
├── routes/
│   ├── authRoutes.js
│   └── storyRoutes.js
├── utils/
│   └── generateToken.js
├── server.js
├── package.json
└── .env
```

---

## 🔄 How It Works

1. User signs up or logs in
2. Backend verifies credentials and generates a JWT token
3. Token is stored on the client
4. Authenticated users can create travel stories
5. Images are uploaded and stored securely
6. Stories are saved in MongoDB with user reference
7. Users can like, comment, edit, or delete their own stories
8. All data is fetched dynamically and rendered on the frontend

---

## ⚙️ Environment Variables (Backend)

Create a `.env` file inside the `server` folder:

```
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
PORT=5000
```

---

## ▶️ Run Locally

### Clone Repository

```bash
git clone https://github.com/Vishnupriya-TK/TravelTales.git
cd TravelTales
```

### Start Backend

```bash
cd server
npm install
npm start
```

### Start Frontend

```bash
cd client
npm install
npm run dev
```

🌐 Open browser:
👉 [http://localhost:5173](http://localhost:5173)

---

## 👩‍💻 Author

**Vishnu Priya Kannan**
📬 Open to collaboration and feedback

🌟 *“TravelTales turns journeys into stories and memories into experiences.”*

