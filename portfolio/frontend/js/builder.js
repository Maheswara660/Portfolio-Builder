class PortfolioBuilder {
    constructor() {
        this.state = {
            activeSection: 'personal',
            data: {
                personal: { name: '', title: '', location: '', bio: '', image: '' },
                social: { github: '', linkedin: '', twitter: '' },
                skills: [],
                projects: [],
                experience: [],
                education: [],
                contact: { email: '' }
            }
        };

        this.debounceTimer = null;
        this.init();
    }

    init() {
        this.loadState();
        this.bindEvents();
        this.renderActiveSection();
    }

    bindEvents() {
        // Wizard Navigation
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const clearBtn = document.getElementById('clear-section-btn');

        if (nextBtn) nextBtn.addEventListener('click', () => this.navigate('next'));
        if (prevBtn) prevBtn.addEventListener('click', () => this.navigate('prev'));
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearCurrentSection());

        // Input Changes
        // Input Changes
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea')) {
                this.handleInputChange(e.target);
            }
        });

        // Image Upload
        const imageUpload = document.getElementById('image-upload');
        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        // Dynamic Field Buttons
        document.getElementById('add-skill-btn').addEventListener('click', () => this.addSkill());
        document.getElementById('add-project-btn').addEventListener('click', () => this.addProject());
        document.getElementById('add-experience-btn').addEventListener('click', () => this.addExperience());
        document.getElementById('add-education-btn').addEventListener('click', () => this.addEducation());

        // Download
        const downloadBtn = document.getElementById('download-btn');
        if (downloadBtn) downloadBtn.addEventListener('click', () => this.downloadPortfolio());

        // Preview
        const previewBtn = document.getElementById('preview-trigger');
        if (previewBtn) previewBtn.addEventListener('click', () => this.updatePreview());
    }

    get sections() {
        return ['personal', 'social', 'skills', 'projects', 'experience', 'education', 'contact'];
    }

    navigate(direction) {
        const currentIndex = this.sections.indexOf(this.state.activeSection);
        let nextIndex = currentIndex;

        if (direction === 'next') {
            nextIndex = Math.min(currentIndex + 1, this.sections.length - 1);
        } else if (direction === 'prev') {
            nextIndex = Math.max(currentIndex - 1, 0);
        }

        this.setActiveSection(this.sections[nextIndex]);
    }

    clearCurrentSection() {
        if (!confirm('Are you sure you want to clear all data in this section?')) return;

        const sectionId = this.state.activeSection;
        const sectionContainer = document.getElementById(`section-${sectionId}`);

        if (Array.isArray(this.state.data[sectionId])) {
            this.state.data[sectionId] = [];
            const listContainer = sectionContainer.querySelector('[id$="-list"]');
            if (listContainer) listContainer.innerHTML = '';
        } else {
            for (const key in this.state.data[sectionId]) {
                this.state.data[sectionId][key] = '';
            }
            sectionContainer.querySelectorAll('input, textarea').forEach(input => input.value = '');
        }
        this.saveState();
    }

    setActiveSection(sectionId) {
        this.state.activeSection = sectionId;
        this.saveState();

        // Update Button UI
        const currentIndex = this.sections.indexOf(sectionId);
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const downloadBtn = document.getElementById('download-btn');

        if (prevBtn) {
            prevBtn.disabled = currentIndex === 0;
            prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
        }

        if (nextBtn) {
            if (currentIndex === this.sections.length - 1) {
                nextBtn.classList.add('hidden');
                if (downloadBtn) downloadBtn.classList.remove('hidden');
            } else {
                nextBtn.classList.remove('hidden');
                if (downloadBtn) downloadBtn.classList.add('hidden');
            }
        }

        // Update Form Visibility
        document.querySelectorAll('.form-section').forEach(div => {
            if (div.id === `section-${sectionId}`) {
                div.classList.remove('hidden');
            } else {
                div.classList.add('hidden');
            }
        });
    }

    handleInputChange(input) {
        const name = input.name;
        const value = input.value;

        if (name) {
            const [section, field] = name.split('.');
            if (this.state.data[section]) {
                this.state.data[section][field] = value;
            }
        } else {
            // Handle dynamic fields (skills, etc which might not have fixed names)
            this.scrapeDynamicFields();
        }

        this.saveState();
        // this.debouncedPreview(); // Auto-preview disabled per user request
    }

    async handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        // Show loading state might be good here

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            const imageUrl = data.url;

            // Update state
            this.state.data.personal.image = imageUrl;

            // Update hidden input
            const hiddenInput = document.querySelector('[name="personal.image"]');
            if (hiddenInput) hiddenInput.value = imageUrl;

            // Update preview
            this.updateImagePreview(imageUrl);

            this.saveState();

        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        }
    }

    updateImagePreview(url) {
        const previewEl = document.getElementById('image-preview');
        if (previewEl && url) {
            previewEl.innerHTML = `<img src="${url}" class="w-full h-full object-cover">`;
        }
    }

    scrapeDynamicFields() {
        // Skills
        const skillInputs = document.querySelectorAll('.skill-input');
        this.state.data.skills = Array.from(skillInputs).map(i => ({ name: i.value }));

        // Projects
        const projectItems = document.querySelectorAll('.project-item');
        this.state.data.projects = Array.from(projectItems).map(item => ({
            title: item.querySelector('.proj-title').value,
            description: item.querySelector('.proj-desc').value,
            link: item.querySelector('.proj-link').value
        }));

        // Experience
        const expItems = document.querySelectorAll('.experience-item');
        this.state.data.experience = Array.from(expItems).map(item => ({
            company: item.querySelector('.exp-company').value,
            role: item.querySelector('.exp-role').value,
            year: item.querySelector('.exp-year').value,
            description: item.querySelector('.exp-desc').value
        }));

        // Education
        const eduItems = document.querySelectorAll('.education-item');
        this.state.data.education = Array.from(eduItems).map(item => ({
            school: item.querySelector('.edu-school').value,
            degree: item.querySelector('.edu-degree').value,
            year: item.querySelector('.edu-year').value
        }));
    }

    addSkill(value = '') {
        const container = document.getElementById('skills-list');
        const div = document.createElement('div');
        div.className = 'flex gap-2';
        div.innerHTML = `
            <input type="text" class="skill-input flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Skill name" value="${value}">
            <button class="text-destructive hover:text-destructive/80 p-2" onclick="this.parentElement.remove(); app.handleInputChange(this)">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        `;
        container.appendChild(div);
        lucide.createIcons();
    }

    addProject(data = {}) {
        const container = document.getElementById('projects-list');
        const div = document.createElement('div');
        div.className = 'project-item p-4 border border-border rounded-lg space-y-3 relative';
        div.innerHTML = `
            <button class="absolute top-2 right-2 text-destructive hover:text-destructive/80" onclick="this.parentElement.remove(); app.scrapeDynamicFields(); /* app.debouncedPreview() */">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
            <input type="text" class="proj-title flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm font-medium shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Project Title" value="${data.title || ''}">
            <textarea class="proj-desc flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Description">${data.description || ''}</textarea>
            <input type="url" class="proj-link flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Project Link" value="${data.link || ''}">
        `;
        container.appendChild(div);
        lucide.createIcons();
    }

    addExperience(data = {}) {
        const container = document.getElementById('experience-list');
        const div = document.createElement('div');
        div.className = 'experience-item p-4 border border-border rounded-lg space-y-3 relative';
        div.innerHTML = `
            <button class="absolute top-2 right-2 text-destructive hover:text-destructive/80" onclick="this.parentElement.remove(); app.scrapeDynamicFields(); /* app.debouncedPreview() */">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
            <div class="grid grid-cols-2 gap-2">
                <input type="text" class="exp-company flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm font-medium shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Company" value="${data.company || ''}">
                <input type="text" class="exp-role flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Role" value="${data.role || ''}">
            </div>
            <input type="text" class="exp-year flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Years (e.g. 2020 - 2022)" value="${data.year || ''}">
            <textarea class="exp-desc flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Responsibilities">${data.description || ''}</textarea>
        `;
        container.appendChild(div);
        lucide.createIcons();
    }

    addEducation(data = {}) {
        const container = document.getElementById('education-list');
        const div = document.createElement('div');
        div.className = 'education-item p-4 border border-border rounded-lg space-y-3 relative';
        div.innerHTML = `
            <button class="absolute top-2 right-2 text-destructive hover:text-destructive/80" onclick="this.parentElement.remove(); app.scrapeDynamicFields(); /* app.debouncedPreview() */">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
            <input type="text" class="edu-school flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm font-medium shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="School / University" value="${data.school || ''}">
            <div class="grid grid-cols-2 gap-2">
                <input type="text" class="edu-degree flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Degree" value="${data.degree || ''}">
                <input type="text" class="edu-year flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Year" value="${data.year || ''}">
            </div>
        `;
        container.appendChild(div);
        lucide.createIcons();
    }

    renderActiveSection() {
        this.setActiveSection(this.state.activeSection);
    }

    debouncedPreview() {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        // this.debounceTimer = setTimeout(() => this.updatePreview(), 1000); // Auto-update disabled

        // Update status text
        const status = document.getElementById('preview-status');
        status.textContent = 'Saving...';
    }

    async updatePreview() {
        const btn = document.getElementById('preview-trigger');
        const status = document.getElementById('preview-status');
        const originalText = status.textContent;
        status.textContent = 'Loading...';

        try {
            const response = await fetch('/api/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.state.data)
            });

            if (!response.ok) throw new Error('Preview Error');

            const html = await response.text();

            // Open in new tab
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(html);
                newWindow.document.close();
            } else {
                alert('Please allow popups to view the preview.');
            }
        } catch (e) {
            console.error(e);
            alert('Failed to load preview.');
        } finally {
            status.textContent = originalText;
        }
    }

    async downloadPortfolio() {
        const btn = document.getElementById('download-btn');
        const oldText = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Zipping...`;

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.state.data)
            });

            if (!response.ok) throw new Error('Generation Failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'portfolio.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);

        } catch (e) {
            alert('Download failed. Please check console.');
            console.error(e);
        } finally {
            btn.innerHTML = oldText;
            lucide.createIcons();
        }
    }

    saveState() {
        localStorage.setItem('builder_state', JSON.stringify(this.state));
    }

    loadState() {
        const saved = localStorage.getItem('builder_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge to ensure schema integrity
            this.state.activeSection = parsed.activeSection || 'personal';
            this.state.data = { ...this.state.data, ...parsed.data };

            // Populate Inputs
            this.populateInputs();
        }
    }

    populateInputs() {
        // Static fields
        for (const section in this.state.data) {
            if (Array.isArray(this.state.data[section])) continue;
            for (const key in this.state.data[section]) {
                const input = document.querySelector(`[name="${section}.${key}"]`);
                if (input) input.value = this.state.data[section][key];
            }
        }

        // Dynamic fields
        this.state.data.skills.forEach(s => this.addSkill(s.name));
        this.state.data.projects.forEach(p => this.addProject(p));
        this.state.data.experience.forEach(e => this.addExperience(e));
        this.state.data.education.forEach(e => this.addEducation(e));
    }
}

const app = new PortfolioBuilder();
window.app = app; // For onclick handlers in dynamic HTML
