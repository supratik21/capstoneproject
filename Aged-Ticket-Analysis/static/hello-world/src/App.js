import React, { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';
import Chart from 'chart.js/auto';

import DynamicTable from '@atlaskit/dynamic-table';

function App() {
    const [agedTicketData, setAgedTicketData] = useState([]);
    const [agedTicketChartData, setAgedTicketChartData] = useState([]);

    useEffect(() => {
        Promise.all([
            invoke('getAgedTicket', { example: 'my-invoke-variable' }),
            invoke('getAgedTicketChartData', { example: 'my-invoke-variable' })
        ]).then(([agedTicketResponse, chartDataResponse]) => {
            setAgedTicketData(agedTicketResponse);
            setAgedTicketChartData(chartDataResponse);
        }).catch(error => {
            console.error('Error fetching data:', error);
            // Set an error state or display an error message to the user
        });
    }, []);

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
            <h2>Aged Ticket Manage Console</h2>
            <table className="aui">
                <thead>
                    <tr>
                        <th id="bucket">Category</th>
                        <th id="count">Number of Issues</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td headers="last_month">Last Month</td>
                        <td headers="count_last_month">{agedTicketData.length > 0 ? agedTicketData[0].last_month : '0'}</td>
                    </tr>
                    <tr>
                        <td headers="last_one_to_three_months">Last 1-3 months</td>
                        <td headers="count_last_one_to_three_months">{agedTicketData.length > 0 ? agedTicketData[0].last_one_to_three_months : '0'}</td>
                    </tr>
                    <tr>
                        <td headers="last_three_to_six_month">Last 3-6 months</td>
                        <td headers="count_last_three_to_six_month">{agedTicketData.length > 0 ? agedTicketData[0].last_three_to_six_month : '0'}</td>
                    </tr>
                    <tr>
                        <td headers="last_six_to_nine_months">Last 6-9 months</td>
                        <td headers="count_last_six_to_nine_months">{agedTicketData.length > 0 ? agedTicketData[0].last_six_to_nine_months : '0'}</td>
                    </tr>
                    <tr>
                        <td headers="more_than_nine_months">More than 9 months</td>
                        <td headers="count_more_than_nine_months">{agedTicketData.length > 0 ? agedTicketData[0].more_than_nine_months : '0'}</td>
                    </tr>
                </tbody>
            </table>
            <div>
                <canvas id="myChart" style={{ width: '100%', maxWidth: '600px' }}></canvas>
            </div>
            {agedTicketChartData.length > 0 ? agedTicketChartData[0].open_last_month : 'Loading...'}
        </div>
    );
}

export default App;