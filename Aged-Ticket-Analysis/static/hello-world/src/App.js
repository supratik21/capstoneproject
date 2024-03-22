import React, { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';
import { jsx } from '@emotion/react';

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
                        <td headers="five_days">5 Days</td>
                        <td headers="count_five_days">{agedTicketData.length > 0 ? agedTicketData[0].five_days : '0'}</td>
                    </tr>
                    <tr>
                        <td headers="ten_days">10 Days</td>
                        <td headers="count_ten_days">{agedTicketData.length > 0 ? agedTicketData[0].ten_days : '0'}</td>
                    </tr>
                    <tr>
                        <td headers="fifteen_days">15 Days</td>
                        <td headers="count_fifteen_days">{agedTicketData.length > 0 ? agedTicketData[0].fifteen_days : '0'}</td>
                    </tr>
                    <tr>
                        <td headers="thirty_days">30 Days</td>
                        <td headers="count_thirty_days">{agedTicketData.length > 0 ? agedTicketData[0].thirty_days : '0'}</td>
                    </tr>
                </tbody>
            </table>
            <p>
                {agedTicketChartData.length > 0 ? agedTicketChartData[0].open_last_month : 'Loading...'}
            </p>
        </div>
    );
}

export default App;
