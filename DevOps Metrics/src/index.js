import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();

resolver.define('getMetrics', async (req) => {
    const project_key = req.context.extension.project.key;
    const metrics = {};
    const months = ['this_month', 'last_month', 'second_last_month', 'third_last_month', 'fourth_last_month', 'fifth_last_month'];
    const offsets = [0, -1, -2, -3, -4, -5];

    for (let i = 0; i < months.length; i++) {
        const month = months[i];
        const offset = offsets[i];
        const jql_issues = `project in (${project_key}) AND status IN ("Done","Resolved","Completed","Closed") AND created >= startOfMonth(${offset}) AND created < startOfMonth(${offset + 1})`;
        const jql_bugs = `project in (${project_key}) AND issueType IN ("Bug") AND status IN ("Done","Resolved","Completed","Closed") AND resolved >= startOfMonth(${offset}) AND resolved < startOfMonth(${offset + 1})`;

        const response_issues = await api.asApp().requestJira(route`/rest/api/3/search?jql=${jql_issues}`);
        const issueData = await response_issues.json(); // Parse issues data once
        
        const response_bugs = await api.asApp().requestJira(route`/rest/api/3/search?jql=${jql_bugs}`);
        const bugData = await response_bugs.json(); // Parse bugs data once

        // Calculate metrics
        metrics[`${month}_lead_time`] = calculateLeadTime(issueData);
        metrics[`${month}_cffr`] = calculateChangeFailureRate(bugData, issueData);
        metrics[`${month}_mttr`] = calculateMTTR(bugData);
        metrics[`${month}_tput`] = calculateThroughput(issueData);
    }

    console.info(metrics);
    return { lead_time: metrics }; // Return the structured object as specified
});

function calculateLeadTime(data) {
    let lead_time = 0;
    data.issues.forEach(issue => {
        const created = new Date(issue.fields.created);
        const resolved = new Date(issue.fields.resolutiondate);
        if (resolved > created) {
            lead_time += (resolved - created) / (1000 * 60 * 60 * 24);
        }
    });
    return data.issues.length > 0 ? (lead_time / data.issues.length).toFixed(2) : 0;
}

function calculateChangeFailureRate(bugsData, allData) {
    return allData.total > 0 ? ((bugsData.total / allData.total) * 100).toFixed(2) : "0.00";
}

function calculateMTTR(data) {
    let repair_time = 0;
    data.issues.forEach(issue => {
        const created = new Date(issue.fields.created);
        const resolved = new Date(issue.fields.resolutiondate);
        if (resolved > created) {
            repair_time += (resolved - created) / (1000 * 60 * 60 * 24);
        }
    });
    return data.issues.length > 0 ? (repair_time / data.issues.length).toFixed(2) : 0;
}

function calculateThroughput(data) {
    return data.total;
}

export const handler = resolver.getDefinitions();
