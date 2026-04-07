 
# 🛒 EM-WholeSales E-Commerce App

Looking to launch your own e-commerce shop. This Application will do just that! Complete online shopping with cart and checkout functionality. Using Stripe Api to process consumer purchases. This App can be used to sell all types of products. With an admin dashboard to upload new products and price changes on the fly. Configured with a back-end that keeps your products data consistent. With a user friendly UI design.

---

## 🚀 Tech Stack

**Frontend**

* React
* JavaScript / JSX
* MATERIAL UI 

**Backend**

* Node.js
* Express
* MongoDB + Mongoose

**Other Tools**

* Git & GitHub
* Render (HOST / Deployment)
* Concurrently
* Nodemon

---

## 📂 Project Structure

```
root/
├── frontend/        # React client
├── backend/         # Express API ( MONGO DB BACKEND)
├── package.json     # Root scripts (runs frontend + backend)
└── README.md
```


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Luisfeliz3/em-wholesales.git
cd em-wholesales

### 2️⃣ Install dependencies (Frontend + Backend)

```bash
npm run start
```

Or install individually:

```bash
npm run install:frontend
npm run install:backend
```

---

## ▶️ Running the App

### Development Mode (Frontend + Backend)

```bash
npm run start
```

or

```bash
npm run start:dev
```

### Run Both Servers Normally

```bash
npm run start:all
```

### Frontend Only

```bash
npm run dev:frontend
```

### Backend Only

```bash
npm run dev:backend
```

---

## 🏗️ Build for Production

```bash
npm run build
```

This will:

* Install frontend dependencies
* Build the React app
* Prepare the app for deployment

---

## 🌍 Environment Variables

Create a `.env` file inside the **backend** folder:

```env
PORT=3001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=client_url
REACT_APP_API_URL=react_app_api_url
```

*(Add or remove variables based on your app)*

---

## 🚢 Deployment (Render)

### Backend (Web Service)

* Root Directory: `backend`
* Build Command:

  ```bash
  npm install
  ```
* Start Command:

  ```bash
  npm run start
  ```

### Frontend (Static Site)

* Root Directory: `frontend`
* Build Command:

  ```bash
  npm install && npm run build
  ```
* Publish Directory:

  ```
  build
  ```

---

## 🔄 Useful Scripts

| Script                | Description                     |
| --------------------- | ------------------------------- |
| `npm run install:all` | Install frontend & backend deps |
| `npm run start:dev`   | Run app in dev mode             |
| `npm run start:all`   | Run frontend + backend          |
| `npm run build`       | Build frontend for production   |
| `npm run update:all`  | Update all dependencies         |

---

## 🧪 Testing

Describe testing setup here (Jest, Cypress, etc.)

```bash
npm run test
```

---

## 📸 Screenshots

*(Optional but recommended)*

Add screenshots or GIFs of the app in action.

---

## 🧠 Lessons Learned

* Key challenges
* What you’d improve
* What you learned building this project

---

## 🧩 Future Improvements

* [ ] Add payments
* [ ] Improve UI
* [ ] Admin dashboard

---

## 👨🏽‍💻 Author

**Lou-Da-Dev**
GitHub: [https://github.com/LuisFeliz3](https://github.com/Luisfeliz3)
LinkedIn: [https://www.linkedin.com/in/luis-e-f-465b14192/](https://www.linkedin.com/in/luis-e-f-465b14192/)

---

## 📄 License

This project is licensed under the MIT License.

---

🔥 *Built with the MERN stack*
