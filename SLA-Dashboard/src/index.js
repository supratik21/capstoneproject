import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();

const fetchPriorities = async function() {
  const response = await api.asApp().requestJira(route `/rest/api/3/priority`);
  if (!response.ok) throw new Error(`Failed to fetch priorities: ${response.status} ${response.statusText}`);
  const data = await response.json();
  return data;
};

const fetchIssuesByPriority = async function(projectKey, priorityName) {
  const jql = `project = '${projectKey}' AND issuetype in ('[System] Incident', 'Incident') AND priority = '${priorityName}'`;
  const response = await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql}`);
  if (!response.ok) throw new Error(`Failed to fetch issues for priority ${priorityName}: ${response.status} ${response.statusText}`);
  const data = await response.json();
  //console.info("Checking fetch issues by priority : ",data);
  return data;
};

const fetchSLADataForIssue = async (issueId) => {
  const response = await api.asApp().requestJira(route`/rest/servicedeskapi/request/${issueId}/sla`);
  if (!response.ok) throw new Error(`Failed to fetch SLA data for issue ${issueId}: ${response.status} ${response.statusText}`);
  const data = await response.json();
  return data;
};

const fetchSLAIssues = async (projectKey, priority) => {
  const issues = await fetchIssuesByPriority(projectKey, priority);
  const slaDataPromises = issues.issues.map(issue => fetchSLADataForIssue(issue.id));
  const slaDataResults = await Promise.all(slaDataPromises);
  return slaDataResults.filter(sla => sla.values.some(s => s.name === "Time to resolution" && s.ongoingCycle && s.ongoingCycle.breached === true)).length;
};

resolver.define('fetchSLAData', async (req) => {
  const projectKey = req.context.extension.project.key;
  const priorities = await fetchPriorities();
  //console.info("Checking Priorties values: ",priorities);
  const issuesByPriority = await Promise.all(priorities.map(async (priority) => {
    const count = await fetchSLAIssues(projectKey, priority.name);
    return { priority: priority.name, count };
  }));
  console.info("Checking issueByPriority : ",issuesByPriority);
  return issuesByPriority;
});

const fetchOpenPriorityBreachedIssues  = async (projectKey, priority) => {
  const jql = `project = '${projectKey}' AND issuetype in ('[System] Incident', 'Incident') AND priority = '${priority}' AND status = 'Open'`;
  const response = await api.asApp().requestJira(route`/rest/api/3/search?jql=${jql}&fields=summary,assignee`);
  if (!response.ok) throw new Error(`Failed to fetch ${priority} priority open issues`);
  const data = await response.json();
  const details = await Promise.all(data.issues.map(async issue => {
    const slaData = await fetchSLADataForIssue(issue.id);
    const slaBreached = slaData.values.some(s => s.name === "Time to resolution" && s.ongoingCycle && s.ongoingCycle.breached === true);
    if (slaBreached) {
      return {
        issueKey: issue.key,
        summary: issue.fields.summary.split('\n').slice(0, 2).join('\n'), 
        assignee: issue.fields.assignee ? issue.fields.assignee.displayName : 'Unassigned',
        slaTimeLeft: slaData.values.find(sla => sla.name === "Time to resolution")?.ongoingCycle?.remainingTime?.friendly
      };
    }
  }));
  return details.filter(detail => detail !== undefined);
};

resolver.define('fetchHighestPriorityBreachedOpenIssuesData', async (req) => {
  const projectKey = req.context.extension.project.key;
  const priority = "Highest";
  const breachedIssueDetails = await fetchOpenPriorityBreachedIssues(projectKey, priority);
  console.info(`Breached ${priority} Priority Open Issue Details: `, breachedIssueDetails);
  return breachedIssueDetails;
});

resolver.define('fetchHighPriorityBreachedOpenIssuesData', async (req) => {
  const projectKey = req.context.extension.project.key;
  const priority = "High";
  const breachedIssueDetails = await fetchOpenPriorityBreachedIssues(projectKey, priority);
  console.info(`Breached ${priority} Priority Open Issue Details: `, breachedIssueDetails);
  return breachedIssueDetails;
});

resolver.define('fetchMediumPriorityBreachedOpenIssuesData', async (req) => {
  const projectKey = req.context.extension.project.key;
  const priority = "Medium";
  const breachedIssueDetails = await fetchOpenPriorityBreachedIssues(projectKey, priority);
  console.info(`Breached ${priority} Priority Open Issue Details: `, breachedIssueDetails);
  return breachedIssueDetails;
});

resolver.define('fetchLowPriorityBreachedOpenIssuesData', async (req) => {
  const projectKey = req.context.extension.project.key;
  const priority = "Low";
  const breachedIssueDetails = await fetchOpenPriorityBreachedIssues(projectKey, priority);
  console.info(`Breached ${priority} Priority Open Issue Details: `, breachedIssueDetails);
  return breachedIssueDetails;
});

resolver.define('fetchLowestPriorityBreachedOpenIssuesData', async (req) => {
  const projectKey = req.context.extension.project.key;
  const priority = "Lowest";
  const breachedIssueDetails = await fetchOpenPriorityBreachedIssues(projectKey, priority);
  console.info(`Breached ${priority} Priority Open Issue Details: `, breachedIssueDetails);
  return breachedIssueDetails;
});

const fetchClosedPriorityBreachedIssues  = async (projectKey, priority) => {
  const jql = `project = '${projectKey}' AND issuetype in ('[System] Incident', 'Incident') AND priority = '${priority}' AND status in (Resolved, Closed, Done, Completed)`;
  const response = await api.asApp().requestJira(route`/rest/api/3/search?jql=${jql}&fields=summary,assignee`);
  if (!response.ok) throw new Error(`Failed to fetch closed ${priority} issues`);
  const data = await response.json();
  const details = await Promise.all(data.issues.map(async issue => {
    const slaData = await fetchSLADataForIssue(issue.id);
    const slaBreached = slaData.values.some(s => s.name === "Time to resolution" && s.completedCycles[0] && s.completedCycles[0].breached === true);
    if (slaBreached) {
      return {
        issueKey: issue.key,
        summary: issue.fields.summary.split('\n').slice(0, 2).join('\n'), 
        assignee: issue.fields.assignee ? issue.fields.assignee.displayName : 'Unassigned',
        slaTimeLeft: slaData.values.find(sla => sla.name === "Time to resolution")?.completedCycles[0]?.remainingTime?.friendly
      };
    }
  }));
  return details.filter(detail => detail !== undefined);
};

resolver.define('fetchHighestPriorityBreachedClosedIssuesData', async (req) => {
  const projectKey = req.context.extension.project.key;
  const priority = "Highest";
  const breachedIssueDetails = await fetchClosedPriorityBreachedIssues(projectKey, priority);
  console.info(`Breached ${priority} Priority Closed Issue Details: `, breachedIssueDetails);
  return breachedIssueDetails;
});

resolver.define('fetchHighPriorityBreachedClosedIssuesData', async (req) => {
  const projectKey = req.context.extension.project.key;
  const priority = "High";
  const breachedIssueDetails = await fetchClosedPriorityBreachedIssues(projectKey, priority);
  console.info(`Breached ${priority} Priority Closed Issue Details: `, breachedIssueDetails);
  return breachedIssueDetails;
});

resolver.define('fetchMediumPriorityBreachedClosedIssuesData', async (req) => {
  const projectKey = req.context.extension.project.key;
  const priority = "Medium";
  const breachedIssueDetails = await fetchClosedPriorityBreachedIssues(projectKey, priority);
  console.info(`Breached ${priority} Priority Closed Issue Details: `, breachedIssueDetails);
  return breachedIssueDetails;
});

resolver.define('fetchLowPriorityBreachedClosedIssuesData', async (req) => {
  const projectKey = req.context.extension.project.key;
  const priority = "Low";
  const breachedIssueDetails = await fetchClosedPriorityBreachedIssues(projectKey, priority);
  console.info(`Breached ${priority} Priority Closed Issue Details: `, breachedIssueDetails);
  return breachedIssueDetails;
});

resolver.define('fetchLowestPriorityBreachedClosedIssuesData', async (req) => {
  const projectKey = req.context.extension.project.key;
  const priority = "Lowest";
  const breachedIssueDetails = await fetchClosedPriorityBreachedIssues(projectKey, priority);
  console.info(`Breached ${priority} Priority Closed Issue Details: `, breachedIssueDetails);
  return breachedIssueDetails;
});

export const handler = resolver.getDefinitions();