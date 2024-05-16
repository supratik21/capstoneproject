import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();

resolver.define('classifyComponent', async (req) => {
  const issue_key = req.context.extension.issue.key;
  console.info("Checking issue key : ", issue_key);
  const response = await api.asApp().requestJira(route `/rest/api/3/issue/${issue_key}`);
  if (!response.ok) {
    console.error("Failed to fetch issue details with status:", response.status);
    const errorText = await issue_detail.text();
    console.error("Issue detail response body:", errorText);
    return { body: `Error fetching issue details: ${errorText}` };
  }
  const issue = await response.json();
  //console.info("Issue detail response received:", JSON.stringify(issue));
  const issue_desc = issue.fields.description.content[0].content[0].text;
  console.info("Checking Issue Description : ", issue_desc);
  const issueurl =`https://capstonegroupproject.atlassian.net/browse/${issue_key}`;
  console.info("Checking Issue Url :", issueurl);
  const url = `https://fcac-103-4-238-92.ngrok-free.app`;

  try {
      const classificationResponse  = await api.fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              'issue_url': issueurl
          })
      });

      if (!classificationResponse.ok) {
          console.error("Failed to classify text:", await classificationResponse.text());
          return { body: "Error in text classification" };
      }
      const data = await classificationResponse.json();
      console.info("Classification results received:", JSON.stringify(data));
      return { body: data };
       
  } catch (err) {
      console.error("Error during API call:", err);
      return { body: `Error: ${err.message}` };
  }
});


resolver.define('assignTicketToLead', async (req) => {
  console.info("Received component name for assignment:", req.payload.accountId);
  const issueKey = req.context.extension.issue.key;
  if (!req.payload.accountId) {
    console.error("No AccountID found");
    return { body: "No AccountID found" };
  }
  
  const assignmentResponse = await api.asApp().requestJira(route `/rest/api/3/issue/${issueKey}/assignee`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      accountId: req.payload.accountId
    })
  });
    
  const result = await assignmentResponse;
  if (!assignmentResponse.ok) {
    console.error('Failed to assign ticket:', result);
    return { body: `Error assigning ticket: ${result.errorMessages || result.message}` };
  }
  console.info("Ticket assigned successfully to:", req.payload.accountId);
  return { body: "Ticket assigned successfully." };
});

resolver.define('getText', async (req) => {
  return '';
});

export const handler = resolver.getDefinitions();
