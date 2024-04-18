import Resolver from '@forge/resolver';
import api, {route} from '@forge/api';

const resolver = new Resolver();
const fetchNumberOfComments = async function(issueKey){
    try{
        const response = await api.asApp().requestJira(route `/rest/api/3/issue/${issueKey}/comment`);
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        const jsonResponse = await response.json();
        const totalNumOfComments = jsonResponse.total;
        //console.info("Comments inside function call:", totalNumOfComments);
        return totalNumOfComments;
    } catch (error) {
        console.error('Error fetching total number of comments:', error);
        // If unauthorized, handle specifically or retry with correct credentials
        if (error.status === 407) {
            console.error('Check proxy settings or credentials!');
        }
        throw error;
    }
}

const fetchIssuesWithNumberOfComments = async function(projectKey){
    //const response = await api.asApp().requestJira(route `/rest/api/3/search?jql=${encodeURIComponent(jql)}`);
    
    // Get the current date
    const currentDate = new Date();
    let startAt = 0;
    const maxResults = 100; // Adjust based on API limits and performance
    let totalFetched = 0;
    let isFetching = true;
    const output = [];
    // Calculate the start date for the last 6 months
    const startDate = new Date();
    startDate.setMonth(currentDate.getMonth() - 6);
    startDate.setDate(1); // Start from the first day of the month

    // Format the start date in JQL-compatible format (YYYY-MM-DD)
    const startDateFormatted = startDate.toISOString().split('T')[0];
    //console.info("Checking Start Date ########### : ", startDateFormatted);
    //const jql = `project in (${projectKey})`;
    // Construct the JQL query to retrieve bugs created
    //const jql = `project = ${projectKey} AND issuetype = Bug`;
    // Construct the JQL query to retrieve bugs created in the last 6 months
    //const jql = `project = ${projectKey} AND issuetype in (Bug, "[System] Incident") AND created >= "${startDateFormatted}"`;
    const jql = `project = ${projectKey} AND issuetype in ("Bug", "[System] Incident")`;
    
    while (isFetching) {
    	const response = await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql}&startAt=${startAt}&maxResults=${maxResults}`);
    	if (!response.ok) {
        	throw new Error(`Request failed with status ${response.status}`);
    	}
    	const jsonResponse = await response.json();
        const issues = jsonResponse.issues;
        const totalIssues = jsonResponse.total;

        // Create an array to hold the promises for fetching comments
        //const commentPromises = issues.map(issue => fetchNumberOfComments(issue.key));

        // Wait for all comment fetch promises to resolve
        //const commentsCounts = await Promise.all(commentPromises);

        issues.forEach((issue, index) => {
            const assignee = issue.fields.assignee;
            const assigneeDisplayName = assignee ? assignee.displayName : 'Unassigned';
            
            output.push({
                'Incident Title': issue.key,
                'Assignee': assigneeDisplayName,
                'IssueType': issue.fields.issuetype.name,
                //'NumComments': commentsCounts[index] // Use the index to match comments count to the issue
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

const getBugCountPerAssignee = async (projectKey) => {
    const jql = `project = ${projectKey} AND issuetype in ("Bug", "[System] Incident") AND assignee is not EMPTY`;
    let startAt = 0;
    const maxResults = 50; // Smaller batch size for demonstration
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

        // Calculate the first and last day of each month
        const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const lastDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

        // Format dates for JQL query
        const startDate = firstDayOfMonth.toISOString().split('T')[0];
        const endDate = lastDayOfMonth.toISOString().split('T')[0];

        // Construct the JQL query
        const jql = `project = ${projectKey} AND issuetype in ("Bug", "[System] Incident") AND created >= "${startDate}" AND created <= "${endDate}"`;

        // Make API request
        const response = await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql}`);
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        const jsonResponse = await response.json();

        // Accumulate data
        monthsData.push({
            monthYear: `${firstDayOfMonth.getFullYear()}-${firstDayOfMonth.getMonth() + 1}`,
            count: jsonResponse.total
        });
    }

    // Reverse the array to have the months in chronological order
    return monthsData.reverse();
};


const getResolvedIssuesPerMonth = async (projectKey) => {
    const currentDate = new Date();
    let monthsData = [];

    for (let i = 0; i < 6; i++) {
        let monthDate = new Date();
        monthDate.setMonth(currentDate.getMonth() - i);

        // Calculate the first and last day of each month
        const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const lastDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

        // Format dates for JQL query
        const startDate = firstDayOfMonth.toISOString().split('T')[0];
        const endDate = lastDayOfMonth.toISOString().split('T')[0];

        // Construct the JQL query to filter resolved issues
        const jql = `project = ${projectKey} AND issuetype in ("Bug", "[System] Incident") AND resolutiondate >= "${startDate}" AND resolutiondate <= "${endDate}" AND status in (Resolved, Closed, Done, Completed)`;
        console.info("Checking jql query for reslolved issues per month : ", jql);
        // Make API request
        const response = await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql}`);
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        const jsonResponse = await response.json();

        // Accumulate data
        monthsData.push({
            monthYear: `${firstDayOfMonth.getFullYear()}-${firstDayOfMonth.getMonth() + 1}`,
            count: jsonResponse.total
        });
    }

    // Reverse the array to have the months in chronological order
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

resolver.define('getBugByAssignee', async (req) => {
    const projectKey = req.context.extension.project.key;
    const bugPerAssignee = await getBugCountPerAssignee(projectKey);
    console.info("Aged ticket per assignee : ",bugPerAssignee);
    return bugPerAssignee;

});


resolver.define('getBugsCountPerMonth', async (req) => {
    const projectKey = req.context.extension.project.key;
    let monthsData = [];
    
    for (let i = 0; i < 6; i++) {
        // Calculate the first and last day of each month going back from the current month
        let date = new Date();
        date.setMonth(date.getMonth() - i);
        date.setDate(1);
        const firstDayOfMonth = date.toISOString().split('T')[0];

        // Adjusting the month here for correct representation
        const monthYear = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}`; // Ensures month is in MM format


        date.setMonth(date.getMonth() + 1);
        date.setDate(0);
        const lastDayOfMonth = date.toISOString().split('T')[0];

        // Construct JQL query
        const jql = `project = ${projectKey} AND issuetype in ("Bug", "[System] Incident") AND created >= "${firstDayOfMonth}" AND created <= "${lastDayOfMonth}"`;
        
        // Make API request
        const response = await api.asApp().requestJira(route`/rest/api/3/search?jql=${jql}`);
        
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        const jsonResponse = await response.json();
        const totalBugs = jsonResponse.total;

        // Store the data in a format suitable for charting
        monthsData.push({
            monthYear: `${date.getFullYear()}-${date.getMonth() + 1}`,
            count: totalBugs
        });
    }
    console.info("Checking monthsData : ", monthsData);
    // Reverse the array to have the months in chronological order
    return monthsData.reverse();
});

resolver.define('getBugsPerAssignee', async (req) => {
    const projectKey = req.context.extension.project.key;
    const getBugsPerAssignee = await getBugsCountPerAssignee(projectKey);
    console.info("Bugs per assignee : ",getBugsPerAssignee);
    return getBugsPerAssignee;
});


resolver.define('getText', async (req) => {
    //console.log(req);
    const projectKey = req.context.extension.project.key; 
    const output = await fetchIssuesWithNumberOfComments(projectKey);
    //console.info("Value of outputttt: ", output);
    return output;
});

export const handler = resolver.getDefinitions();