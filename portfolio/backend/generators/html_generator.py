import os
from jinja2 import Environment, FileSystemLoader

def generate_html(data, template_name='minimal'):
    """
    Renders the index.html for the specified template using the provided data.
    """
    # Define the path to the templates directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    template_dir = os.path.join(base_dir, 'templates', template_name)
    
    # Transform flat builder data into the nested structure expected by the reference template
    transformed_data = {
        "settings": {
            "name": data.get('personal', {}).get('name', 'John Doe'),
            "title": data.get('personal', {}).get('title', 'Developer'),
            "summary": data.get('personal', {}).get('bio', ''),
            "location": data.get('personal', {}).get('location', ''),
            "profileImage": data.get('personal', {}).get('image') or ("https://api.dicebear.com/9.x/initials/svg?seed=" + data.get('personal', {}).get('name', 'JD')),
        },
        "navigation": {
            "enabled": True,
            "items": [
                {"name": "About", "url": "#about"},
                {"name": "Projects", "url": "#projects"},
                {"name": "Experience", "url": "#experience"},
                {"name": "Education", "url": "#education"},
                {"name": "Contact", "url": "#contact"}
            ]
        },
        "sections": {
            "hero": {
                "enabled": True,
                "ctaButtons": [
                    {"text": "Contact Me", "url": "#contact"},
                    {"text": "View Projects", "url": "#projects"}
                ]
            },
            "about": {
                "enabled": True,
                "skills": {
                    "enabled": True,
                    "title": "Skills",
                    "items": [s.get('name', '') for s in data.get('skills', []) if s.get('name')]
                }
            },
            "projects": {
                "enabled": True,
                "title": "Projects",
                "items": [
                    {
                        "title": p.get('title', ''),
                        "description": p.get('description', ''),
                        "tags": [], # We didn't collect tags yet, maybe strictly required?
                        "previewUrl": p.get('link', ''),
                        "repoUrl": "" 
                    }
                    for p in data.get('projects', []) if p.get('title')
                ]
            },
            "experience": {
                "enabled": True,
                "title": "Experience",
                "items": [
                    {
                        "position": e.get('role', ''),
                        "company": e.get('company', ''),
                        "period": e.get('year', ''),
                        "description": e.get('description', '')
                    }
                    for e in data.get('experience', []) if e.get('company')
                ]
            },
            "education": {
                "enabled": True,
                "title": "Education",
                "items": [
                    {
                        "degree": e.get('degree', ''),
                        "institution": e.get('school', ''),
                        "period": e.get('year', '')
                    }
                    for e in data.get('education', []) if e.get('school')
                ]
            },
            "achievements": { "enabled": False, "items": [] }, # Not implemented yet
            "social": {
                "enabled": True,
                "items": [
                    {"platform": "github", "url": data.get('social', {}).get('github', '')},
                    {"platform": "linkedin", "url": data.get('social', {}).get('linkedin', '')},
                    {"platform": "twitter", "url": data.get('social', {}).get('twitter', '')}
                ]
            },
            "contact": {
                "enabled": True,
                "title": "Contact",
                "email": data.get('contact', {}).get('email', ''),
                "phone": "",
                "location": data.get('personal', {}).get('location', '')
            }
        }
    }

    # Filter empty social links
    transformed_data['sections']['social']['items'] = [
        item for item in transformed_data['sections']['social']['items'] if item['url']
    ]

    # Initialize Jinja2 environment
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template('index.html')
    
    # Render the template
    return template.render(portfolio_data=transformed_data)
