import React, { useEffect, useState, useRef } from 'react';
import { invoke } from '@forge/bridge';
import Chart from 'chart.js/auto';

function App() {
    const [metrics, setMetrics] = useState(null);
    const chartRefs = useRef({
        leadTime: null,
        cffr: null,
        mttr: null,
        tput: null
    });

    useEffect(() => {
        invoke('getMetrics', { example: 'my-invoke-variable' })
            .then(data => {
                console.log('Metrics loaded:', data.lead_time);
                setMetrics(data.lead_time); // Assuming the data structure includes a 'lead_time' property
            })
            .catch(error => {
                console.error('Failed to load metrics:', error);
                setMetrics(null);
            });
    }, []);

    useEffect(() => {
        if (metrics) {
            const currentDate = new Date();
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const lastSixMonths = [];

            // Generate labels for the last six months
            for (let i = 5; i >= 0; i--) {
                const monthIndex = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1).getMonth();
                lastSixMonths.push(monthNames[monthIndex]);
            }

            const createChart = (canvasId, data, label) => {
                const ctx = document.getElementById(canvasId).getContext('2d');
                if (chartRefs.current[canvasId]) {
                    chartRefs.current[canvasId].destroy(); // Destroy the chart if it exists
                }
                chartRefs.current[canvasId] = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: lastSixMonths,
                        datasets: [{
                            label: label,
                            data: data,
                            fill: true,
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                            borderColor: 'rgb(75, 192, 192)'
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            }
                        }
                    }
                });
            };

            createChart('leadTime', [
                metrics.this_month_lead_time,
                metrics.last_month_lead_time,
                metrics.second_last_month_lead_time,
                metrics.third_last_month_lead_time,
                metrics.fourth_last_month_lead_time,
                metrics.fifth_last_month_lead_time
            ], 'Lead Time');

            createChart('cffr', [
                metrics.this_month_cffr,
                metrics.last_month_cffr,
                metrics.second_last_month_cffr,
                metrics.third_last_month_cffr,
                metrics.fourth_last_month_cffr,
                metrics.fifth_last_month_cffr
            ], 'Change Failure Rate');

            createChart('mttr', [
                metrics.this_month_mttr,
                metrics.last_month_mttr,
                metrics.second_last_month_mttr,
                metrics.third_last_month_mttr,
                metrics.fourth_last_month_mttr,
                metrics.fifth_last_month_mttr
            ], 'Mean Time to Recover');

            createChart('tput', [
                metrics.this_month_tput,
                metrics.last_month_tput,
                metrics.second_last_month_tput,
                metrics.third_last_month_tput,
                metrics.fourth_last_month_tput,
                metrics.fifth_last_month_tput
            ], 'Throughput');
        }
    }, [metrics]); // Dependency array ensures useEffect runs only when metrics changes

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh', overflow: 'auto' }}>
            {metrics ? (
                <div style={{ width: '95%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px 0' }}>
                    <h2>Project Metrics Dashboard</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', flexWrap: 'wrap', marginBottom: '40px' }}>  {/* Increased bottom margin */}
                        <div style={{ width: '48%', margin: '1%', padding: '20px 10px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h3>Lead Time</h3>
                            <div style={{ height: '20px' }}></div>  {/* Additional space for the header */}
                            <canvas id="leadTime"></canvas>
                        </div>
                        <div style={{ width: '48%', margin: '1%', padding: '20px 10px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h3>Change Failure Rate (CFR)</h3>
                            <div style={{ height: '20px' }}></div>  {/* Additional space for the header */}
                            <canvas id="cffr"></canvas>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', flexWrap: 'wrap', marginBottom: '40px' }}>  {/* Increased bottom margin */}
                        <div style={{ width: '48%', margin: '1%', padding: '20px 10px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h3>Mean Time To Recovery (MTTR)</h3>
                            <div style={{ height: '20px' }}></div>  {/* Additional space for the header */}
                            <canvas id="mttr"></canvas>
                        </div>
                        <div style={{ width: '48%', margin: '1%', padding: '20px 10px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h3>Throughput</h3>
                            <div style={{ height: '20px' }}></div>  {/* Additional space for the header */}
                            <canvas id="tput"></canvas>
                        </div>
                    </div>
                </div>
            ) : <div>Loading metrics...</div>}
        </div>
    );
    
    
    
    
      
}

export default App;
