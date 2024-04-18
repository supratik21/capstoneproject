import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();

// async function safeParseJSON(response) {
//   try {
//     const text = await response.text();  // First get the text from the response
//     console.log("Raw response text:", text);  // Log the raw text for better debugging
//     if (text.trim() === "") {
//       console.error("Empty string received when expecting JSON.");
//       throw new Error("Empty response body.");
//     }
//     return JSON.parse(text);  // Then parse the text as JSON
//   } catch (error) {
//     console.error("Failed to parse JSON:", error, "from response:", response);
//     throw new Error("Failed to parse JSON: " + error.message);
//   }
// }


async function fetchAllComponentsAvailable(projectKey) {
  try {
    const response = await api.asApp().requestJira(route`/rest/api/3/project/${projectKey}/components`);
    if (response.status !== 200) {
      console.error(`Failed to load components: ${response.status} - ${await response.text()}`);
      throw new Error(`Failed to load components: ${response.status} - ${await response.text()}`);
    }
    const data = await response.json();
    return data.map(component => ({
      name: component.name,
      lead: component.lead?.accountId
    }));
  } catch (error) {
    console.error('Error fetching components:', error);
    throw error;
  }
}

resolver.define('fetchAllComponents', async (req) => {
  const projectKey = req.context.extension.project.key;
  console.info("Checking Project Key : ", projectKey);
  const components = await fetchAllComponentsAvailable(projectKey);
  const component_names = components.map(data => data.name);
  //console.info(component_names);
  return component_names;
});

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
  console.info("Issue detail response received:", JSON.stringify(issue));
  const issue_desc = issue.fields.description.content[0].content[0].text;
  console.info("Checking Issue Description : ", issue_desc);
  console.info(issue.fields.description.content[0].content[0].text);
  
  const projectKey = req.context.extension.project.key;
  const components = await fetchAllComponentsAvailable(projectKey);
  const component_names = components.map(data => data.name);
  
  const model = 'bart-large-mnli-yahoo-answers';
  const token = '8465807d556d58a595e54e7296d2388eb8fe2f26'; // Ensure to secure this in production
  const url = `https://api.nlpcloud.io/v1/${model}/classification`;

  try {
      const classificationResponse  = await api.fetch(url, {
          method: 'POST',
          headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              text: issue_desc,
              labels: component_names,
              multi_class: true
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

// New resolver function to assign ticket to component lead
resolver.define('assignTicketToLead', async (req) => {
  console.info("Received component name for assignment:", req.payload.componentName);
  const issueKey = req.context.extension.issue.key;
  const projectKey = req.context.extension.project.key;
  const components = await fetchAllComponentsAvailable(projectKey);
  const leadAccountId = components.find(c => c.name === req.payload.componentName)?.lead;
  console.info("Checking leadAccountId : ",leadAccountId);
  console.info("Attempting to assign ticket to lead with Account ID:", leadAccountId);

  if (!leadAccountId) {
    console.error("Component lead not found.");
    return { body: "Component lead not found." };
  }
  
  const assignmentResponse = await api.asApp().requestJira(route `/rest/api/3/issue/${issueKey}/assignee`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      accountId: leadAccountId
    })
  });
    
  const result = await assignmentResponse;
  if (!assignmentResponse.ok) {
    console.error('Failed to assign ticket:', result);
    return { body: `Error assigning ticket: ${result.errorMessages || result.message}` };
  }
  console.info("Ticket assigned successfully to:", leadAccountId);
  return { body: "Ticket assigned successfully." };
});

resolver.define('getText', async (req) => {
  return '';
});

export const handler = resolver.getDefinitions();
