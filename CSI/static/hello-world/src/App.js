import React, { useEffect, useState, useRef } from 'react';
import { invoke } from '@forge/bridge';
import Chart from 'chart.js/auto';
import { Table, Head, Row, Cell, Text, Button } from '@forge/ui';

function App() {
    const [data, setData] = useState(null);
    const [bugsCountData, setBugsCountData] = useState([]);
    const [bugByAssignee, setbugByAssignee] = useState([]);
    const [bugsResolvedPerMonth, setBugsResolved] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const recordsPerPage = 20;

    useEffect(() => {
        Promise.all([
            invoke('getText', { example: 'my-invoke-variable' }),
            invoke('getBugsCountPerMonth', {example: 'my-invoke-variable' }),
            invoke('getBugByAssignee', { example: 'my-invoke-variable' }),
            invoke('getResolvedIssues', { example: 'my-invoke-variable' }),
        ]).then(([textResponse, bugsCountResponse, perAssigneeResponse, bugsResolvedMonthly]) => {
            console.info("Fetched data: ", textResponse);
            setData(textResponse);  
            setBugsCountData(bugsCountResponse);  
            setbugByAssignee(perAssigneeResponse);
            setBugsResolved(bugsResolvedMonthly);
        }).catch(error => {
            console.error('Error fetching data:', error);
        });
    }, []);

    useEffect(() => {
        if (bugByAssignee.length > 0) {
            const assigneeNames = bugByAssignee.map(data => data.assignee);
            const ticketCounts = bugByAssignee.map(data => data.count);
    
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
    }, [bugByAssignee]);
    
    useEffect(() => {
        if (bugsCountData.length > 0 && bugsResolvedPerMonth.length > 0) {
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

            const yValues = bugsCountData.map(item => item.count);
            const yValue2 = bugsResolvedPerMonth.map(item => item.count);
            console.info("Checking yvalue2 : ", yValue2);
            const barColors = ["red", "green", "blue", "orange", "pink", "grey"];

            const ctx = document.getElementById('myChart');
            new Chart(ctx, {
                type: "bar",
                data: {
                    labels: lastSixMonths,
                    datasets: [{
                        label: 'Bugs Count',
                        backgroundColor: barColors,
                        data: yValues
                    },
                    {
                        label: 'Bugs Resolved',
                        backgroundColor: barColors,
                        data: yValue2
                    }
                ]
                },
                options: {
                    title: {
                        display: true,
                        text: "CSI Chart"
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }, [bugsCountData, bugsResolvedPerMonth]);

    if (!data || data.length === 0) {
        return <div>Fetching data...</div>;
    }

    const pageData = data ? data.slice(currentPage * recordsPerPage, (currentPage + 1) * recordsPerPage) : [];

    const tableRows = pageData.map((issue, index) => (
        <tr key={index}>
            <td>{issue['Incident Title']}</td>
            <td>{issue['Assignee']}</td>
            <td>{issue['IssueType']}</td>
        </tr>
    ));
    const shouldHidePrev = currentPage === 0;
    const shouldHideNext = currentPage >= Math.ceil(data.length / recordsPerPage) - 1;
    const handleNextPage = () => {
        const totalPages = Math.ceil(data.length / recordsPerPage);
        setCurrentPage(current => (current < totalPages - 1 ? current + 1 : current));
    };

    const handlePrevPage = () => {
        setCurrentPage(current => (current > 0 ? current - 1 : 0));
    };

    return (
        <div>
            <div style={{ height: '20px' }}></div> 
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                <div style={{ flex: 2 }}>
                    <h3>Number of Issues vs Issue Resolved</h3>
                    <div style={{ height: '20px' }}></div> 
                    <canvas id="myChart" style={{ width: '100%', maxWidth: '800px' }}></canvas>
                </div>

                <div style={{ flex: 1 }}>
                    <h3>Bugs Per Assignee</h3>
                    <div style={{ height: '20px' }}></div> 
                    <canvas id="assigneePieChart" style={{ width: '100%', maxWidth: '400px' }}></canvas>
                </div>
            </div>
            <h3>**Bugs Count Per Month (Last 6 Months)**</h3>
            <Table>
                <Head>
                    <Row>
                        <Cell><Text>Incident Title</Text></Cell>
                        <Cell><Text>Assignee</Text></Cell>
                        <Cell><Text>Issue Type</Text></Cell>
                    </Row>
                </Head>        
                {tableRows}
            </Table>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '20px 0' }}>
                {currentPage !== 0 && (
                    <button text="Previous" onClick={handlePrevPage}>Prev.</button>
                )}
                {currentPage < Math.ceil(data.length / recordsPerPage) - 1 && (
                    <button text="Next" onClick={handleNextPage}>Next</button>
                )}
            </div>
        </div>
    );
}

export default App;