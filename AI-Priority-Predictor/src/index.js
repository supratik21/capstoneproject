import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();

// Priority mapping
const priorityMapping = {
  'Highest': '1',
  'High': '2',
  'Medium': '3',
  'Low': '4',
  'Lowest': '5'
};

resolver.define('fetchPredictedPriority', async (req) => {
  const issue_key = req.context.extension.issue.key;
  console.info("Checking issue key : ", issue_key);

  const issueResponse = await api.asUser().requestJira(route`/rest/api/3/issue/${issue_key}`);
  if (!issueResponse.ok) {
    const errorText = await issueResponse.text();
    console.error("Failed to fetch issue details with status:", issueResponse.status);
    console.error("Issue detail response body:", errorText);
    return { body: `Error fetching issue details: ${errorText}` };
  }

  const issue_url = `https://capstonegroupproject.atlassian.net/browse/${issue_key}`;
  const url = `https://0eff-103-4-238-92.ngrok-free.app`;

  try {
    const priorityResponse = await api.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'issue_url': issue_url
      })
    });

    if (!priorityResponse.ok) {
      const errorText = await priorityResponse.text();
      console.error("Failed to predict priority with status:", priorityResponse.status);
      console.error("Priority prediction response body:", errorText);
      return { body: "Error in priority prediction: " + errorText };
    }

    const data = await priorityResponse.json();
    console.info("Priority results received:", JSON.stringify(data));
    const mappedPriority = priorityMapping[data.Priority[0]];
    return { body: { [mappedPriority]: data.Priority[0] } };
  } catch (err) {
    console.error("Error during API call:", err);
    return { body: `Error: ${err.message}` };
  }
});

resolver.define('fetchIssueKey', async (req) => {
  const issueKey = req.context.extension.issue.key;
  console.info(issueKey);
  return issueKey;
});

resolver.define('assignTicketPriority', async (req) => {
  try {
    const issueKey = req.context.extension.issue.key;
    console.info("Checking issue key",issueKey);
    const priorityId = req.payload; 
    console.info('CHECKING PRIORITY', priorityId);
    if (priorityId) {

      const response = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            priority: {
              id: priorityId
            }
          }
        })
      });

      if (!response.ok) {
        console.error('Failed to update priority:', response.status);
      } else {
        console.log('Priority updated successfully');
        setLoading(true);
        const updatedPriorityResponse = await invoke('fetchPredictedPriority');
        if (updatedPriorityResponse.body) {
          const priority = Object.entries(updatedPriorityResponse.body)[0];
          setPriorityData(`${priority[1]} (Priority Level: ${priority[0]})`);
        } else {
          setPriorityData('No priority data received.');
        }
        setLoading(false);
      }
    }
  } catch (error) {
    console.error('Error updating priority:', error);
  }
});


export const handler = resolver.getDefinitions();
