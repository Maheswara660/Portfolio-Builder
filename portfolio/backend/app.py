from flask import Flask, jsonify, request, send_file, send_from_directory
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import os
import logging
from pythonjsonlogger import jsonlogger
from flask_cors import CORS
from generators.zip_generator import create_portfolio_zip

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger()
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)


# Define the path to the frontend directory
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))

app = Flask(__name__, static_folder=frontend_dir, static_url_path='')
CORS(app) # Enable CORS for all routes


# Configure Uploads
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET'])
def index():
    """Serve the frontend application"""
    return send_file(os.path.join(frontend_dir, 'index.html'))

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Ensure unique filename to prevent overwrite/caching issues
        import uuid
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        file.save(os.path.join(UPLOAD_FOLDER, unique_filename))
        
        # Return the URL for the uploaded file
        return jsonify({"url": f"/uploads/{unique_filename}"})
    return jsonify({"error": "File type not allowed"}), 400

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health endpoint"""
    return jsonify({"status": "healthy"})

@app.route('/api/preview', methods=['POST'])
def generate_preview():
    """Returns HTML preview for live preview"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        # Determine template (default to minimal)
        template_name = data.get('style', {}).get('template', 'minimal')
        
        # We need to render the HTML. We can reuse html_generator.generate_html
        # But we also need the CSS. For a true preview, we might inline the CSS 
        # or link to a static route.
        # For simplicity, let's inject the CSS content into the HTML head style tag.
        
        from generators.html_generator import generate_html
        html_content = generate_html(data, template_name)
        
        # Read CSS
        base_dir = os.path.dirname(os.path.abspath(__file__))
        css_path = os.path.join(base_dir, 'templates', template_name, 'style.css')
        css_content = ""
        if os.path.exists(css_path):
            with open(css_path, 'r') as f:
                css_content = f.read()
        
        # Inject CSS
        html_content = html_content.replace('<link rel="stylesheet" href="style.css">', f'<style>{css_content}</style>')
        
        return html_content
    except Exception as e:
        logger.error(f"Error generating preview: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate', methods=['POST'])
def generate_portfolio():
    """Receives JSON data, returns ZIP file"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        zip_buffer = create_portfolio_zip(data)
        
        return send_file(
            zip_buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name='portfolio.zip'
        )
    except Exception as e:
        logger.error(f"Error generating portfolio: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
