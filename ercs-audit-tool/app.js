// ERCS Audit Findings Risk Assessment Tool
class ERCSApp {
    constructor() {
        this.findings = JSON.parse(localStorage.getItem('ercs-findings') || '[]');
        this.currentAssessment = {};
        
        // Application data
        this.data = {
            compliance_areas: [
                "Quality Management System",
                "Personnel & Training", 
                "Documentation Control",
                "Equipment & Facilities",
                "Maintenance Planning",
                "Airworthiness Management",
                "Supplier Management",
                "Record Keeping",
                "Regulatory Compliance",
                "Safety Management"
            ],
            severity_levels: [
                {"code": "X", "name": "EXTREME", "description": "Critical non-compliance, immediate regulatory action"},
                {"code": "S", "name": "SIGNIFICANT", "description": "Serious non-compliance, formal enforcement"},
                {"code": "M", "name": "MAJOR", "description": "Major non-compliance, corrective action required"},
                {"code": "I", "name": "MINOR", "description": "Minor non-compliance, limited impact"},
                {"code": "E", "name": "ADMINISTRATIVE", "description": "Documentation/administrative issues"}
            ],
            barriers: [
                {"id": 1, "name": "Quality System Design", "weight": 5},
                {"id": 2, "name": "Training & Competence", "weight": 3},
                {"id": 3, "name": "Procedures & Documentation", "weight": 3},
                {"id": 4, "name": "Management Oversight", "weight": 2},
                {"id": 5, "name": "Internal Audit & Review", "weight": 2},
                {"id": 6, "name": "Corrective Action System", "weight": 2},
                {"id": 7, "name": "Management Review", "weight": 1},
                {"id": 8, "name": "Continuous Improvement", "weight": 1}
            ],
            regulatory_areas: ["Part CAMO", "Part M", "Part 145", "AIR OPS"],
            barrier_effectiveness: [
                {"value": 0, "label": "Failed"},
                {"value": 1, "label": "Remaining Weak"},
                {"value": 2, "label": "Remaining Moderate"},
                {"value": 3, "label": "Remaining Strong"}
            ]
        };

        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupForms();
        this.setupModal();
        this.populateFormOptions();
        this.updateDashboard();
        this.generateFindingId();
        this.setupEventListeners();
        
        // Set current date
        document.getElementById('audit-date').value = new Date().toISOString().split('T')[0];
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav__button');
        const sections = document.querySelectorAll('.section');

        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetSection = e.target.dataset.section;
                
                // Update active nav button
                navButtons.forEach(btn => btn.classList.remove('nav__button--active'));
                e.target.classList.add('nav__button--active');
                
                // Show target section
                sections.forEach(section => {
                    section.classList.remove('section--active');
                    if (section.id === targetSection) {
                        section.classList.add('section--active');
                    }
                });

                // Update content based on section
                if (targetSection === 'dashboard') {
                    this.updateDashboard();
                } else if (targetSection === 'history') {
                    this.updateHistory();
                } else if (targetSection === 'reports') {
                    this.updateReports();
                }
            });
        });

        // Dashboard new assessment button
        document.querySelector('.dashboard__actions .btn').addEventListener('click', () => {
            this.switchToSection('new-assessment');
        });
    }

    switchToSection(sectionId) {
        document.querySelectorAll('.nav__button').forEach(btn => {
            btn.classList.remove('nav__button--active');
            if (btn.dataset.section === sectionId) {
                btn.classList.add('nav__button--active');
            }
        });

        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('section--active');
            if (section.id === sectionId) {
                section.classList.add('section--active');
            }
        });
    }

    setupForms() {
        const form = document.getElementById('assessment-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAssessment();
        });

        document.getElementById('reset-form').addEventListener('click', () => {
            this.resetForm();
        });

        // Real-time risk calculation
        form.addEventListener('change', () => {
            this.calculateRisk();
        });
    }

    setupModal() {
        const modal = document.getElementById('finding-modal');
        const closeBtn = modal.querySelector('.modal__close');

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('modal--active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('modal--active');
            }
        });
    }

    setupEventListeners() {
        // History filters
        document.getElementById('risk-filter').addEventListener('change', () => this.updateHistory());
        document.getElementById('area-filter').addEventListener('change', () => this.updateHistory());
        
        // Export data
        document.getElementById('export-data').addEventListener('click', () => this.exportData());
        
        // Table sorting
        document.querySelectorAll('[data-sort]').forEach(th => {
            th.addEventListener('click', (e) => {
                const sortBy = e.target.dataset.sort;
                this.sortHistory(sortBy);
            });
        });
    }

    populateFormOptions() {
        // Compliance areas
        const complianceSelect = document.getElementById('compliance-area');
        this.data.compliance_areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area;
            option.textContent = area;
            complianceSelect.appendChild(option);
        });

        // Severity levels
        const severityContainer = document.getElementById('severity-options');
        this.data.severity_levels.forEach(level => {
            const div = document.createElement('div');
            div.className = 'severity-option';
            div.innerHTML = `
                <input type="radio" name="severity" value="${level.code}" id="severity-${level.code}">
                <span class="severity-code severity-code--${level.code.toLowerCase()}">${level.code}</span>
                <div class="severity-info">
                    <div class="severity-name">${level.name}</div>
                    <p class="severity-description">${level.description}</p>
                </div>
            `;
            
            div.addEventListener('click', () => {
                const radio = div.querySelector('input[type="radio"]');
                radio.checked = true;
                document.querySelectorAll('.severity-option').forEach(opt => 
                    opt.classList.remove('severity-option--selected'));
                div.classList.add('severity-option--selected');
                this.calculateRisk();
            });
            
            severityContainer.appendChild(div);
        });

        // Barriers
        const barriersContainer = document.getElementById('barriers-container');
        this.data.barriers.forEach(barrier => {
            const div = document.createElement('div');
            div.className = 'barrier-item';
            
            const optionsHtml = this.data.barrier_effectiveness.map(eff => `
                <div class="barrier-option">
                    <input type="radio" name="barrier-${barrier.id}" value="${eff.value}" 
                           id="barrier-${barrier.id}-${eff.value}">
                    <label class="barrier-option-label" for="barrier-${barrier.id}-${eff.value}">
                        ${eff.label} (${eff.value})
                    </label>
                </div>
            `).join('');
            
            div.innerHTML = `
                <div class="barrier-header">
                    <span class="barrier-name">${barrier.name}</span>
                    <span class="barrier-weight">Weight: ${barrier.weight}</span>
                </div>
                <div class="barrier-options">
                    ${optionsHtml}
                </div>
            `;
            
            // Add click handlers for barrier options
            div.querySelectorAll('.barrier-option').forEach(option => {
                option.addEventListener('click', () => {
                    const radio = option.querySelector('input[type="radio"]');
                    radio.checked = true;
                    div.querySelectorAll('.barrier-option').forEach(opt => 
                        opt.classList.remove('barrier-option--selected'));
                    option.classList.add('barrier-option--selected');
                    this.calculateRisk();
                });
            });
            
            barriersContainer.appendChild(div);
        });
    }

    generateFindingId() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const sequence = String(this.findings.length + 1).padStart(3, '0');
        
        const findingId = `ERCS-${year}${month}${day}-${sequence}`;
        document.getElementById('finding-id').value = findingId;
    }

    calculateRisk() {
        const severityInput = document.querySelector('input[name="severity"]:checked');
        if (!severityInput) {
            this.clearRiskCalculation();
            return;
        }

        const severity = severityInput.value;
        
        // Calculate probability score based on barriers
        let totalWeightedScore = 0;
        let totalWeight = 0;
        
        this.data.barriers.forEach(barrier => {
            const barrierInput = document.querySelector(`input[name="barrier-${barrier.id}"]:checked`);
            if (barrierInput) {
                const effectiveness = parseInt(barrierInput.value);
                totalWeightedScore += effectiveness * barrier.weight;
                totalWeight += barrier.weight;
            }
        });

        if (totalWeight === 0) {
            this.clearRiskCalculation();
            return;
        }

        // Calculate probability score (0-9)
        const averageEffectiveness = totalWeightedScore / totalWeight;
        const probabilityScore = Math.round(9 - (averageEffectiveness * 3));
        
        // Generate ERCS score
        const ercsScore = `${severity}${probabilityScore}`;
        
        // Determine risk level
        const riskLevel = this.getRiskLevel(severity, probabilityScore);
        
        // Update display
        document.getElementById('probability-score').textContent = probabilityScore;
        document.getElementById('ercs-score').textContent = ercsScore;
        
        const riskLevelElement = document.getElementById('risk-level');
        riskLevelElement.textContent = riskLevel;
        riskLevelElement.className = `calc-value risk-level risk-level--${riskLevel}`;
        
        // Store in current assessment
        this.currentAssessment.probabilityScore = probabilityScore;
        this.currentAssessment.ercsScore = ercsScore;
        this.currentAssessment.riskLevel = riskLevel;
    }

    clearRiskCalculation() {
        document.getElementById('probability-score').textContent = '-';
        document.getElementById('ercs-score').textContent = '-';
        document.getElementById('risk-level').textContent = '-';
        document.getElementById('risk-level').className = 'calc-value risk-level';
    }

    getRiskLevel(severity, probability) {
        const riskMatrix = {
            'X': { 0: 'RED', 1: 'RED', 2: 'RED', 3: 'YELLOW', 4: 'YELLOW', 5: 'GREEN', 6: 'GREEN', 7: 'GREEN', 8: 'GREEN', 9: 'GREEN' },
            'S': { 0: 'RED', 1: 'RED', 2: 'YELLOW', 3: 'YELLOW', 4: 'YELLOW', 5: 'GREEN', 6: 'GREEN', 7: 'GREEN', 8: 'GREEN', 9: 'GREEN' },
            'M': { 0: 'RED', 1: 'RED', 2: 'YELLOW', 3: 'YELLOW', 4: 'GREEN', 5: 'GREEN', 6: 'GREEN', 7: 'GREEN', 8: 'GREEN', 9: 'GREEN' },
            'I': { 0: 'RED', 1: 'YELLOW', 2: 'YELLOW', 3: 'GREEN', 4: 'GREEN', 5: 'GREEN', 6: 'GREEN', 7: 'GREEN', 8: 'GREEN', 9: 'GREEN' },
            'E': { 0: 'YELLOW', 1: 'YELLOW', 2: 'GREEN', 3: 'GREEN', 4: 'GREEN', 5: 'GREEN', 6: 'GREEN', 7: 'GREEN', 8: 'GREEN', 9: 'GREEN' }
        };
        
        return riskMatrix[severity][probability] || 'GREEN';
    }

    saveAssessment() {
        const form = document.getElementById('assessment-form');
        const formData = new FormData(form);
        
        // Validate required fields
        if (!this.validateForm(formData)) {
            alert('Please fill in all required fields and complete the risk assessment.');
            return;
        }
        
        // Create assessment object
        const assessment = {
            id: Date.now(),
            findingId: document.getElementById('finding-id').value,
            auditDate: formData.get('audit-date') || document.getElementById('audit-date').value,
            organizationName: formData.get('organization-name') || document.getElementById('organization-name').value,
            regulatoryArea: formData.get('regulatory-area') || document.getElementById('regulatory-area').value,
            auditorName: formData.get('auditor-name') || document.getElementById('auditor-name').value,
            findingDescription: formData.get('finding-description') || document.getElementById('finding-description').value,
            complianceArea: formData.get('compliance-area') || document.getElementById('compliance-area').value,
            severity: formData.get('severity'),
            barriers: {},
            probabilityScore: this.currentAssessment.probabilityScore,
            ercsScore: this.currentAssessment.ercsScore,
            riskLevel: this.currentAssessment.riskLevel,
            createdAt: new Date().toISOString()
        };
        
        // Collect barrier assessments
        this.data.barriers.forEach(barrier => {
            const value = formData.get(`barrier-${barrier.id}`);
            if (value !== null) {
                assessment.barriers[barrier.id] = parseInt(value);
            }
        });
        
        // Save to findings array
        this.findings.push(assessment);
        localStorage.setItem('ercs-findings', JSON.stringify(this.findings));
        
        // Show success message and redirect
        alert('Assessment saved successfully!');
        this.resetForm();
        this.generateFindingId();
        this.switchToSection('dashboard');
        this.updateDashboard();
    }

    validateForm(formData) {
        const requiredFields = ['organization-name', 'regulatory-area', 'auditor-name', 'finding-description', 'compliance-area', 'severity'];
        
        for (let field of requiredFields) {
            const value = formData.get(field) || document.getElementById(field).value;
            if (!value) {
                return false;
            }
        }
        
        // Check if all barriers are assessed
        for (let barrier of this.data.barriers) {
            if (!formData.get(`barrier-${barrier.id}`)) {
                return false;
            }
        }
        
        // Check if risk calculation is complete
        return this.currentAssessment.ercsScore && this.currentAssessment.riskLevel;
    }

    resetForm() {
        document.getElementById('assessment-form').reset();
        document.querySelectorAll('.severity-option--selected').forEach(el => 
            el.classList.remove('severity-option--selected'));
        document.querySelectorAll('.barrier-option--selected').forEach(el => 
            el.classList.remove('barrier-option--selected'));
        this.clearRiskCalculation();
        this.currentAssessment = {};
        this.generateFindingId();
    }

    updateDashboard() {
        const stats = this.calculateStats();
        
        document.getElementById('total-findings').textContent = stats.total;
        document.getElementById('critical-findings').textContent = stats.critical;
        document.getElementById('elevated-findings').textContent = stats.elevated;
        document.getElementById('acceptable-findings').textContent = stats.acceptable;
        
        this.updateRecentFindings();
    }

    calculateStats() {
        const stats = {
            total: this.findings.length,
            critical: 0,
            elevated: 0,
            acceptable: 0
        };
        
        this.findings.forEach(finding => {
            switch (finding.riskLevel) {
                case 'RED':
                    stats.critical++;
                    break;
                case 'YELLOW':
                    stats.elevated++;
                    break;
                case 'GREEN':
                    stats.acceptable++;
                    break;
            }
        });
        
        return stats;
    }

    updateRecentFindings() {
        const container = document.getElementById('recent-findings-list');
        const recentFindings = this.findings
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
        
        if (recentFindings.length === 0) {
            container.innerHTML = '<p class="empty-state">No findings assessed yet. Click "Start New Assessment" to begin.</p>';
            return;
        }
        
        container.innerHTML = recentFindings.map(finding => `
            <div class="card" style="margin-bottom: 16px;">
                <div class="card__body">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${finding.findingId}</strong> - ${finding.organizationName}
                            <br>
                            <small style="color: var(--color-text-secondary);">${finding.regulatoryArea} | ${new Date(finding.auditDate).toLocaleDateString()}</small>
                        </div>
                        <span class="status status--${finding.riskLevel === 'RED' ? 'error' : finding.riskLevel === 'YELLOW' ? 'warning' : 'success'}">
                            ${finding.ercsScore} (${finding.riskLevel})
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateHistory() {
        const tbody = document.getElementById('history-tbody');
        const riskFilter = document.getElementById('risk-filter').value;
        const areaFilter = document.getElementById('area-filter').value;
        
        let filteredFindings = this.findings;
        
        if (riskFilter) {
            filteredFindings = filteredFindings.filter(f => f.riskLevel === riskFilter);
        }
        
        if (areaFilter) {
            filteredFindings = filteredFindings.filter(f => f.regulatoryArea === areaFilter);
        }
        
        if (filteredFindings.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No findings match the current filters.</td></tr>';
            return;
        }
        
        tbody.innerHTML = filteredFindings
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(finding => `
                <tr>
                    <td>${new Date(finding.auditDate).toLocaleDateString()}</td>
                    <td>${finding.organizationName}</td>
                    <td>${finding.findingId}</td>
                    <td><strong>${finding.ercsScore}</strong></td>
                    <td><span class="status status--${finding.riskLevel === 'RED' ? 'error' : finding.riskLevel === 'YELLOW' ? 'warning' : 'success'}">${finding.riskLevel}</span></td>
                    <td>${finding.regulatoryArea}</td>
                    <td>
                        <div class="finding-actions">
                            <button class="btn btn--small btn--outline" onclick="app.viewFinding(${finding.id})">View</button>
                            <button class="btn btn--small btn--secondary" onclick="app.deleteFinding(${finding.id})">Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('');
    }

    viewFinding(id) {
        const finding = this.findings.find(f => f.id === id);
        if (!finding) return;
        
        const modal = document.getElementById('finding-modal');
        const modalBody = document.getElementById('modal-body');
        
        modalBody.innerHTML = `
            <div class="finding-details">
                <h4>Basic Information</h4>
                <p><strong>Finding ID:</strong> ${finding.findingId}</p>
                <p><strong>Organization:</strong> ${finding.organizationName}</p>
                <p><strong>Audit Date:</strong> ${new Date(finding.auditDate).toLocaleDateString()}</p>
                <p><strong>Regulatory Area:</strong> ${finding.regulatoryArea}</p>
                <p><strong>Auditor:</strong> ${finding.auditorName}</p>
                <p><strong>Compliance Area:</strong> ${finding.complianceArea}</p>
                
                <h4>Finding Description</h4>
                <p>${finding.findingDescription}</p>
                
                <h4>Risk Assessment</h4>
                <p><strong>Severity:</strong> ${finding.severity}</p>
                <p><strong>Probability Score:</strong> ${finding.probabilityScore}</p>
                <p><strong>ERCS Score:</strong> ${finding.ercsScore}</p>
                <p><strong>Risk Level:</strong> <span class="status status--${finding.riskLevel === 'RED' ? 'error' : finding.riskLevel === 'YELLOW' ? 'warning' : 'success'}">${finding.riskLevel}</span></p>
                
                <h4>Barrier Assessment</h4>
                ${this.data.barriers.map(barrier => {
                    const effectiveness = finding.barriers[barrier.id];
                    const effectivenessLabel = this.data.barrier_effectiveness.find(e => e.value === effectiveness)?.label || 'Not assessed';
                    return `<p><strong>${barrier.name}:</strong> ${effectivenessLabel} (${effectiveness})</p>`;
                }).join('')}
            </div>
        `;
        
        modal.classList.add('modal--active');
    }

    deleteFinding(id) {
        if (confirm('Are you sure you want to delete this finding?')) {
            this.findings = this.findings.filter(f => f.id !== id);
            localStorage.setItem('ercs-findings', JSON.stringify(this.findings));
            this.updateHistory();
            this.updateDashboard();
        }
    }

    updateReports() {
        this.updateComplianceBreakdown();
        this.renderCharts();
    }

    updateComplianceBreakdown() {
        const container = document.getElementById('compliance-breakdown');
        const complianceCounts = {};
        
        // Initialize counts
        this.data.compliance_areas.forEach(area => {
            complianceCounts[area] = 0;
        });
        
        // Count findings by compliance area
        this.findings.forEach(finding => {
            if (finding.complianceArea && complianceCounts.hasOwnProperty(finding.complianceArea)) {
                complianceCounts[finding.complianceArea]++;
            }
        });
        
        container.innerHTML = Object.entries(complianceCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([area, count]) => `
                <div class="compliance-item">
                    <span class="compliance-name">${area}</span>
                    <span class="compliance-count">${count}</span>
                </div>
            `).join('');
    }

    renderCharts() {
        // Simple chart rendering with divs (since we can't use external chart libraries)
        this.renderRiskDistributionChart();
        this.renderRegulatoryAreaChart();
    }

    renderRiskDistributionChart() {
        const container = document.getElementById('risk-distribution-chart');
        const stats = this.calculateStats();
        
        if (stats.total === 0) {
            container.innerHTML = '<div style="text-align: center; color: var(--color-text-secondary);">No data available</div>';
            return;
        }
        
        const chartData = [
            { label: 'Critical', value: stats.critical, color: 'var(--color-error)' },
            { label: 'Elevated', value: stats.elevated, color: 'var(--color-warning)' },
            { label: 'Acceptable', value: stats.acceptable, color: 'var(--color-success)' }
        ];
        
        const maxValue = Math.max(...chartData.map(d => d.value)) || 1;
        
        container.innerHTML = chartData.map(data => `
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <div style="width: 80px; font-size: 12px;">${data.label}:</div>
                <div style="flex: 1; background: var(--color-secondary); border-radius: 4px; height: 20px; margin: 0 8px; position: relative;">
                    <div style="background: ${data.color}; height: 100%; width: ${(data.value / maxValue) * 100}%; border-radius: 4px;"></div>
                </div>
                <div style="width: 30px; font-size: 12px; text-align: right;">${data.value}</div>
            </div>
        `).join('');
    }

    renderRegulatoryAreaChart() {
        const container = document.getElementById('regulatory-area-chart');
        const areaCounts = {};
        
        this.data.regulatory_areas.forEach(area => {
            areaCounts[area] = 0;
        });
        
        this.findings.forEach(finding => {
            if (finding.regulatoryArea && areaCounts.hasOwnProperty(finding.regulatoryArea)) {
                areaCounts[finding.regulatoryArea]++;
            }
        });
        
        const maxValue = Math.max(...Object.values(areaCounts)) || 1;
        
        container.innerHTML = Object.entries(areaCounts).map(([area, count]) => `
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <div style="width: 80px; font-size: 12px;">${area}:</div>
                <div style="flex: 1; background: var(--color-secondary); border-radius: 4px; height: 20px; margin: 0 8px; position: relative;">
                    <div style="background: var(--color-primary); height: 100%; width: ${(count / maxValue) * 100}%; border-radius: 4px;"></div>
                </div>
                <div style="width: 30px; font-size: 12px; text-align: right;">${count}</div>
            </div>
        `).join('');
    }

    sortHistory(sortBy) {
        // Simple sorting implementation
        this.findings.sort((a, b) => {
            let valueA = a[sortBy];
            let valueB = b[sortBy];
            
            if (sortBy === 'date' || sortBy === 'auditDate') {
                valueA = new Date(a.auditDate);
                valueB = new Date(b.auditDate);
            }
            
            if (valueA < valueB) return -1;
            if (valueA > valueB) return 1;
            return 0;
        });
        
        this.updateHistory();
    }

    exportData() {
        const dataStr = JSON.stringify(this.findings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `ercs-findings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Initialize the application
const app = new ERCSApp();