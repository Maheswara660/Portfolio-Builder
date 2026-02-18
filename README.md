# Portfolio Builder

A modern, dynamic portfolio builder application designed to generate professional portfolios. This project leverages a Flask backend and a responsive HTML/CSS/JS frontend.

---

## 🚀 Technologies Used

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 📂 Project Structure

```
Portfolio/
├── portfolio/
│   ├── backend/        # Flask backend logic
│   │   ├── app.py
│   │   ├── requirements.txt
│   │   └── ...
│   └── frontend/       # HTML/CSS/JS frontend logic
│       ├── index.html
│       ├── css/
│       ├── js/
│       └── ...
├── .gitignore
└── README.md
```

---

## 🛠️ Installation & Setup

### Prerequisites

- [Python](https://www.python.org/downloads/)
- [Git](https://git-scm.com/downloads)

### Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Maheswara660/Portfolio-Builder.git
    cd Portfolio-Builder
    ```

2.  **Set up the Virtual Environment:**

    Navigate to the project root and create a virtual environment.

    *   **macOS/Linux:**
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```

    *   **Windows (Command Prompt):**
        ```cmd
        python -m venv venv
        venv\Scripts\activate.bat
        ```

    *   **Windows (PowerShell):**
        ```powershell
        python -m venv venv
        venv\Scripts\Activate.ps1
        ```

3.  **Install Dependencies:**
    Navigate to the `backend` directory and install the required packages.
    ```bash
    cd portfolio/backend
    pip install -r requirements.txt
    ```

---

## ▶️ Usage & Execution

### Running the Backend

Ensure your virtual environment is activated and you are in the `portfolio/backend` directory.

```bash
# Set Flask app environment variable (optional but recommended)
export FLASK_APP=app.py
export FLASK_ENV=development

# Run the application
flask run
```
The backend server will start at `http://127.0.0.1:5000/`.

### Running the Frontend

Simply open `portfolio/frontend/index.html` in your preferred web browser. Alternatively, you can serve it using a simple HTTP server:

```bash
# In the portfolio/frontend directory
python3 -m http.server 8000
```
Then visit `http://localhost:8000`.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
