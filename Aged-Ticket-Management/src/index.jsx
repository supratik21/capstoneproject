import ForgeUI, { render, ProjectPage, Fragment, Text, useProductContext, useState, Table, Row, Cell, Head, Strong  } from '@forge/ui';
import api, { route } from '@forge/api';

const fetchAgedTicket = async function(projectKey){
    const jql = `project in (${projectKey}) and created >= -90d and status != 'Done' order by created DESC`;
    //const jql = `created >= -30d and status != 'Done' order by created DESC`;
    const output = [];
    const response_five_days = await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql}`);
    try {
      if (!response_five_days.ok) {
          throw new Error(`Request failed with status ${response_five_days.status}`);
      }
      const jsonResponse_five_days = await response_five_days.json();
      console.log(jsonResponse_five_days);
      const total_five_days = jsonResponse_five_days.total;
      output[0] = {
        'five_days' : total_five_days
      };

      return output;
      } catch (error) {
          console.error('Error fetching total number of issues:', error);
          throw error;
      }
  }

  const AgedTicketManagementApp = () => {
    const { platformContext: { projectKey } } = useProductContext();
    const [output] = useState(async () => await fetchAgedTicket(projectKey));

    return (
        <Fragment>
           {/* <Text>Output: {JSON.stringify(output)}</Text> */}
           <Table>
                <Row>
                    <Cell><Text><Strong>Last 5 days</Strong></Text></Cell>
                    <Cell><Text>{output[0]['five_days']}</Text></Cell>
                </Row>
                <Row>
                    <Cell><Text><Strong>Last 10 days</Strong></Text></Cell>
                    <Cell><Text>0</Text></Cell>
                </Row>
                <Row>
                    <Cell><Text><Strong>Last 15 days</Strong></Text></Cell>
                    <Cell><Text>0</Text></Cell>
                </Row>
                <Row>
                    <Cell><Text><Strong>Last 30 days</Strong></Text></Cell>
                    <Cell><Text>0</Text></Cell>
                </Row>
                <Row>
                    <Cell><Text><Strong>Last 600 days</Strong></Text></Cell>
                    <Cell><Text>0</Text></Cell>
                </Row>
            </Table>
        </Fragment>
    );
};

export const run = render(
    <ProjectPage>
        <AgedTicketManagementApp />
    </ProjectPage>
);
