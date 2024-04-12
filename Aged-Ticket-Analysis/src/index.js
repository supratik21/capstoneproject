import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();


resolver.define('getAgedTicket', async (req) => {
    console.log(req);
    // Adding Custom code
    console.info(`Project Key ${req.context.extension.project.key}`);
    const project_key =  req.context.extension.project.key;
    const jql_last_month = `project in (${project_key}) and created >= -30d and created <= -0d and status NOT IN ("Done","Completed","Resolved", "Closed") order by created DESC`;
    const jql_last_one_to_three_months = `project in (${project_key}) and created <= -30d and created >= -90d and status NOT IN ("Done","Completed","Resolved", "Closed") order by created DESC`;
    const jql_last_three_to_six_months = `project in (${project_key}) and created <= -90d and created >= -180d and status NOT IN ("Done","Completed","Resolved", "Closed") order by created DESC`;
    const jql_last_six_to_nine_months = `project in (${project_key}) and created <= -180d and created >= -270d and status NOT IN ("Done","Completed","Resolved", "Closed") order by created DESC`;
    const jql_more_than_nine_months = `project in (${project_key}) and created <= -270d and status NOT IN ("Done","Completed","Resolved", "Closed") order by created DESC`;

    const output = [];
    const response_last_month = await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql_last_month}`);
    const response_last_one_to_three_months = await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql_last_one_to_three_months}`);
    const response_last_three_to_six_months= await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql_last_three_to_six_months}`);
    const response_last_six_to_nine_months = await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql_last_six_to_nine_months}`);
    const response_more_than_nine_months = await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql_more_than_nine_months}`);

    console.info(response_last_month);
    try {
        if (!response_last_month.ok) {
            throw new Error(`Request failed with status ${response_last_month.status}`);
        }
        const jsonResponse_last_month = await response_last_month.json();
        const jsonResponse_last_one_to_three_months = await response_last_one_to_three_months.json();
        const jsonResponse_last_three_to_six_months = await response_last_three_to_six_months.json();
        const jsonResponse_last_six_to_nine_months = await response_last_six_to_nine_months.json();
        const jsonResponse_more_than_nine_months = await response_more_than_nine_months.json();

        const total_last_month = jsonResponse_last_month.total;
        const total_last_one_to_three_months = jsonResponse_last_one_to_three_months.total;
        const total_last_three_to_six_months = jsonResponse_last_three_to_six_months.total;
        const total_last_six_to_nine_months = jsonResponse_last_six_to_nine_months.total;
        const total_more_than_nine_months = jsonResponse_more_than_nine_months.total;

        output[0] = {
          'last_month' : total_last_month,
          'last_one_to_three_months' : total_last_one_to_three_months,
          'last_three_to_six_month' : total_last_three_to_six_months,
          'last_six_to_nine_months' : total_last_six_to_nine_months,
          'more_than_nine_months' : total_more_than_nine_months,
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
    //const jql = `project in (${project_key}) AND status != "Resolved" AND created >= startOfMonth(-1) AND created <= endOfMonth(-1)`;
    const jql_this_month = `project in (${project_key}) AND status NOT IN ("Done","Completed","Resolved", "Closed") AND created >= startOfMonth(0)`;
    const jql_last_month = `project in (${project_key}) AND status NOT IN ("Done","Completed","Resolved", "Closed") AND created >= startOfMonth(-1) AND created <= startOfMonth(0)`;
    const jql_second_last_month = `project in (${project_key}) AND status NOT IN ("Done","Completed","Resolved", "Closed") AND created >= startOfMonth(-2) AND created <= startOfMonth(-1)`;
    const jql_third_last_month = `project in (${project_key}) AND status NOT IN ("Done","Completed","Resolved", "Closed") AND created >= startOfMonth(-3) AND created >= startOfMonth(-2)`;
    const jql_fourth_last_month = `project in (${project_key}) AND status NOT IN ("Done","Completed","Resolved", "Closed") AND created >= startOfMonth(-4) AND created >= startOfMonth(-3)`;
    const jql_fifth_last_month = `project in (${project_key}) AND status NOT IN ("Done","Completed","Resolved", "Closed") AND created >= startOfMonth(-5) AND created >= startOfMonth(-4)`;
    
    const output = [];
    const response_this_month= await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql_this_month}`);
    const response_last_month= await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql_last_month}`);
    const response_second_last_month= await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql_second_last_month}`);
    const response_third_last_month= await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql_third_last_month}`);
    const response_fourth_last_month= await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql_fourth_last_month}`);
    const response_fifth_last_month= await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql_fifth_last_month}`);

    try {
        if (!response_last_month.ok) {
            throw new Error(`Request failed with status ${response_this_month.status}`);
        }
        const jsonResponse_this_month = await response_this_month.json();
        const jsonResponse_last_month = await response_last_month.json();
        const jsonResponse_second_last_month = await response_second_last_month.json();
        const jsonResponse_third_last_month = await response_third_last_month.json();
        const jsonResponse_fourth_last_month = await response_fourth_last_month.json();
        const jsonResponse_fifth_last_month = await response_fifth_last_month.json();
        console.info(response_this_month);
        const total_open_this_month = jsonResponse_this_month.total;
        const total_open_last__month = jsonResponse_last_month.total;
        const total_open_second_last_month = jsonResponse_second_last_month.total;
        const total_open_third_last_month = jsonResponse_third_last_month.total;
        const total_open_fourth_last_month = jsonResponse_fourth_last_month.total;
        const total_open_fifth_last_month = jsonResponse_fifth_last_month.total;
        output[0] = {
          'open_this_month' : total_open_this_month,
          'open_last_month' : total_open_last__month,
          'open_second_last_month' : total_open_second_last_month,
          'open_third_last_month' : total_open_third_last_month,
          'open_fourth_last_month' : total_open_fourth_last_month,
          'open_fifth_last_month' : total_open_fifth_last_month,
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

