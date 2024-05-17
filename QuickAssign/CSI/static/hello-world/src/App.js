import React, { useEffect, useState, useRef } from 'react';
import { invoke } from '@forge/bridge';
import Chart from 'chart.js/auto';

function App() {
    const [data, setData] = useState(null);
    const [bugsCountData, setBugsCountData] = useState([]);
    const [cumulativeBugsCountData, setCumulativeBugsCountData] = useState([]);
    const [bugByAssignee, setBugByAssignee] = useState([]);
    const [bugsResolvedPerMonth, setBugsResolved] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTitle, setSearchTitle] = useState("");
    const [searchAssignee, setSearchAssignee] = useState("");
    const [searchIssueType, setSearchIssueType] = useState("");
    const recordsPerPage = 20;

    useEffect(() => {
        Promise.all([
            invoke('getText', { example: 'my-invoke-variable' }),
            invoke('getBugsCountPerMonth', {example: 'my-invoke-variable' }),
            invoke('getCumulativeIssuesPerMonth', { example: 'my-invoke-variable' }),
            invoke('getBugByAssignee', { example: 'my-invoke-variable' }),
            invoke('getResolvedIssues', { example: 'my-invoke-variable' }),
        ]).then(([textResponse, bugsCountResponse, cumulativeBugsCountResponse, perAssigneeResponse, bugsResolvedMonthly]) => {
            setData(textResponse);  
            setBugsCountData(bugsCountResponse);  
            setCumulativeBugsCountData(cumulativeBugsCountResponse);
            setBugByAssignee(perAssigneeResponse);
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
        if (bugsCountData.length > 0 && bugsResolvedPerMonth.length > 0 && cumulativeBugsCountData.length > 0) {
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
            const yValue3 = cumulativeBugsCountData.map(item => item.count);
            console.info("Checking yvalue2 : ", yValue2);
            const barIncident_BugColor = ["red"];
            const barResolvedColor = ["green"];
            const lineCumulativeColor = "blue";

            const ctx = document.getElementById('myChart');
            new Chart(ctx, {
                type: "bar",
                data: {
                    labels: lastSixMonths,
                    datasets: [{
                        label: 'Open Issues',
                        type: 'bar',
                        backgroundColor: barIncident_BugColor,
                        data: yValues
                    },
                    {
                        label: 'Closed Issues',
                        type: 'bar',
                        backgroundColor: barResolvedColor,
                        data: yValue2
                    },
                    {
                        label: 'Total Open Issues',
                        type: 'line',
                        backgroundColor: lineCumulativeColor,
                        borderColor: lineCumulativeColor,
                        fill: false,
                        data: yValue3
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
                            display: true
                        }
                    }
                }
            });
        }
    }, [bugsCountData, cumulativeBugsCountData, bugsResolvedPerMonth]);

    useEffect(() => {
        setCurrentPage(0);
    }, [searchTitle, searchAssignee, searchIssueType]);

    const handleTitleSearchChange = (event) => {
        setSearchTitle(event.target.value.toLowerCase());
    };
    const handleAssigneeSearchChange = (event) => {
        setSearchAssignee(event.target.value.toLowerCase());
    };
    const handleIssueTypeSearchChange = (event) => {
        setSearchIssueType(event.target.value.toLowerCase());
    };

    const filteredData = data ? data.filter(issue =>
        (searchTitle === "" || issue['Incident Title'].toLowerCase().includes(searchTitle)) &&
        (searchAssignee === "" || issue['Assignee'].toLowerCase().includes(searchAssignee)) &&
        (searchIssueType === "" || issue['IssueType'].toLowerCase().includes(searchIssueType))
    ) : [];
    

    if (!data || data.length === 0) {
        return <div>Fetching data...</div>;
    }

    const pageData = filteredData.slice(currentPage * recordsPerPage, (currentPage + 1) * recordsPerPage);

    const tableRows = pageData.map((issue, index) => (
        <tbody>
            <tr key={index}>
                <td>
                    <a href={`https://capstonegroupproject.atlassian.net/browse/${issue['Incident Title']}`} target='_blank'>
                        {issue['Incident Title']}
                    </a>
                </td>
                <td>{issue['Assignee']}</td>
                <td>{issue['IssueType']}</td>
            </tr>
        </tbody>
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
                    <h3>Issues created vs Issues resolved</h3>
                    <div style={{ height: '20px' }}></div> 
                    <canvas id="myChart" style={{ width: '100%', maxWidth: '800px' }}></canvas>
                </div>

                <div style={{ flex: 1 }}>
                    <h3>Issue Closed per Assignee</h3>
                    <div style={{ height: '20px' }}></div> 
                    <canvas id="assigneePieChart" style={{ width: '100%', maxWidth: '400px' }}></canvas>
                </div>
            </div>
            <h3>Issue Details (Last 6 months)</h3>
            <table>
                <thead>
                    <tr>
                        <th>Incident Title</th>
                        <th>Assignee</th>
                        <th>Issue Type</th>
                    </tr>
                    <tr>
                        <th>
                            <input
                                type="text"
                                placeholder="Search by Incident Title..."
                                onChange={handleTitleSearchChange}
                                style={{ width: '30%', padding: '10px', margin: '10px 0' }}
                            />
                        </th>
                        <th>
                            <input
                                type="text"
                                placeholder="Search by Assignee..."
                                onChange={handleAssigneeSearchChange}
                                style={{ width: '30%', padding: '10px', margin: '10px 0' }}
                            />
                        </th>
                        <th>
                            <input
                                type="text"
                                placeholder="Search by Issue Type..."
                                onChange={handleIssueTypeSearchChange}
                                style={{ width: '30%', padding: '10px', margin: '10px 0' }}
                            />
                        </th>
                    </tr>
                </thead>        
                {tableRows}
            </table>
            
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