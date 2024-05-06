import React, { useEffect, useState} from 'react';
import { invoke, view } from '@forge/bridge';

function App() {
  const [data, setData] = useState(null);
  const [classifier, setClassifier] = useState({ body: [] });
  const [assignmentMessage, setAssignmentMessage] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    invoke('getText', { example: 'my-invoke-variable' }).then(setData);
    invoke('classifyComponent', { example: 'my-invoke-variable' }).then(response => {
      setClassifier(response);
      setLoading(false);
    });
  }, []);

  const renderTableRows = () => {
    if (loading) {
      return <tr><td colSpan="3" style={{ textAlign: 'center' }}>Loading data...</td></tr>;
    }
    else if (classifier.body && classifier.body.length > 0) {
      const combinedData = classifier.body.map(item => ({
        label: item.name, 
        score: item.probability,
        accountId: item.accountId
      }));
      combinedData.sort((a, b) => b.score - a.score);
      return combinedData.map((item, index) => (
        <tr key={index}>
          <td style={{ textAlign: 'center' }}>{item.label}</td>
          <td style={{ textAlign: 'center' }}>{item.score.toFixed(3)}</td>
          <td style={{ textAlign: 'center' }}>
            <button 
              style={{ padding: '5px 10px' }} 
              onClick={() => handleAssignClick(item.accountId, item.label)}>
              Auto Assign
            </button>
          </td>
        </tr>
      ));
    }else {
      return <tr><td colSpan="3" style={{ textAlign: 'center' }}>No data available.</td></tr>;
    }
  };

  const handleAssignClick = async (accountId, name) => {
    const result = await invoke('assignTicketToLead', { accountId });
    setAssignmentMessage(`Ticket is successfully assigned to ${name}`);
  };

  return (
    <div>
      <button onClick={() => view.close()}>Close</button>
      <h3 style={{ textAlign: 'center' }}>AI Auto Assign</h3>  
      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading predicted assignee...</p>
      ) : (
        <table style={{ width: '100%', textAlign: 'center' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'center' }}>Assignee Name</th>
              <th style={{ textAlign: 'center' }}>Score</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          
          {renderTableRows()}
          
        </table>
      )}
      {assignmentMessage && (
        <p style={{ textAlign: 'center', color: 'green', marginTop: '10px' }}>{assignmentMessage}</p>
      )}
    </div>
  );
}

export default App;
