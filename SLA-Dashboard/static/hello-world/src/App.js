import React, { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';

const slaHighestPriority = "12h";
const slaHighPriority = "24h";
const slaMediumPriority = "36h";
const slaLowPriority = "48h";
const slaLowestPriority = "60h";


function App() {
    const [fetchAllSLAData, setFetchSLAData] = useState([]);
    const [fetchHighestPriorityBreachedOpenDataIssues, setFetchHighestPriorityBreachedOpenIssuesData] = useState([]);
    const [fetchHighPriorityBreachedOpenDataIssues, setFetchHighPriorityBreachedOpenIssuesData] = useState([]);
    const [fetchMediumPriorityBreachedOpenDataIssues, setFetchMediumPriorityBreachedOpenIssuesData] = useState([]);
    const [fetchLowPriorityBreachedOpenDataIssues, setFetchLowPriorityBreachedOpenIssuesData] = useState([]);
    const [fetchLowestPriorityBreachedOpenDataIssues, setFetchLowestPriorityBreachedOpenIssuesData] = useState([]);
    const [fetchHighestPriorityBreachedClosedDataIssues, setFetchHighestPriorityBreachedClosedIssuesData] = useState([]);
    const [fetchHighPriorityBreachedClosedDataIssues, setFetchHighPriorityBreachedClosedIssuesData] = useState([]);
    const [fetchMediumPriorityBreachedClosedDataIssues, setFetchMediumPriorityBreachedClosedIssuesData] = useState([]);
    const [fetchLowPriorityBreachedClosedDataIssues, setFetchLowPriorityBreachedClosedIssuesData] = useState([]);
    const [fetchLowestPriorityBreachedClosedDataIssues, setFetchLowestPriorityBreachedClosedIssuesData] = useState([]);
    useEffect(() => {
        invoke('fetchSLAData', { example: 'my-invoke-variable' }).then(setFetchSLAData);
        invoke('fetchHighestPriorityBreachedOpenIssuesData', { example: 'my-invoke-variable' }).then(setFetchHighestPriorityBreachedOpenIssuesData);
        invoke('fetchHighPriorityBreachedOpenIssuesData', { example: 'my-invoke-variable' }).then(setFetchHighPriorityBreachedOpenIssuesData);
        invoke('fetchMediumPriorityBreachedOpenIssuesData', { example: 'my-invoke-variable' }).then(setFetchMediumPriorityBreachedOpenIssuesData);
        invoke('fetchLowPriorityBreachedOpenIssuesData', { example: 'my-invoke-variable' }).then(setFetchLowPriorityBreachedOpenIssuesData);
        invoke('fetchLowestPriorityBreachedOpenIssuesData', { example: 'my-invoke-variable' }).then(setFetchLowestPriorityBreachedOpenIssuesData);
        invoke('fetchHighestPriorityBreachedClosedIssuesData', { example: 'my-invoke-variable' }).then(setFetchHighestPriorityBreachedClosedIssuesData);
        invoke('fetchHighPriorityBreachedClosedIssuesData', { example: 'my-invoke-variable' }).then(setFetchHighPriorityBreachedClosedIssuesData);
        invoke('fetchMediumPriorityBreachedClosedIssuesData', { example: 'my-invoke-variable' }).then(setFetchMediumPriorityBreachedClosedIssuesData);
        invoke('fetchLowPriorityBreachedClosedIssuesData', { example: 'my-invoke-variable' }).then(setFetchLowPriorityBreachedClosedIssuesData);
        invoke('fetchLowestPriorityBreachedClosedIssuesData', { example: 'my-invoke-variable' }).then(setFetchLowestPriorityBreachedClosedIssuesData);
    }, []);

    const tableRows = fetchAllSLAData.map(({ priority, count }) => (
        <tbody>
            <tr key={priority}>
                <td>{priority}</td>
                <td>{count}</td>
            </tr>
        </tbody>
    ));
    const tableRowsForHighestPriorityOpenBreachedIssues = fetchHighestPriorityBreachedOpenDataIssues.map(({ issueKey, summary, assignee, slaTimeLeft }) => (
        <tbody>
            <tr key={issueKey}>
                <td>{issueKey}</td>
                <td>{summary}</td>
                <td>{assignee}</td>
                <td>{slaTimeLeft}</td>
            </tr>
        </tbody>
    ));

    const tableRowsForHighPriorityOpenBreachedIssues = fetchHighPriorityBreachedOpenDataIssues.map(({ issueKey, summary, assignee, slaTimeLeft }) => (
        <tbody>
            <tr key={issueKey}>
                <td>{issueKey}</td>
                <td>{summary}</td>
                <td>{assignee}</td>
                <td>{slaTimeLeft}</td>
            </tr>
        </tbody>
    ));

    const tableRowsForMediumPriorityOpenBreachedIssues = fetchMediumPriorityBreachedOpenDataIssues.map(({ issueKey, summary, assignee, slaTimeLeft }) => (
        <tbody>
            <tr key={issueKey}>
                <td>{issueKey}</td>
                <td>{summary}</td>
                <td>{assignee}</td>
                <td>{slaTimeLeft}</td>
            </tr>
        </tbody>
    ));

    const tableRowsForLowPriorityOpenBreachedIssues = fetchLowPriorityBreachedOpenDataIssues.map(({ issueKey, summary, assignee, slaTimeLeft }) => (
        <tbody>
            <tr key={issueKey}>
                <td>{issueKey}</td>
                <td>{summary}</td>
                <td>{assignee}</td>
                <td>{slaTimeLeft}</td>
            </tr>
        </tbody>
    ));

    const tableRowsForLowestPriorityOpenBreachedIssues = fetchLowestPriorityBreachedOpenDataIssues.map(({ issueKey, summary, assignee, slaTimeLeft }) => (
        <tbody>
            <tr key={issueKey}>
                <td>{issueKey}</td>
                <td>{summary}</td>
                <td>{assignee}</td>
                <td>{slaTimeLeft}</td>
            </tr>
        </tbody>
    ));
    const tableRowsForHighPriorityClosedBreachedIssues = fetchHighPriorityBreachedClosedDataIssues.map(({ issueKey, summary, assignee, slaTimeLeft }) => (
        <tbody>
            <tr key={issueKey}>
                <td>{issueKey}</td>
                <td>{summary}</td>
                <td>{assignee}</td>
                <td>{slaTimeLeft}</td>
            </tr>
        </tbody>
    ));

    const tableRowsForMediumPriorityClosedBreachedIssues = fetchMediumPriorityBreachedClosedDataIssues.map(({ issueKey, summary, assignee, slaTimeLeft }) => (
        <tbody>
            <tr key={issueKey}>
                <td>{issueKey}</td>
                <td>{summary}</td>
                <td>{assignee}</td>
                <td>{slaTimeLeft}</td>
            </tr>
        </tbody>
    ));

    const tableRowsForLowPriorityClosedBreachedIssues = fetchLowPriorityBreachedClosedDataIssues.map(({ issueKey, summary, assignee, slaTimeLeft }) => (
        <tbody>
            <tr key={issueKey}>
                <td>{issueKey}</td>
                <td>{summary}</td>
                <td>{assignee}</td>
                <td>{slaTimeLeft}</td>
            </tr>
        </tbody>
    ));

    const tableRowsForLowestPriorityClosedBreachedIssues = fetchLowestPriorityBreachedClosedDataIssues.map(({ issueKey, summary, assignee, slaTimeLeft }) => (
        <tbody>
            <tr key={issueKey}>
                <td>{issueKey}</td>
                <td>{summary}</td>
                <td>{assignee}</td>
                <td>{slaTimeLeft}</td>
            </tr>
        </tbody>
    ));

    const tableRowsForHighestPriorityClosedBreachedIssues = fetchHighestPriorityBreachedClosedDataIssues.map(({ issueKey, summary, assignee, slaTimeLeft }) => (
        <tbody>
            <tr key={issueKey}>
                <td>{issueKey}</td>
                <td>{summary}</td>
                <td>{assignee}</td>
                <td>{slaTimeLeft}</td>
            </tr>
        </tbody>
    ));

    return (
        
        <div>
            <div style={{ width: '50%' }}>
                <h3>Priority Table</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Priority</th>
                            <th>Time target</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Highest</td>
                            <td>{slaHighestPriority}</td>
                        </tr>
                        <tr>
                            <td>High</td>
                            <td>{slaHighPriority}</td>
                        </tr>
                        <tr>
                            <td>Medium</td>
                            <td>{slaMediumPriority}</td>
                        </tr>
                        <tr>
                            <td>Low</td>
                            <td>{slaLowPriority}</td>
                        </tr>
                        <tr>
                            <td>Lowest</td>
                            <td>{slaLowestPriority}</td>
                        </tr>   
                    </tbody>
                </table>
            </div>
            <br></br>
            <div style={{ width: '50%' }}>
                <h3>Incident SLA Dashboard</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Priority</th>
                            <th>Issue Count</th>
                        </tr>
                    </thead>
                    {tableRows}
                </table>
            </div>
            <br></br>
            <div>
                <h3>Highest Priority SLA Breached Open Issue Details</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Issue Key</th>
                            <th>Description</th>
                            <th>Assignee</th>
                            <th>SLA Time Left</th>
                        </tr>
                    </thead>
                    {tableRowsForHighestPriorityOpenBreachedIssues}
                </table>
            </div>
            <div>
                <h3>Highest Priority SLA Breached Closed Issue Details</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Issue Key</th>
                            <th>Description</th>
                            <th>Assignee</th>
                            <th>SLA Time Left</th>
                        </tr>
                    </thead>
                    {tableRowsForHighestPriorityClosedBreachedIssues}
                </table>
            </div>

            <div>
                <h3>High Priority SLA Breached Open Issue Details</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Issue Key</th>
                            <th>Description</th>
                            <th>Assignee</th>
                            <th>SLA Time Left</th>
                        </tr>
                    </thead>
                    {tableRowsForHighPriorityOpenBreachedIssues}
                </table>
            </div>
            <div>
                <h3>High Priority SLA Breached Closed Issue Details</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Issue Key</th>
                            <th>Description</th>
                            <th>Assignee</th>
                            <th>SLA Time Left</th>
                        </tr>
                    </thead>
                    {tableRowsForHighPriorityClosedBreachedIssues}
                </table>
            </div>

            <div>
                <h3>Medium Priority SLA Breached Open Issue Details</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Issue Key</th>
                            <th>Description</th>
                            <th>Assignee</th>
                            <th>SLA Time Left</th>
                        </tr>
                    </thead>
                    {tableRowsForMediumPriorityOpenBreachedIssues}
                </table>
            </div>
            <div>
                <h3>Medium Priority SLA Breached Closed Issue Details</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Issue Key</th>
                            <th>Description</th>
                            <th>Assignee</th>
                            <th>SLA Time Left</th>
                        </tr>
                    </thead>
                    {tableRowsForMediumPriorityClosedBreachedIssues}
                </table>
            </div>

            <div>
                <h3>Low Priority SLA Breached Open Issue Details</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Issue Key</th>
                            <th>Description</th>
                            <th>Assignee</th>
                            <th>SLA Time Left</th>
                        </tr>
                    </thead>
                    {tableRowsForLowPriorityOpenBreachedIssues}
                </table>
            </div>
            <div>
                <h3>Low Priority SLA Breached Closed Issue Details</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Issue Key</th>
                            <th>Description</th>
                            <th>Assignee</th>
                            <th>SLA Time Left</th>
                        </tr>
                    </thead>
                    {tableRowsForLowPriorityClosedBreachedIssues}
                </table>
            </div>
            <div>
                <h3>Lowest Priority SLA Breached Open Issue Details</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Issue Key</th>
                            <th>Description</th>
                            <th>Assignee</th>
                            <th>SLA Time Left</th>
                        </tr>
                    </thead>
                    {tableRowsForLowestPriorityOpenBreachedIssues}
                </table>
            </div>
            <div>
                <h3>Lowest Priority SLA Breached Closed Issue Details</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Issue Key</th>
                            <th>Description</th>
                            <th>Assignee</th>
                            <th>SLA Time Left</th>
                        </tr>
                    </thead>
                    {tableRowsForLowestPriorityClosedBreachedIssues}
                </table>
            </div>
        </div>
    );
}

export default App;
