import ForgeUI, { render, Fragment, Text, IssuePanel, useProductContext, useState, ProjectPage, Table, Head, Body, Row, Cell, useEffect } from '@forge/ui';
import api, {route} from '@forge/api';

const fetchNumberOfComments = async function(issueKey){
  const response = await api.asApp().requestJira(route `/rest/api/3/issue/${issueKey}/comment`);
  //const data = await response.json();
  //return data.to
  try{
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
  const jql = `project in (${projectKey})`;
  const output = [];
  const response = await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql}`);
  try {
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }
    const jsonResponse = await response.json();
    const total = jsonResponse.total;
    for (let i = 0; i < total; i++) {
      const issueKey = jsonResponse.issues[i].key;
      const numberOfComments = await fetchNumberOfComments(issueKey);
      output[i] = {
        'Issue ID': jsonResponse.issues[i].id,
        'Summary': jsonResponse.issues[i].key,
        'NumComments': numberOfComments
      };
    }
    return output;
    } catch (error) {
        console.error('Error fetching total number of issues:', error);
        throw error;
    }
}

const EngagementPanel = () => {
  console.log(JSON.stringify(useProductContext()));
  const {platformContext:{issueKey}} = useProductContext();
  const [numComments] = useState(fetchNumberOfComments(issueKey));
  return (
    <Fragment>
      <Text>Engagement Score : {numComments}</Text>
    </Fragment>
  );
};

export const panel = render(
  <IssuePanel>
    <EngagementPanel />
  </IssuePanel>
);




const EngagementOverview = () => {
  const {platformContext:{projectKey}} = useProductContext();
  //const [output] = useState(fetchIssuesWithNumberOfComments(projectKey));
  const [output] = useState(async () => await fetchIssuesWithNumberOfComments(projectKey));
  const tableRows = output.map((issue, index) => (
  <Row key={index}>
    <Cell><Text>{issue['Issue ID']}</Text></Cell>
    <Cell><Text>{issue['Summary']}</Text></Cell>
    <Cell><Text>{issue['NumComments']}</Text></Cell>
    
  </Row>
  ));
  return (
    <Fragment>
      <Text>Output: {JSON.stringify(output)}</Text>
      <Table>
        <Head>
          <Cell><Text>Issue Key:</Text></Cell>
          <Cell><Text>Summary:</Text></Cell>
          <Cell><Text>No of Comments</Text></Cell>
        </Head>
        {tableRows}
      </Table>
    </Fragment>
  );
};
 
export const engagementOverview = render(
  <ProjectPage>
    <EngagementOverview/>
  </ProjectPage>
);

