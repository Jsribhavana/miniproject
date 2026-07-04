document.addEventListener('DOMContentLoaded', function () {
    /* ==========================================================================
       1. GLOBAL VARIABLES & STATE
       ========================================================================== */
    let deptChart = null;
    let salChart = null;
    const tableRows = document.querySelectorAll('.custom-table tbody tr:not(.empty-row):not(.empty-state-row)');
    const emptyStateRow = document.querySelector('.empty-state-row');

    // Default settings
    if (!localStorage.getItem('admin-sound')) localStorage.setItem('admin-sound', 'true');
    if (!localStorage.getItem('admin-duration')) localStorage.setItem('admin-duration', '4000');
    if (!localStorage.getItem('table-density')) localStorage.setItem('table-density', 'comfortable');

    /* ==========================================================================
       2. THEME MANAGEMENT (DARK MODE)
       ========================================================================== */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
    
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.className = 'fa-solid fa-sun';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        if (themeIcon) themeIcon.className = 'fa-solid fa-moon';
    }
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function () {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                if (themeIcon) themeIcon.className = 'fa-solid fa-moon';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                if (themeIcon) themeIcon.className = 'fa-solid fa-sun';
            }
            updateChartTheme();
        });
    }

    /* ==========================================================================
       3. WEB AUDIO SYNTHESIZER (NOTIFICATION SOUNDS)
       ========================================================================== */
    function playNotificationSound() {
        if (localStorage.getItem('admin-sound') !== 'true') return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            
            // Note 1 (D5)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
            gain1.gain.setValueAtTime(0.04, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
            osc1.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.12);
            
            // Note 2 (A5, delayed slightly)
            setTimeout(() => {
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(880.00, ctx.currentTime);
                gain2.gain.setValueAtTime(0.04, ctx.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
                osc2.start(ctx.currentTime);
                osc2.stop(ctx.currentTime + 0.18);
            }, 80);
        } catch (e) {
            console.warn("Audio Context playback blocked or unsupported.", e);
        }
    }

    /* ==========================================================================
       4. ADMIN NICKNAME INITIALIZATION
       ========================================================================== */
    function updateNicknameDOM(name) {
        // Navbar
        const navName = document.querySelector('.user-profile-btn span');
        if (navName) navName.textContent = name;
        
        // Sidebar
        const sideName = document.querySelector('.sidebar-user-info .username');
        if (sideName) sideName.textContent = name;
        
        // Sidebar Initials
        const sideAvatar = document.querySelector('.sidebar-avatar');
        const navAvatar = document.querySelector('.navbar-avatar');
        const initials = name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() || 'AD';
        if (sideAvatar) sideAvatar.textContent = initials;
        if (navAvatar) navAvatar.textContent = initials;
    }

    const savedNickname = localStorage.getItem('admin-nickname');
    if (savedNickname) {
        updateNicknameDOM(savedNickname);
    }

    /* ==========================================================================
       5. NOTIFICATIONS (TOASTS)
       ========================================================================== */
    const alerts = document.querySelectorAll('.alert-custom');
    alerts.forEach(function (alert) {
        const timeoutDuration = parseInt(localStorage.getItem('admin-duration')) || 4000;
        
        if (timeoutDuration > 0) {
            const autoDismissTimer = setTimeout(function () {
                dismissAlert(alert);
            }, timeoutDuration);
            
            alert.addEventListener('click', function () {
                clearTimeout(autoDismissTimer);
                dismissAlert(alert);
            });
        } else {
            alert.addEventListener('click', function () {
                dismissAlert(alert);
            });
        }
        playNotificationSound();
    });
    
    function dismissAlert(alert) {
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-10px)';
        setTimeout(function () {
            alert.remove();
        }, 300);
    }
    
    window.showNotification = function(message, type = 'info') {
        const container = document.querySelector('.toast-container-custom');
        if (!container) return;
        
        const alert = document.createElement('div');
        alert.className = `alert-custom alert-custom-${type}`;
        
        let icon = 'fa-circle-info';
        if (type === 'success') icon = 'fa-circle-check';
        if (type === 'error' || type === 'danger') icon = 'fa-circle-exclamation';
        if (type === 'warning') icon = 'fa-triangle-exclamation';
        
        alert.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <div>${message}</div>
        `;
        
        container.appendChild(alert);
        playNotificationSound();
        
        const timeoutDuration = parseInt(localStorage.getItem('admin-duration')) || 4000;
        if (timeoutDuration > 0) {
            const timer = setTimeout(() => dismissAlert(alert), timeoutDuration);
            alert.addEventListener('click', () => {
                clearTimeout(timer);
                dismissAlert(alert);
            });
        } else {
            alert.addEventListener('click', () => {
                dismissAlert(alert);
            });
        }
    };

    /* ==========================================================================
       6. SIDEBAR CONTROLS
       ========================================================================== */
    const sidebar = document.querySelector('.sidebar');
    const appContainer = document.querySelector('.app-container');
    const toggleBtn = document.getElementById('sidebar-toggle');
    
    const isSidebarCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    if (isSidebarCollapsed && appContainer && window.innerWidth > 768) {
        appContainer.classList.add('sidebar-collapsed');
    }
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (window.innerWidth <= 768) {
                sidebar.classList.toggle('open');
            } else {
                if (appContainer) {
                    appContainer.classList.toggle('sidebar-collapsed');
                    localStorage.setItem('sidebar-collapsed', appContainer.classList.contains('sidebar-collapsed'));
                }
            }
        });
        
        document.addEventListener('click', function (e) {
            if (window.innerWidth <= 768 && sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== toggleBtn) {
                sidebar.classList.remove('open');
            }
        });
    }

    /* ==========================================================================
       7. RECTIVE REAL-TIME ANALYTICS CALCULATIONS
       ========================================================================== */
    window.calculateAnalytics = function () {
        let totalPayroll = 0;
        let visibleCount = 0;
        let deptDistribution = {};
        
        // Brackets: <$3k, $3k-$5k, $5k-$8k, $8k-$12k, >$12k
        let salaryBrackets = [0, 0, 0, 0, 0]; 

        tableRows.forEach(row => {
            if (row.style.display !== 'none') {
                visibleCount++;
                
                // Salary Calc
                const rawSalary = parseFloat(row.getAttribute('data-salary') || '0');
                totalPayroll += rawSalary;
                
                // Salary Bracket sorting
                if (rawSalary < 3000) {
                    salaryBrackets[0]++;
                } else if (rawSalary >= 3000 && rawSalary < 5000) {
                    salaryBrackets[1]++;
                } else if (rawSalary >= 5000 && rawSalary < 8000) {
                    salaryBrackets[2]++;
                } else if (rawSalary >= 8000 && rawSalary < 12000) {
                    salaryBrackets[3]++;
                } else {
                    salaryBrackets[4]++;
                }
                
                // Department counting
                const dept = row.getAttribute('data-department') || 'Other';
                deptDistribution[dept] = (deptDistribution[dept] || 0) + 1;
            }
        });

        const avgSalary = visibleCount > 0 ? (totalPayroll / visibleCount) : 0;
        
        // Update metric DOM card texts
        const payrollMetric = document.getElementById('payroll-metric-val');
        const avgSalaryMetric = document.getElementById('avg-salary-metric-val');
        
        if (payrollMetric) {
            payrollMetric.textContent = `$${totalPayroll.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }
        if (avgSalaryMetric) {
            avgSalaryMetric.textContent = `$${avgSalary.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }

        // Live update department doughnut chart datasets
        if (deptChart) {
            const labels = Object.keys(deptDistribution);
            const dataValues = Object.values(deptDistribution);
            
            deptChart.data.labels = labels;
            deptChart.data.datasets[0].data = dataValues;
            deptChart.update();
        }

        // Live update salary distribution bar chart datasets
        if (salChart) {
            salChart.data.datasets[0].data = salaryBrackets;
            salChart.update();
        }
    };

    /* ==========================================================================
       8. CLIENT-SIDE LIVE INSTANT SEARCH FILTER
       ========================================================================== */
    const localSearchInput = document.getElementById('local-search-input');
    if (localSearchInput) {
        localSearchInput.addEventListener('keyup', function (e) {
            const query = e.target.value.toLowerCase().trim();
            let matches = 0;
            
            tableRows.forEach(row => {
                const textContent = row.textContent.toLowerCase();
                const match = textContent.includes(query);
                row.style.display = match ? '' : 'none';
                if (match) matches++;
            });
            
            if (emptyStateRow) {
                emptyStateRow.style.display = matches === 0 && tableRows.length > 0 ? '' : 'none';
            }
            
            // Recalculate dashboard graphics and metrics based on query
            window.calculateAnalytics();
        });
    }

    /* ==========================================================================
       9. SLIDE-OVER DETAIL PANEL (DRAWER)
       ========================================================================== */
    const detailsDrawer = document.getElementById('details-drawer');
    const drawerOverlay = document.getElementById('details-drawer-overlay');
    const drawerCloseBtn = document.getElementById('drawer-close-btn');
    
    if (tableRows.length > 0 && detailsDrawer) {
        tableRows.forEach(row => {
            row.addEventListener('click', function (e) {
                if (e.target.closest('.actions-cell') || e.target.closest('.btn-icon-only')) {
                    return;
                }
                
                const id = row.getAttribute('data-id') || '';
                const name = row.getAttribute('data-name') || '';
                const email = row.getAttribute('data-email') || '';
                const phone = row.getAttribute('data-phone') || '';
                const department = row.getAttribute('data-department') || '';
                const designation = row.getAttribute('data-designation') || '';
                const salary = row.getAttribute('data-salary') || '';
                const dateJoined = row.getAttribute('data-date-joined') || '';
                const status = row.getAttribute('data-status') || '';
                const editUrl = row.getAttribute('data-edit-url') || '#';
                const deleteUrl = row.getAttribute('data-delete-url') || '#';
                
                // Populate Drawer fields
                document.getElementById('dr-avatar').innerText = name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
                document.getElementById('dr-name').innerText = name;
                document.getElementById('dr-designation').innerText = designation;
                
                const statusBadge = document.getElementById('dr-status');
                statusBadge.innerText = status;
                statusBadge.className = `badge status-${status.toLowerCase()}`;
                
                document.getElementById('dr-id').innerText = id;
                document.getElementById('dr-email').innerText = email;
                document.getElementById('dr-phone').innerText = phone || 'N/A';
                document.getElementById('dr-department').innerText = department;
                document.getElementById('dr-salary').innerText = salary ? `$${parseFloat(salary).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : 'N/A';
                document.getElementById('dr-date-joined').innerText = dateJoined;
                
                document.getElementById('dr-edit-btn').setAttribute('href', editUrl);
                
                const drDeleteBtn = document.getElementById('dr-delete-btn');
                if (drDeleteBtn) {
                    drDeleteBtn.setAttribute('data-url', deleteUrl);
                    drDeleteBtn.setAttribute('data-name', name);
                    drDeleteBtn.setAttribute('data-id', id);
                }
                
                detailsDrawer.classList.add('open');
                drawerOverlay.classList.add('open');
            });
        });
    }
    
    function closeDrawer() {
        if (detailsDrawer) detailsDrawer.classList.remove('open');
        if (drawerOverlay) drawerOverlay.classList.remove('open');
    }
    
    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

    /* ==========================================================================
       10. CUSTOM DELETE CONFIRMATION MODAL
       ========================================================================== */
    const deleteModal = document.getElementById('delete-modal');
    const deleteOverlay = document.getElementById('delete-modal-overlay');
    const deleteForm = document.getElementById('global-delete-form');
    
    document.addEventListener('click', function (e) {
        const deleteTrigger = e.target.closest('.delete-trigger');
        if (deleteTrigger) {
            e.preventDefault();
            e.stopPropagation();
            
            const url = deleteTrigger.getAttribute('data-url') || deleteTrigger.getAttribute('href');
            const name = deleteTrigger.getAttribute('data-name') || 'this employee';
            const empId = deleteTrigger.getAttribute('data-id') || '';
            
            document.getElementById('del-emp-name').innerText = name;
            document.getElementById('del-emp-id').innerText = empId ? `Employee ID: ${empId}` : '';
            
            if (deleteForm) {
                deleteForm.setAttribute('action', url);
            }
            
            closeDrawer();
            
            if (deleteModal && deleteOverlay) {
                deleteModal.classList.add('open');
                deleteOverlay.classList.add('open');
            }
        }
    });
    
    window.closeDeleteModal = function () {
        if (deleteModal && deleteOverlay) {
            deleteModal.classList.remove('open');
            deleteOverlay.classList.remove('open');
        }
    };
    
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', window.closeDeleteModal);
    if (deleteOverlay) deleteOverlay.addEventListener('click', window.closeDeleteModal);

    /* ==========================================================================
       11. CHART.JS DESIGN SYSTEM INTEGRATION
       ========================================================================== */
    const chartCanvas = document.getElementById('departmentChart');
    const salaryCanvas = document.getElementById('salaryChart');
    
    function getThemeColor(variable) {
        return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    }
    
    function renderCharts() {
        if (typeof Chart === 'undefined') {
            console.warn("Chart.js is not loaded.");
            return;
        }
        // Hide fallback messages
        const fallbacks = document.querySelectorAll('.chart-fallback-msg');
        fallbacks.forEach(f => f.style.display = 'none');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const gridColor = isDark ? '#1F2937' : '#E2E8F0';
        const textColor = getThemeColor('--text-primary');
        const cardBg = getThemeColor('--surface');

        // Doughnut Department Distribution
        if (chartCanvas) {
            const labels = JSON.parse(chartCanvas.getAttribute('data-labels') || '[]');
            const values = JSON.parse(chartCanvas.getAttribute('data-values') || '[]');
            const ctx = chartCanvas.getContext('2d');
            
            if (labels.length === 0) {
                ctx.fillStyle = getThemeColor('--text-secondary');
                ctx.font = '14px Poppins';
                ctx.textAlign = 'center';
                ctx.fillText('No data available.', chartCanvas.width / 2, chartCanvas.height / 2);
            } else {
                deptChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Employees',
                            data: values,
                            backgroundColor: ['#2563EB', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444', '#06B6D4'],
                            borderWidth: 2,
                            borderColor: cardBg
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    color: textColor,
                                    font: { family: 'Poppins', size: 10, weight: '500' },
                                    usePointStyle: true,
                                    padding: 8
                                }
                            },
                            tooltip: {
                                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                                titleColor: isDark ? '#FFFFFF' : '#1E293B',
                                bodyColor: isDark ? '#D1D5DB' : '#334155',
                                borderColor: gridColor,
                                borderWidth: 1,
                                bodyFont: { family: 'Poppins' },
                                titleFont: { family: 'Poppins', weight: 'bold' }
                            }
                        },
                        cutout: '70%'
                    }
                });
            }
        }

        // Bar Salary Bracket Distribution Chart
        if (salaryCanvas) {
            const ctxSal = salaryCanvas.getContext('2d');
            salChart = new Chart(ctxSal, {
                type: 'bar',
                data: {
                    labels: ['<$3k', '$3k-$5k', '$5k-$8k', '$8k-$12k', '>$12k'],
                    datasets: [{
                        label: 'Employee Count',
                        data: [0, 0, 0, 0, 0], // populated dynamically by calculateAnalytics
                        backgroundColor: 'rgba(37, 99, 235, 0.85)',
                        borderColor: '#2563EB',
                        borderWidth: 1,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            grid: { color: gridColor },
                            ticks: { color: textColor, font: { family: 'Poppins', size: 9 }, stepSize: 1 },
                            border: { dash: [4, 4] }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: textColor, font: { family: 'Poppins', size: 9 } }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                            titleColor: isDark ? '#FFFFFF' : '#1E293B',
                            bodyColor: isDark ? '#D1D5DB' : '#334155',
                            borderColor: gridColor,
                            borderWidth: 1,
                            bodyFont: { family: 'Poppins' }
                        }
                    }
                }
            });
        }
    }
    
    function updateChartTheme() {
        if (typeof Chart === 'undefined') return;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = getThemeColor('--text-primary');
        const cardBg = getThemeColor('--surface');
        const gridColor = isDark ? '#1F2937' : '#E2E8F0';
        
        if (deptChart) {
            deptChart.options.plugins.legend.labels.color = textColor;
            deptChart.options.plugins.tooltip.backgroundColor = isDark ? '#1F2937' : '#FFFFFF';
            deptChart.options.plugins.tooltip.titleColor = isDark ? '#FFFFFF' : '#1E293B';
            deptChart.options.plugins.tooltip.bodyColor = isDark ? '#D1D5DB' : '#334155';
            deptChart.options.plugins.tooltip.borderColor = gridColor;
            deptChart.data.datasets[0].borderColor = cardBg;
            deptChart.update();
        }

        if (salChart) {
            salChart.options.scales.y.grid.color = gridColor;
            salChart.options.scales.y.ticks.color = textColor;
            salChart.options.scales.x.ticks.color = textColor;
            salChart.options.plugins.tooltip.backgroundColor = isDark ? '#1F2937' : '#FFFFFF';
            salChart.options.plugins.tooltip.titleColor = isDark ? '#FFFFFF' : '#1E293B';
            salChart.options.plugins.tooltip.bodyColor = isDark ? '#D1D5DB' : '#334155';
            salChart.options.plugins.tooltip.borderColor = gridColor;
            salChart.update();
        }
    }
    
    renderCharts();
    window.calculateAnalytics(); // run initial computations

    /* ==========================================================================
       12. INTERACTIVE MODALS - ACTIVATED REPORT DATA
       ========================================================================== */
    const globalModalOverlay = document.getElementById('global-action-overlay');
    const globalModal = document.getElementById('global-action-modal');
    const modalContent = document.getElementById('global-modal-content');
    
    window.openActionModal = function(type) {
        if (!globalModalOverlay || !globalModal || !modalContent) return;
        
        const accent = globalModal.querySelector('.modal-header-accent');
        accent.className = 'modal-header-accent';
        
        let title = '';
        let bodyHtml = '';
        
        if (type === 'reports') {
            accent.classList.add('primary');
            title = 'Company Analytics & Reports';
            
            // Calculate active report variables in real-time
            let totalPayroll = 0;
            let activeStaff = 0;
            let inactiveStaff = 0;
            let maxSalary = 0;
            let maxSalaryDept = 'N/A';
            let maxSalaryName = 'N/A';
            let deptTotals = {};
            
            tableRows.forEach(row => {
                const salary = parseFloat(row.getAttribute('data-salary') || '0');
                const status = row.getAttribute('data-status') || 'Inactive';
                const dept = row.getAttribute('data-department') || 'Unassigned';
                const name = row.getAttribute('data-name') || 'Unnamed';
                
                totalPayroll += salary;
                if (status === 'Active') activeStaff++;
                else inactiveStaff++;
                
                if (salary > maxSalary) {
                    maxSalary = salary;
                    maxSalaryDept = dept;
                    maxSalaryName = name;
                }
                
                if (!deptTotals[dept]) {
                    deptTotals[dept] = { count: 0, payroll: 0 };
                }
                deptTotals[dept].count++;
                deptTotals[dept].payroll += salary;
            });
            
            const totalCount = activeStaff + inactiveStaff;
            const avgSalary = totalCount > 0 ? (totalPayroll / totalCount) : 0;
            
            // Build report lists
            let deptRows = '';
            Object.keys(deptTotals).forEach(deptName => {
                const item = deptTotals[deptName];
                const deptAvg = item.count > 0 ? (item.payroll / item.count) : 0;
                deptRows += `
                    <tr>
                        <td><strong>${deptName}</strong></td>
                        <td>${item.count} Staff</td>
                        <td>$${item.payroll.toLocaleString('en-US', {maximumFractionDigits:0})}</td>
                        <td>$${deptAvg.toLocaleString('en-US', {maximumFractionDigits:0})}</td>
                    </tr>
                `;
            });
            
            bodyHtml = `
                <div class="modal-icon-header">
                    <div class="modal-icon-circle primary"><i class="fa-solid fa-chart-line"></i></div>
                    <div class="modal-title">${title}</div>
                </div>
                <p class="modal-text" style="margin-top:0.5rem; font-size:0.85rem;">Generated report compiled from loaded administrative directories.</p>
                
                <!-- Metrics Report Cards -->
                <div class="reports-data-grid" style="margin-top:1rem;">
                    <div class="report-summary-box">
                        <div class="val" style="font-size: 1.15rem;">$${totalPayroll.toLocaleString('en-US', {maximumFractionDigits:0})}</div>
                        <div class="lbl">Total Payroll</div>
                    </div>
                    <div class="report-summary-box">
                        <div class="val" style="font-size: 1.15rem;">$${avgSalary.toLocaleString('en-US', {maximumFractionDigits:0})}</div>
                        <div class="lbl">Avg Salary</div>
                    </div>
                    <div class="report-summary-box">
                        <div class="val" style="font-size: 1.15rem;">$${maxSalary.toLocaleString('en-US', {maximumFractionDigits:0})}</div>
                        <div class="lbl">Max Salary</div>
                    </div>
                </div>
                
                <!-- Highest earner alert -->
                <div style="font-size:0.75rem; background-color:var(--primary-light); color:var(--primary); padding:0.6rem; border-radius:var(--radius-sm); border:1px solid rgba(37,99,235,0.2); margin-bottom:1rem; display:flex; justify-content:space-between;">
                    <span><i class="fa-solid fa-trophy me-1"></i> Highest Earning Profile: <strong>${maxSalaryName}</strong></span>
                    <span>$${maxSalary.toLocaleString('en-US')} (${maxSalaryDept})</span>
                </div>
                
                <!-- Report Table -->
                <div style="max-height:160px; overflow-y:auto; border:1px solid var(--border); border-radius:var(--radius-sm); margin-bottom:1rem;">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Department</th>
                                <th>Count</th>
                                <th>Total Payroll</th>
                                <th>Avg Salary</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${deptRows || '<tr><td colspan="4" style="text-align:center;">No records available</td></tr>'}
                        </tbody>
                    </table>
                </div>

                <!-- Export Directory buttons -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
                    <button onclick="exportCSVDirectory()" class="btn btn-primary" style="padding:0.65rem 1rem; font-size:0.85rem;">
                        <i class="fa-solid fa-file-csv"></i> Download CSV
                    </button>
                    <button onclick="window.print()" class="btn btn-outline" style="padding:0.65rem 1rem; font-size:0.85rem;">
                        <i class="fa-solid fa-print"></i> Print Report
                    </button>
                </div>
            `;
        } 
        else if (type === 'settings') {
            accent.classList.add('primary');
            title = 'System Configuration';
            
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const soundActive = localStorage.getItem('admin-sound') === 'true';
            const savedNickname = localStorage.getItem('admin-nickname') || 'Administrator';
            const alertDuration = localStorage.getItem('admin-duration') || '4000';
            
            bodyHtml = `
                <div class="modal-icon-header">
                    <div class="modal-icon-circle primary"><i class="fa-solid fa-sliders"></i></div>
                    <div class="modal-title">${title}</div>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:1.1rem; margin-top:1.25rem;">
                    <!-- Admin Profile Settings -->
                    <div style="display:flex; align-items:center; justify-content:space-between;">
                        <div>
                            <div style="font-size:0.85rem; font-weight:600;">Admin User Profile</div>
                            <div style="font-size:0.7rem; color:var(--text-secondary);">Customize name shown in navigation headers.</div>
                        </div>
                        <input type="text" id="settings-nickname" class="form-control" style="width:170px; padding:0.4rem 0.75rem; font-size:0.8rem; height:32px;" value="${savedNickname}">
                    </div>
                    
                    <!-- Alert sound settings -->
                    <div style="display:flex; align-items:center; justify-content:space-between; border-top:1px solid var(--border); padding-top:0.75rem;">
                        <div>
                            <div style="font-size:0.85rem; font-weight:600;">Web Audio Synth Chime</div>
                            <div style="font-size:0.7rem; color:var(--text-secondary);">Plays short audio tone on system alert triggers.</div>
                        </div>
                        <button onclick="toggleAudioSettings()" id="settings-sound-btn" class="btn ${soundActive ? 'btn-primary' : 'btn-outline'}" style="padding:0.35rem 0.7rem; font-size:0.75rem; height:30px;">
                            ${soundActive ? 'Sound On' : 'Muted'}
                        </button>
                    </div>

                    <!-- Alert hide timer settings -->
                    <div style="display:flex; align-items:center; justify-content:space-between; border-top:1px solid var(--border); padding-top:0.75rem;">
                        <div>
                            <div style="font-size:0.85rem; font-weight:600;">Alert Hide Timeout</div>
                            <div style="font-size:0.7rem; color:var(--text-secondary);">Specify duration popups remain active.</div>
                        </div>
                        <select id="settings-alert-duration" class="form-select" style="width:120px; padding:0.25rem 0.5rem; font-size:0.75rem; height:30px;" onchange="saveAlertDuration(this)">
                            <option value="2000" ${alertDuration === '2000' ? 'selected' : ''}>2 Seconds</option>
                            <option value="4000" ${alertDuration === '4000' ? 'selected' : ''}>4 Seconds</option>
                            <option value="8000" ${alertDuration === '8000' ? 'selected' : ''}>8 Seconds</option>
                            <option value="0" ${alertDuration === '0' ? 'selected' : ''}>Persistent</option>
                        </select>
                    </div>

                    <!-- Themes and Density -->
                    <div style="display:flex; align-items:center; justify-content:space-between; border-top:1px solid var(--border); padding-top:0.75rem;">
                        <div>
                            <div style="font-size:0.85rem; font-weight:600;">Table View Density</div>
                            <div style="font-size:0.7rem; color:var(--text-secondary);">Adjust data rows spacings margins.</div>
                        </div>
                        <div style="display:flex; gap:0.25rem;">
                            <button onclick="setTableDensity('compact')" class="btn btn-outline" style="padding:0.25rem 0.5rem; font-size:0.75rem; height:28px;">Compact</button>
                            <button onclick="setTableDensity('comfortable')" class="btn btn-outline" style="padding:0.25rem 0.5rem; font-size:0.75rem; height:28px;">Normal</button>
                        </div>
                    </div>

                    <div style="display:flex; align-items:center; justify-content:space-between; border-top:1px solid var(--border); padding-top:0.75rem;">
                        <div>
                            <div style="font-size:0.85rem; font-weight:600;">Accent Color Theme</div>
                            <div style="font-size:0.7rem; color:var(--text-secondary);">Adjust focus coloring styles.</div>
                        </div>
                        <div style="display:flex; gap:0.35rem;">
                            <span onclick="setBrandTheme('#2563EB')" style="display:inline-block; width:18px; height:18px; border-radius:50%; background-color:#2563EB; cursor:pointer; border:2px solid white; box-shadow:0 0 0 1px #2563EB;"></span>
                            <span onclick="setBrandTheme('#10B981')" style="display:inline-block; width:18px; height:18px; border-radius:50%; background-color:#10B981; cursor:pointer; border:2px solid white; box-shadow:0 0 0 1px #10B981;"></span>
                            <span onclick="setBrandTheme('#8B5CF6')" style="display:inline-block; width:18px; height:18px; border-radius:50%; background-color:#8B5CF6; cursor:pointer; border:2px solid white; box-shadow:0 0 0 1px #8B5CF6;"></span>
                            <span onclick="setBrandTheme('#EF4444')" style="display:inline-block; width:18px; height:18px; border-radius:50%; background-color:#EF4444; cursor:pointer; border:2px solid white; box-shadow:0 0 0 1px #EF4444;"></span>
                        </div>
                    </div>
                </div>
            `;
        } 
        else if (type === 'departments') {
            accent.classList.add('primary');
            title = 'Department Analytics';
            
            let deptHtml = '';
            if (tableRows.length > 0) {
                let deptDistribution = {};
                tableRows.forEach(row => {
                    const dept = row.getAttribute('data-department') || 'Unassigned';
                    deptDistribution[dept] = (deptDistribution[dept] || 0) + 1;
                });
                
                deptHtml = '<div style="display:flex; flex-direction:column; gap:0.75rem;">';
                const total = tableRows.length;
                Object.keys(deptDistribution).forEach(lbl => {
                    const count = deptDistribution[lbl];
                    const percentage = ((count / total) * 100).toFixed(0);
                    deptHtml += `
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; font-weight:600; margin-bottom:0.25rem;">
                                <span><i class="fa-solid fa-building text-primary me-2"></i>${lbl}</span>
                                <span>${count} Staff (${percentage}%)</span>
                            </div>
                            <div style="background-color:var(--border); height:6px; border-radius:3px; overflow:hidden;">
                                <div style="background-color:var(--primary); height:100%; width:${percentage}%"></div>
                            </div>
                        </div>
                    `;
                });
                deptHtml += '</div>';
            } else {
                deptHtml = '<p class="modal-text">No departments currently populated.</p>';
            }
            
            bodyHtml = `
                <div class="modal-icon-header">
                    <div class="modal-icon-circle primary"><i class="fa-solid fa-building"></i></div>
                    <div class="modal-title">${title}</div>
                </div>
                <div style="margin-top:1.25rem;">
                    ${deptHtml}
                </div>
            `;
        } 
        else if (type === 'attendance') {
            accent.classList.add('warning');
            title = 'Attendance Roster Log';
            
            let rosterList = '';
            if (tableRows.length > 0) {
                rosterList = '<div style="max-height: 250px; overflow-y: auto; display:flex; flex-direction:column; gap:0.5rem; padding-right:5px; margin-top:1rem;">';
                tableRows.forEach(row => {
                    const name = row.getAttribute('data-name');
                    const id = row.getAttribute('data-id');
                    rosterList += `
                        <div style="display:flex; align-items:center; justify-content:space-between; padding:0.5rem; border:1px solid var(--border); border-radius:var(--radius-sm); background-color:var(--surface);">
                            <div>
                                <div style="font-size:0.85rem; font-weight:600;">${name}</div>
                                <div style="font-size:0.7rem; color:var(--text-secondary);">${id}</div>
                            </div>
                            <div style="display:flex; gap:0.25rem;">
                                <button class="btn btn-outline" style="padding:0.2rem 0.45rem; font-size:0.75rem; border-radius:4px; height:28px;" onclick="toggleAttendanceStatus(this, 'present')">Present</button>
                                <button class="btn btn-outline" style="padding:0.2rem 0.45rem; font-size:0.75rem; border-radius:4px; height:28px;" onclick="toggleAttendanceStatus(this, 'absent')">Absent</button>
                            </div>
                        </div>
                    `;
                });
                rosterList += '</div>';
            } else {
                rosterList = '<p class="modal-text">Roster is empty. Register profiles first.</p>';
            }
            
            bodyHtml = `
                <div class="modal-icon-header">
                    <div class="modal-icon-circle warning"><i class="fa-solid fa-clipboard-user"></i></div>
                    <div class="modal-title">${title}</div>
                </div>
                ${rosterList}
            `;
        }
        
        modalContent.innerHTML = bodyHtml;
        globalModalOverlay.classList.add('open');
        globalModal.classList.add('open');

        // Bind event listener to settings nickname input if rendered
        const nickInput = document.getElementById('settings-nickname');
        if (nickInput) {
            nickInput.addEventListener('input', function() {
                const val = nickInput.value.trim() || 'Administrator';
                localStorage.setItem('admin-nickname', val);
                updateNicknameDOM(val);
            });
        }
    };
    
    window.closeActionOverlay = function() {
        if (globalModalOverlay && globalModal) {
            globalModalOverlay.classList.remove('open');
            globalModal.classList.remove('open');
        }
    };
    
    const cancelModalBtn = document.getElementById('cancel-action-btn');
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', window.closeActionOverlay);
    if (globalModalOverlay) globalModalOverlay.addEventListener('click', window.closeActionOverlay);

    // Interactive functions inside modals
    window.toggleAudioSettings = function() {
        const active = localStorage.getItem('admin-sound') === 'true';
        const soundBtn = document.getElementById('settings-sound-btn');
        if (active) {
            localStorage.setItem('admin-sound', 'false');
            if (soundBtn) {
                soundBtn.className = 'btn btn-outline';
                soundBtn.textContent = 'Muted';
            }
            window.showNotification('System alert chimes muted.', 'warning');
        } else {
            localStorage.setItem('admin-sound', 'true');
            if (soundBtn) {
                soundBtn.className = 'btn btn-primary';
                soundBtn.textContent = 'Sound On';
            }
            playNotificationSound();
            window.showNotification('System alert chimes enabled.', 'success');
        }
    };

    window.saveAlertDuration = function(select) {
        localStorage.setItem('admin-duration', select.value);
        window.showNotification('Notification duration preference updated.', 'success');
    };
    
    window.toggleAttendanceStatus = function(btn, status) {
        const parent = btn.parentElement;
        parent.querySelectorAll('button').forEach(b => {
            b.className = 'btn btn-outline';
            b.style.backgroundColor = '';
            b.style.color = '';
            b.style.borderColor = '';
        });
        
        btn.className = 'btn';
        if (status === 'present') {
            btn.style.backgroundColor = 'var(--success)';
            btn.style.color = '#FFFFFF';
            btn.style.borderColor = 'var(--success)';
            window.showNotification('Employee marked PRESENT', 'success');
        } else if (status === 'absent') {
            btn.style.backgroundColor = 'var(--danger)';
            btn.style.color = '#FFFFFF';
            btn.style.borderColor = 'var(--danger)';
            window.showNotification('Employee marked ABSENT', 'danger');
        }
    };
    
    window.setTableDensity = function(mode) {
        const cells = document.querySelectorAll('.custom-table td, .custom-table th');
        cells.forEach(c => {
            if (mode === 'compact') {
                c.style.padding = '0.5rem 1rem';
            } else {
                c.style.padding = '1rem 1.25rem';
            }
        });
        localStorage.setItem('table-density', mode);
        window.showNotification(`Table density configured to: ${mode.toUpperCase()}`, 'success');
    };
    
    // Apply density config on load
    const savedDensity = localStorage.getItem('table-density');
    if (savedDensity) {
        setTimeout(() => window.setTableDensity(savedDensity), 100);
    }
    
    window.setBrandTheme = function(color) {
        document.documentElement.style.setProperty('--primary', color);
        document.documentElement.style.setProperty('--primary-hover', adjustColorBrightness(color, -20));
        localStorage.setItem('primary-color', color);
        window.showNotification('Focus color brand modified.', 'success');
    };
    
    const savedColor = localStorage.getItem('primary-color');
    if (savedColor) {
        document.documentElement.style.setProperty('--primary', savedColor);
    }
    
    function adjustColorBrightness(hex, percent) {
        let R = parseInt(hex.substring(1,3),16);
        let G = parseInt(hex.substring(3,5),16);
        let B = parseInt(hex.substring(5,7),16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R<255)?R:255;  
        G = (G<255)?G:255;  
        B = (B<255)?B:255;  

        const rHex = (R.toString(16).length==1)?"0"+R.toString(16):R.toString(16);
        const gHex = (G.toString(16).length==1)?"0"+G.toString(16):G.toString(16);
        const bHex = (B.toString(16).length==1)?"0"+B.toString(16):B.toString(16);

        return "#"+rHex+gHex+bHex;
    }

    // Client-side CSV Exporter
    window.exportCSVDirectory = function() {
        if (tableRows.length === 0) {
            window.showNotification('No records found to download.', 'warning');
            return;
        }
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Employee ID,Full Name,Email,Department,Designation,Status,Phone,Monthly Salary,Joining Date\r\n";
        
        tableRows.forEach(row => {
            const id = row.getAttribute('data-id') || '';
            const name = row.getAttribute('data-name') || '';
            const email = row.getAttribute('data-email') || '';
            const department = row.getAttribute('data-department') || '';
            const designation = row.getAttribute('data-designation') || '';
            const status = row.getAttribute('data-status') || '';
            const phone = row.getAttribute('data-phone') || '';
            const salary = row.getAttribute('data-salary') || '';
            const dateJoined = row.getAttribute('data-date-joined') || '';
            
            const line = `"${id}","${name}","${email}","${department}","${designation}","${status}","${phone}","${salary}","${dateJoined}"`;
            csvContent += line + "\r\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "ems_directory_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.showNotification('CSV downloaded successfully.', 'success');
        window.closeActionOverlay();
    };

    /* ==========================================================================
       13. FORM FIELD FLOATING LABEL GLOW INPUTS
       ========================================================================== */
    const inputs = document.querySelectorAll('.form-control, .form-select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (input.hasAttribute('required') && !input.value.trim()) {
                input.style.borderColor = 'var(--danger)';
            } else {
                input.style.borderColor = '';
            }
        });
        
        input.addEventListener('input', function() {
            if (input.value.trim()) {
                input.style.borderColor = 'var(--primary)';
            } else {
                input.style.borderColor = '';
            }
        });
    });

    // Check if Chart.js failed to load after 3s, showing offline state
    setTimeout(() => {
        if (typeof Chart === 'undefined') {
            const fallbacks = document.querySelectorAll('.chart-fallback-msg');
            fallbacks.forEach(f => {
                f.innerHTML = `
                    <i class="fa-solid fa-wifi-slash" style="font-size: 2.5rem; color: var(--danger); display: block; margin-bottom: 0.5rem; opacity: 0.7;"></i>
                    Analytics Offline (CDN Unreachable)
                `;
            });
        }
    }, 3000);
});
