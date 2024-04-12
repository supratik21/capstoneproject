import React, { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';
import Chart from 'chart.js/auto';

import DynamicTable from '@atlaskit/dynamic-table';

function App() {
    const [agedTicketData, setAgedTicketData] = useState([]);
    const [agedTicketChartData, setAgedTicketChartData] = useState([]);
    const [agedTicketByAssignee, setAgedTicketByAssignee] = useState([]);

    useEffect(() => {
        Promise.all([
            invoke('getAgedTicket', { example: 'my-invoke-variable' }),
            invoke('getAgedTicketChartData', { example: 'my-invoke-variable' }),
            invoke('getAgedTicketByAssignee', { example: 'my-invoke-variable' }),
        ]).then(([agedTicketResponse, chartDataResponse, perAssigneeResponse]) => {
            setAgedTicketData(agedTicketResponse);
            setAgedTicketChartData(chartDataResponse);
            setAgedTicketByAssignee(perAssigneeResponse);
        }).catch(error => {
            console.error('Error fetching data:', error);
            // Set an error state or display an error message to the user
        });
    }, []);

    useEffect(() => {
        if (agedTicketByAssignee.length > 0) {
            const assigneeNames = agedTicketByAssignee.map(data => data.assignee);
            const ticketCounts = agedTicketByAssignee.map(data => data.count);
    
            const pieChartCtx = document.getElementById('assigneePieChart').getContext('2d');
            new Chart(pieChartCtx, {
                type: 'pie',
                data: {
                    labels: assigneeNames,
                    datasets: [{
                        data: ticketCounts,
                        backgroundColor: [
                            // Add as many colors as you have assignees
                            'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan'
                        ],
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                        }
                    }
                },
            });
        }
    }, [agedTicketByAssignee]);

    useEffect(() => {
        if (agedTicketChartData.length > 0) {
            const currentDate = new Date();
            const lastSixMonths = [];
            const monthNames = [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];

            for (let i = 5; i >= 0; i--) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const month = monthNames[date.getMonth()];
                lastSixMonths.push(month);
            }

            const yValues = [
                agedTicketChartData[0].open_fifth_last_month,
                agedTicketChartData[0].open_fourth_last_month,
                agedTicketChartData[0].open_third_last_month,
                agedTicketChartData[0].open_second_last_month,
                agedTicketChartData[0].open_last_month,
                agedTicketChartData[0].open_this_month,
            ];
            const barColors = ["red", "green", "blue", "orange", "pink", "grey"];

            const ctx = document.getElementById('myChart');
            new Chart(ctx, {
                type: "bar",
                data: {
                    labels: lastSixMonths,
                    datasets: [{
                        backgroundColor: barColors,
                        data: yValues
                    }]
                },
                options: {
                    title: {
                        display: true,
                        text: "Aged Ticket Chart"
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }, [agedTicketChartData]);

    return (
        <div>
            <table className="aui">
                <thead>
                    <tr>
                        <th id="bucket">Category</th>
                        <th id="count">Number of Issues</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td headers="last_month">Last 30 days</td>
                        <td headers="count_last_month">{agedTicketData.length > 0 ? agedTicketData[0].last_month : "Loading..."}</td>
                    </tr>
                    <tr>
                        <td headers="last_one_to_three_months">Last 1-3 months</td>
                        <td headers="count_last_one_to_three_months">{agedTicketData.length > 0 ? agedTicketData[0].last_one_to_three_months : "Loading..."}</td>
                    </tr>
                    <tr>
                        <td headers="last_three_to_six_month">Last 3-6 months</td>
                        <td headers="count_last_three_to_six_month">{agedTicketData.length > 0 ? agedTicketData[0].last_three_to_six_month : "Loading..."}</td>
                    </tr>
                    <tr>
                        <td headers="last_six_to_nine_months">Last 6-9 months</td>
                        <td headers="count_last_six_to_nine_months">{agedTicketData.length > 0 ? agedTicketData[0].last_six_to_nine_months : "Loading..."}</td>
                    </tr>
                    <tr>
                        <td headers="more_than_nine_months">More than 9 months</td>
                        <td headers="count_more_than_nine_months">{agedTicketData.length > 0? agedTicketData[0].more_than_nine_months : "Loading..."}</td>
                    </tr>
                </tbody>
            </table>
            <div style={{ height: '20px' }}></div> 
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                <div style={{ flex: 2 }}>
                    <h3>Aged Ticket Chart</h3>
                    <div style={{ height: '20px' }}></div> 
                    <canvas id="myChart" style={{ width: '100%', maxWidth: '800px' }}></canvas>
                </div>
                <div style={{ flex: 1 }}>
                    <h3>Tickets per Assignee</h3>
                    <div style={{ height: '20px' }}></div> 
                    <canvas id="assigneePieChart" style={{ width: '100%', maxWidth: '400px' }}></canvas>
                </div>
            </div>
        </div>
    );
    
}

export default App;