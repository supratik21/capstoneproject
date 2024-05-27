import React, { useEffect, useState } from 'react';
import { invoke, api } from '@forge/bridge';

function App() {
  // State variables
  const [priorityData, setPriorityData] = useState('');
  const [loading, setLoading] = useState(true);
  const [priority, setPriority] = useState('');
  const [priorityUpdated, setPriorityUpdated] = useState('');

  useEffect(() => {
    Promise.all([
      invoke('fetchPredictedPriority')
    ]).then(([priorityResponse]) => {
      console.log("Response from fetchPredictedPriority:", priorityResponse);
      
      if (priorityResponse.body) {
        const priority = Object.entries(priorityResponse.body)[0];
        setPriorityData(`${priority[1]}`);
        setPriority(priority); // Setting priority state
      } else {
        setPriorityData('No priority data received.');
      }
      setLoading(false);
    }).catch(error => {
      console.error("Error fetching data:", error);
      setLoading(false);
    });
  }, []); // Empty dependency array to ensure useEffect runs only once

  const handlePriorityChange = async (priorityData) => {
    const result = await invoke('assignTicketPriority', priorityData);
    setPriorityUpdated(`Priority successfully updated to ${priority[1]}`);
    console.log(result);
    console.log(priorityData);
  };

  return (
    <div>
      {/* <h2>Predicted Priority</h2> */}
      {loading ? (
        <p>Loading predicted priority...</p>
      ) : (
        <div>
           <h4>{priorityData}</h4>
          <br/>
          <button onClick={() => handlePriorityChange(priority[0])}>Update Priority</button>
          {priorityUpdated && (
            <p style={{ textAlign: 'left', marginTop: '10px' }}>{priorityUpdated}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
