import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();


resolver.define('getAgedTicket', async (req) => {
    console.log(req);
    // Adding Custom code
    console.info(`Project Key ${req.context.extension.project.key}`);
    const project_key =  req.context.extension.project.key;
    const jql = `project in (${project_key}) and created >= -90d and status != 'Done' order by created DESC`;
    const output = [];
    const response_five_days = await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql}`);
    console.info(response_five_days);
    //const data = await response_five_days.json();
    try {
        if (!response_five_days.ok) {
            throw new Error(`Request failed with status ${response_five_days.status}`);
        }
        const jsonResponse_five_days = await response_five_days.json();
        //console.info(jsonResponse_five_days);
        const total_five_days = jsonResponse_five_days.total;
        output[0] = {
          'five_days' : total_five_days
        };
    } 
    catch (error) {
            console.error('Error fetching total number of issues:', error);
            throw error;
    }

    console.info(output);
    // Ending custom code
    return output;
});

resolver.define('getAgedTicketChartData', async (req) => {
    console.log(req);
    // Adding Custom code
    console.info(`Project Key ${req.context.extension.project.key}`);
    const project_key =  req.context.extension.project.key;
    const jql = `project in (${project_key}) AND status = "Open" AND created >= startOfMonth(-1) AND created <= endOfMonth(-1)`;
    const output = [];
    const response_last_month= await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql}`);
    //console.info(response_five_days);
    //const data = await response_five_days.json();
    try {
        if (!response_last_month.ok) {
            throw new Error(`Request failed with status ${response_last_month.status}`);
        }
        const jsonResponse_last_month = await response_last_month.json();
        console.info(jsonResponse_last_month);
        const total_open_last_month = jsonResponse_last_month.total;
        output[0] = {
          'open_last_month' : total_open_last_month
        };
    } 
    catch (error) {
            console.error('Error fetching total number of issues:', error);
            throw error;
    }

    console.info(output);
    // Ending custom code
    return output;
});

export const handler = resolver.getDefinitions();

