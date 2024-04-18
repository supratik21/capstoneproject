import React, { useEffect, useState} from 'react';
import { invoke, view } from '@forge/bridge';

function App() {
  const [data, setData] = useState(null);
  const [classifier, setClassifier] = useState(null);
  
  useEffect(() => {
    invoke('getText', { example: 'my-invoke-variable' }).then(setData);
    invoke('classifyComponent', { example: 'my-invoke-variable' }).then(setClassifier);
  }, []);

  const renderTableRows = () => {
    if (classifier && classifier.body && classifier.body.labels && classifier.body.scores) {
      // Combine labels and scores into an array of objects to sort by score
      const combinedData = classifier.body.labels.map((label, index) => ({
        label,
        score: classifier.body.scores[index]
      }));

      // Sort the combined data by score in descending order
      combinedData.sort((a, b) => b.score - a.score);

      // Return table rows from the sorted data
      return combinedData.map((item, index) => (
        <tr key={index}>
          <td style={{ textAlign: 'center' }}>{item.label}</td>
          <td style={{ textAlign: 'center' }}>{item.score.toFixed(3)}</td>
        </tr>
      ));
    }
    return <tr><td colSpan="2" style={{ textAlign: 'center' }}>No data available.</td></tr>;
  };

  // Function to handle button click for automatic assignment
  const handleAssignClick = async () => {
    if (!classifier || !classifier.body.labels.length) return;
    const sortedData = classifier.body.labels.map((label, index) => ({
      label,
      score: classifier.body.scores[index]
    })).sort((a, b) => b.score - a.score);
    // Assume classifier.body.labels and classifier.body.scores are aligned and sorted
    const topComponent = sortedData[0].label;
    const result = await invoke('assignTicketToLead', { componentName: topComponent });
    alert(result.body); // Show a simple alert with the result message
  };

  // Function to determine if the button should be displayed
  const showAssignButton = () => {
    return classifier && classifier.body && classifier.body.labels && classifier.body.scores && classifier.body.labels.length > 0;
  };

  return (
    <div>
      <button onClick={() => view.close()}>Close</button>
      <h3 style={{ textAlign: 'center' }}>Ranked Components by AI Classification Scores</h3>
      {/* {component ? JSON.stringify(component) : 'Loading Components...'} */}
      {/* {classifier ? JSON.stringify(classifier) : 'Loading Sumits Magic AI...'} */}
      
      {classifier ? (
        <table style={{ width: '100%', textAlign: 'center' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'center' }}>Components</th>
              <th style={{ textAlign: 'center' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {renderTableRows()}
          </tbody>
        </table>
      ) : 'Loading classifier data...'}
      {showAssignButton() && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <button style={{ padding: '10px 20px' }} onClick={handleAssignClick}>Assign Ticket Automatically</button>
        </div>
      )}
    </div>
  );
}

export default App;
