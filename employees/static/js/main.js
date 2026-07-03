document.addEventListener('DOMContentLoaded', function () {
    // 1. Auto-dismiss Alert Messages
    const alerts = document.querySelectorAll('.alert-custom');
    alerts.forEach(function (alert) {
        setTimeout(function () {
            alert.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-10px)';
            setTimeout(function () {
                alert.remove();
            }, 500);
        }, 4000);
    });

    // 2. Mobile Sidebar Toggle
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function (e) {
            if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== toggleBtn) {
                sidebar.classList.remove('open');
            }
        });
    }

    // 3. Render Chart.js Department Distribution Graph
    const chartCanvas = document.getElementById('departmentChart');
    if (chartCanvas) {
        const labels = JSON.parse(chartCanvas.getAttribute('data-labels') || '[]');
        const values = JSON.parse(chartCanvas.getAttribute('data-values') || '[]');

        if (labels.length === 0) {
            // Draw dummy chart if no data is available
            const ctx = chartCanvas.getContext('2d');
            ctx.fillStyle = '#64748b';
            ctx.font = '14px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText('No data available. Add employees to view stats.', chartCanvas.width / 2, chartCanvas.height / 2);
        } else {
            const ctx = chartCanvas.getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Employees',
                        data: values,
                        backgroundColor: [
                            '#4f46e5', // HR/Engineering
                            '#10b981', // Sales
                            '#f59e0b', // Marketing
                            '#3b82f6', // Finance
                            '#ef4444', // Support
                            '#8b5cf6', // Operations
                            '#ec4899'  // HR
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: {
                                    family: 'Outfit',
                                    size: 11
                                },
                                usePointStyle: true,
                                padding: 15
                            }
                        },
                        tooltip: {
                            bodyFont: {
                                family: 'Outfit'
                            },
                            titleFont: {
                                family: 'Outfit',
                                weight: 'bold'
                            }
                        }
                    },
                    cutout: '65%'
                }
            });
        }
    }
});
