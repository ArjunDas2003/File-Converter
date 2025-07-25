# Universal File Converter

A versatile, web-based file conversion tool built with Flask. This application provides a clean, modern user interface for various file conversion tasks, designed to be easily extensible with new converters.

<img width="1917" height="927" alt="image" src="https://github.com/user-attachments/assets/3e9aa827-50fa-4a7d-bd6c-b19e2ed4f4e8" />
<img width="1918" height="925" alt="image" src="https://github.com/user-attachments/assets/bb09e3a0-1af7-4442-aaeb-67a46dfa0ac0" />
<img width="1914" height="927" alt="image" src="https://github.com/user-attachments/assets/6527a371-dddd-4755-bd15-e0c4ebd6a1d4" />


## ✨ Features

- **Tool-Based UI**: A user-friendly homepage allows users to select the specific conversion task they need.
- **Images to PDF Converter**:
    - Upload multiple PNG, JPG, or GIF files.
    - Drag-and-drop to reorder images before conversion.
    - Combines all images into a single, high-quality PDF document.
- **MP4 to MP3 Converter**:
    - Easily extract audio from MP4 video files.
    - Simple drag-and-drop interface for quick conversions.
- **Modern Frontend**:
    - Responsive design that works on all devices.
    - Interactive drag-and-drop file uploads.
    - Asynchronous file handling for a smooth user experience.
- **Extensible Backend**: The Flask application is structured to make adding new conversion tools straightforward.

## 🛠️ Tech Stack

- **Backend**: Flask (Python)
- **Image Manipulation**: Pillow (PIL Fork)
- **Video/Audio Processing**: MoviePy
- **Frontend**: HTML5, CSS3, JavaScript (no frameworks)
- **Icons**: Font Awesome

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Python 3.8+
- `pip` for package management
- **FFmpeg**: MoviePy requires FFmpeg for video and audio processing. You must have the FFmpeg executable installed and accessible in your system's PATH.
  - You can download it from the https://ffmpeg.org/download.html .

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ArjunDas2003/File-Converter.git
    cd file-converter
    ```

2.  **Create and activate a virtual environment:**
    - **Windows:**
      ```bash
      python -m venv venv
      .\venv\Scripts\activate
      ```
    - **macOS & Linux:**
      ```bash
      python3 -m venv venv
      source venv/bin/activate
      ```

3.  **Install the required packages:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the Flask application:**
    ```bash
    flask run
    ```
    Alternatively, you can run the `app.py` file directly:
    ```bash
    python app.py
    ```

5.  Open your web browser and navigate to `http://127.0.0.1:5000` to see the application in action.


## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

