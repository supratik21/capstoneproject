import Resolver from '@forge/resolver';
import api, {route} from '@forge/api';

const resolver = new Resolver();

const fetchIssuesWithNumberOfComments = async function(projectKey){
    const currentDate = new Date();
    let startAt = 0;
    const maxResults = 100;
    let totalFetched = 0;
    let isFetching = true;
    const output = [];
    const startDate = new Date();
    startDate.setMonth(currentDate.getMonth() - 6);
    startDate.setDate(1);
    const startDateFormatted = startDate.toISOString().split('T')[0];
    const jql = `project = ${projectKey} AND issuetype in ("Bug", "[System] Incident", "Incident")`;
    
    while (isFetching) {
    	const response = await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql}&startAt=${startAt}&maxResults=${maxResults}`);
    	if (!response.ok) {
        	throw new Error(`Request failed with status ${response.status}`);
    	}
    	const jsonResponse = await response.json();
        const issues = jsonResponse.issues;
        const totalIssues = jsonResponse.total;

        issues.forEach((issue, index) => {
            const assignee = issue.fields.assignee;
            const assigneeDisplayName = assignee ? assignee.displayName : 'Unassigned';
            
            output.push({
                'Incident Title': issue.key,
                'Assignee': assigneeDisplayName,
                'IssueType': issue.fields.issuetype.name
            });
        });
	    startAt += issues.length;
        console.info("Checking startingAt : ",startAt);
        if (startAt >= totalIssues) {
            isFetching = false;
        }
    }
    
    return output;
};

const getBugClosedCountPerAssignee = async (projectKey) => {
    const jql = `project = ${projectKey} AND status IN ("Done","Completed","Resolved", "Closed") AND assignee is not EMPTY`;
    console.info("Checking Jql : ", jql);
    let startAt = 0;
    const maxResults = 50; 
    let isFetching = true;
    const assigneeCounts = {};


    while (isFetching) {
        const response = await api.asApp().requestJira(route`/rest/api/3/search?jql=${jql}&startAt=${startAt}&maxResults=${maxResults}&fields=assignee`);
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        const jsonResponse = await response.json();
        jsonResponse.issues.forEach(issue => {
            const assigneeName = issue.fields.assignee.displayName;
            if (assigneeCounts[assigneeName]) {
                assigneeCounts[assigneeName] += 1;
            } else {
                assigneeCounts[assigneeName] = 1;
            }
        });


        startAt += jsonResponse.issues.length;
        if (startAt >= jsonResponse.total) {
            isFetching = false;
        }
    }


    return Object.entries(assigneeCounts).map(([assignee, count]) => ({ assignee, count }));
};

const getIssuesPerMonth = async (projectKey) => {
    const currentDate = new Date();
    let monthsData = [];

    for (let i = 0; i < 6; i++) {
        let monthDate = new Date();
        monthDate.setMonth(currentDate.getMonth() - i);
        const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const lastDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

        // Format dates 
        const startDate = firstDayOfMonth.toISOString().split('T')[0];
        const endDate = lastDayOfMonth.toISOString().split('T')[0];

        //JQL query
        const jql = `project = ${projectKey} AND status NOT IN ("Done","Completed","Resolved", "Closed") AND created >= "${startDate}" AND created <= "${endDate}"`;
        console.info("Checking Jql : ", jql);
        //API request
        const response = await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql}`);
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        const jsonResponse = await response.json();

        monthsData.push({
            monthYear: `${firstDayOfMonth.getFullYear()}-${firstDayOfMonth.getMonth() + 1}`,
            count: jsonResponse.total
        });
    }

    return monthsData.reverse();
};

const getCumulativeIssuesPerMonth = async (projectKey) => {
    const currentDate = new Date();
    let monthsData = [];

    for (let i = 0; i < 6; i++) {
        let monthDate = new Date();
        monthDate.setMonth(currentDate.getMonth() - i);
        const lastDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        const endDate = lastDayOfMonth.toISOString().split('T')[0];
        const jql = `project = ${projectKey} AND status NOT IN ("Done", "Completed", "Resolved", "Closed") AND created <= "${endDate}"`;
        // Make API request
        const response = await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql}`);
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        const jsonResponse = await response.json();

        // Accumulate data
        monthsData.push({
            monthYear: `${lastDayOfMonth.getFullYear()}-${lastDayOfMonth.getMonth() + 1}`,
            count: jsonResponse.total
        });
    }
    return monthsData.reverse();
};



const getResolvedIssuesPerMonth = async (projectKey) => {
    const currentDate = new Date();
    let monthsData = [];

    for (let i = 0; i < 6; i++) {
        let monthDate = new Date();
        monthDate.setMonth(currentDate.getMonth() - i);
        const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const lastDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        const startDate = firstDayOfMonth.toISOString().split('T')[0];
        const endDate = lastDayOfMonth.toISOString().split('T')[0];
        const jql = `project = ${projectKey} AND issuetype in ("Bug", "[System] Incident", "Incident") AND resolutiondate >= "${startDate}" AND resolutiondate <= "${endDate}" AND status in (Resolved, Closed, Done, Completed)`;
        const response = await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql}`);
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        const jsonResponse = await response.json();

        monthsData.push({
            monthYear: `${firstDayOfMonth.getFullYear()}-${firstDayOfMonth.getMonth() + 1}`,
            count: jsonResponse.total
        });
    }

    return monthsData.reverse();
};

resolver.define('getResolvedIssues', async (req) => {
    const projectKey = req.context.extension.project.key;
    const resolvedIssuesPerMonth = await getResolvedIssuesPerMonth(projectKey);
    console.info("Resolved issues per month data: ", resolvedIssuesPerMonth);
    return resolvedIssuesPerMonth;
});

resolver.define('getIssuesPerMonth', async (req) => {
    const projectKey = req.context.extension.project.key;
    const issuesPerMonth = await getIssuesPerMonth(projectKey);
    console.info("Issues per month data: ", issuesPerMonth);
    return issuesPerMonth;
});

resolver.define('getCumulativeIssuesPerMonth', async (req) => {
    const projectKey = req.context.extension.project.key;
    const cumulativeIssuesPerMonth = await getCumulativeIssuesPerMonth(projectKey);
    console.info("Issues per month data: ", cumulativeIssuesPerMonth);
    return cumulativeIssuesPerMonth;
});

resolver.define('getBugByAssignee', async (req) => {
    const projectKey = req.context.extension.project.key;
    const bugPerAssignee = await getBugClosedCountPerAssignee(projectKey);
    console.info("Tickets closed per assignee : ",bugPerAssignee);
    return bugPerAssignee;

});


resolver.define('getBugsCountPerMonth', async (req) => {
    const projectKey = req.context.extension.project.key;
    let monthsData = [];
    
    for (let i = 0; i < 6; i++) {
        let date = new Date();
        date.setMonth(date.getMonth() - i);
        date.setDate(1);
        const firstDayOfMonth = date.toISOString().split('T')[0];
        const monthYear = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}`;
        date.setMonth(date.getMonth() + 1);
        date.setDate(0);
        const lastDayOfMonth = date.toISOString().split('T')[0];
        const jql = `project = ${projectKey} AND status NOT IN ("Done","Completed","Resolved", "Closed") AND created >= "${firstDayOfMonth}" AND created <= "${lastDayOfMonth}"`;
        const response = await api.asApp().requestJira(route`/rest/api/3/search?jql=${jql}`);
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        const jsonResponse = await response.json();
        const totalBugs = jsonResponse.total;
        monthsData.push({
            monthYear: `${date.getFullYear()}-${date.getMonth() + 1}`,
            count: totalBugs
        });
    }
    console.info("Checking monthsData : ", monthsData);
    return monthsData.reverse();
});

resolver.define('getBugsPerAssignee', async (req) => {
    const projectKey = req.context.extension.project.key;
    const getBugsPerAssignee = await getBugsCountPerAssignee(projectKey);
    console.info("Bugs per assignee : ",getBugsPerAssignee);
    return getBugsPerAssignee;
});


resolver.define('getText', async (req) => {
    const projectKey = req.context.extension.project.key; 
    const output = await fetchIssuesWithNumberOfComments(projectKey);
    return output;
});

export const handler = resolver.getDefinitions();