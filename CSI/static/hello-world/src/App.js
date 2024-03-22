import React, { useEffect, useState, Fragment } from 'react';
import { invoke } from '@forge/bridge';
import { Table, Head, Row, Cell, Text } from '@forge/ui';

function App() {
    const [data, setData] = useState(null);
    useEffect(() => {
        invoke('getText', { example: 'my-invoke-variable' }).then(setData);
    }, []);
    if (!data) {
        return <div>Give me a minute...</div>;
    }
    const tableRows = data.map((issue, index) => (
        <tr key={index}>
            <td>{issue['Incident Title']}</td>
            <td>{issue['Assignee']}</td>
            <td>{issue['IssueType']}</td>
            <td>{issue['NumComments']}</td>
        </tr>
    ));
    
    return (
        <Fragment>
            <table>
                <thead>
                    <tr>
                        <th>Incident Title</th>
                        <th>Assignee</th>
                        <th>Issue Type</th>
                        <th>Number of Comments</th>
                    </tr>
                </thead>
                <tbody>
                    {tableRows}
                </tbody>
            </table>
        </Fragment>
    );
        
}

export default App;