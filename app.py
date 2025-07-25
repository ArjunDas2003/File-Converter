import os
import json
from flask import Flask, render_template, request, send_from_directory, flash, redirect, url_for, after_this_request
from werkzeug.utils import secure_filename
from PIL import Image
from moviepy import VideoFileClip
import io

# Initialize the Flask application
app = Flask(__name__)

# --- Configuration ---
UPLOAD_FOLDER = 'uploads'
# Allowed extensions for each converter type
ALLOWED_IMG_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SECRET_KEY'] = 'a-truly-random-and-secret-key-for-production'
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024  # 32MB max-limit

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --- Helper Functions ---
def allowed_file(filename, allowed_extensions):
    """Checks if the file's extension is in the allowed set."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

# --- Main Routes ---
@app.route('/')
def index():
    """Renders the homepage with conversion tool options."""
    return render_template('index.html')

@app.route('/mp4-to-mp3', methods=['GET', 'POST'])
def mp4_to_mp3():
    """Handles the MP4 to MP3 conversion page."""
    if request.method == 'POST':
        if 'file' not in request.files:
            flash('No file part in the request.')
            return redirect(request.url)

        file = request.files['file']

        if file.filename == '':
            flash('No file selected.')
            return redirect(request.url)

        if file and allowed_file(file.filename, ALLOWED_VIDEO_EXTENSIONS):
            filename = secure_filename(file.filename)
            input_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            output_filename = f"{os.path.splitext(filename)[0]}.mp3"
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)

            try:
                file.save(input_path)
                with VideoFileClip(input_path) as video_clip:
                    if video_clip.audio:
                        video_clip.audio.write_audiofile(output_path)
                    else:
                        flash('The provided MP4 file does not contain an audio track.')
                        os.remove(input_path) # Clean up failed upload
                        return redirect(request.url)
                
                @after_this_request
                def cleanup(response):
                    try:
                        os.remove(input_path)
                        os.remove(output_path)
                    except Exception as error:
                        app.logger.error("Error cleaning up files: %s", error)
                    return response

                return send_from_directory(app.config['UPLOAD_FOLDER'], output_filename, as_attachment=True)

            except Exception as e:
                flash(f'An error occurred during conversion: {e}')
                if os.path.exists(input_path):
                    os.remove(input_path)
                return redirect(request.url)
        else:
            flash('Invalid file type. Please upload an MP4 file.')
            return redirect(request.url)

    return render_template('mp4_to_mp3.html')


@app.route('/images-to-pdf', methods=['GET', 'POST'])
def images_to_pdf():
    """Handles the multiple images to PDF conversion page."""
    if request.method == 'POST':
        uploaded_files = request.files.getlist("files[]")
        file_order_str = request.form.get("file_order")

        if not uploaded_files or not uploaded_files[0].filename:
            flash('No files selected.')
            return redirect(request.url)
        
        if not file_order_str:
            flash('File order information is missing.')
            return redirect(request.url)

        ordered_filenames = json.loads(file_order_str)
        # FIX: Use the original filename as the key to match the JS.
        # secure_filename is not needed here because we are not saving the individual
        # uploaded files to the server's filesystem.
        files_dict = {f.filename: f for f in uploaded_files}
        
        images_to_save = []
        output_filename = "converted.pdf"
        output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)

        try:
            # Process images in the specified order
            for filename in ordered_filenames:
                # FIX: Check for the original filename in the dictionary.
                if filename in files_dict and allowed_file(filename, ALLOWED_IMG_EXTENSIONS):
                    file_storage = files_dict[filename]
                    
                    # Read image into memory to avoid saving temp files
                    in_memory_file = io.BytesIO()
                    file_storage.save(in_memory_file)
                    in_memory_file.seek(0)

                    image = Image.open(in_memory_file).convert("RGB")
                    images_to_save.append(image)
                else:
                    flash(f"Invalid or missing file in order: {filename}")
                    return redirect(request.url)

            if not images_to_save:
                flash("No valid images were provided for conversion.")
                return redirect(request.url)

            # Save the first image and append the rest
            images_to_save[0].save(
                output_path, "PDF", resolution=100.0, save_all=True, append_images=images_to_save[1:]
            )

            @after_this_request
            def cleanup(response):
                try:
                    os.remove(output_path)
                except Exception as error:
                    app.logger.error("Error cleaning up output file: %s", error)
                return response

            return send_from_directory(app.config['UPLOAD_FOLDER'], output_filename, as_attachment=True)

        except Exception as e:
            flash(f'An error occurred during PDF creation: {e}')
            return redirect(request.url)

    return render_template('images_to_pdf.html')


if __name__ == '__main__':
    app.run(debug=True)
