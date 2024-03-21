import Resolver from '@forge/resolver';
import api, {route} from '@forge/api';

const resolver = new Resolver();
const fetchNumberOfComments = async function(issueKey){
    
    //const data = await response.json();
    //return data.to
    try{
        const response = await api.asApp().requestJira(route `/rest/api/3/issue/${issueKey}/comment`);
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        const jsonResponse = await response.json();
        const totalNumOfComments = jsonResponse.total;
        return totalNumOfComments;
    } catch (error) {
        console.error('Error fetching total number of comments:', error);
        // Handle the error appropriately, e.g., return a default value or rethrow the error
        throw error;
    }
}

const fetchIssuesWithNumberOfComments = async function(projectKey){
    console.info("Checking projecttttttttttt key : ", projectKey);
    const jql1 = `project in (${projectKey}) and created >= -90d and status != 'Done' order by created DESC`;
    console.log(jql1);
    const output = [];
    const response_five_days = await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql1}`);
    console.info("First Response: ############ ",response_five_days);
    const jql = `project in (${projectKey})`;
    const response = await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql}`);
    console.info("Response : ",JSON.stringify(response));
    try {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const jsonResponse = await response.json();
        const total = jsonResponse.total;
        const output = [];
        console.log(JSON.stringify(jsonResponse.issues[0].fields.displayName));
        for (let i = 0; i < total; i++) {
            const issueKey = jsonResponse.issues[i].key;
            const numberOfComments = await fetchNumberOfComments(issueKey);
            const assignee = jsonResponse.issues[i].fields.assignee;
            const projectId = jsonResponse.issues[i].fields.project.id;
            //console.info(projectId);
                //const issueTypeValue =await fetchIssueTypes(projectId);
            const issueTypeValue =jsonResponse.issues[i].fields.issuetype.name;
            output[i] = {
                'Incident Title': jsonResponse.issues[i].key,
                'Assignee': assignee ? assignee.displayName : 'Unassigned',
                //'Assignee': jsonResponse.issues[i].fields.assignee,
                'IssueType': issueTypeValue,
                'NumComments': numberOfComments
            };
        }
        console.info("Value of outputttt: ", output);
        return output;
    } catch (error) {
        console.error('Error fetching total number of issues:', error);
        throw error;
    }
};





resolver.define('getText', async (req) => {
    console.log(req);
    const projectKey = req.context.extension.project.key; 
    console.log("!!!!!!!!!!Lowest define!!!!!!!!!");
    console.log(projectKey);
    //return 'Hello, world!';

    
    const output = await fetchIssuesWithNumberOfComments(projectKey);
    return output;
    


});

export const handler = resolver.getDefinitions();

