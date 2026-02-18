import os
import io
import zipfile
from .html_generator import generate_html

def create_portfolio_zip(data):
    """
    Generates a ZIP file containing the generated portfolio.
    Returns a BytesIO object containing the ZIP data.
    """
    template_name = data.get('style', {}).get('template', 'minimal')
    
    # Generate HTML content
    html_content = generate_html(data, template_name)
    
    # Create in-memory ZIP
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        
        # Handle Profile Image first so we can update HTML
        profile_image = data.get('personal', {}).get('image')
        if profile_image and profile_image.startswith('/uploads/'):
            # It's a local upload
            filename = profile_image.split('/')[-1]
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            upload_path = os.path.join(base_dir, 'uploads', filename)
            
            if os.path.exists(upload_path):
                # Add to zip
                zip_file.write(upload_path, 'assets/profile.jpg')
                
                # Update HTML to point to this local file
                html_content = html_content.replace(profile_image, 'assets/profile.jpg')

        # Add index.html
        zip_file.writestr('index.html', html_content)
        
        # Add style.css
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        css_path = os.path.join(base_dir, 'templates', template_name, 'style.css')
        
        if os.path.exists(css_path):
            zip_file.write(css_path, 'style.css')
            
    zip_buffer.seek(0)
    return zip_buffer
