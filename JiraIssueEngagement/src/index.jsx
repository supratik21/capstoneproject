import ForgeUI, { render, Fragment, Text, IssuePanel, useProductContext, useState } from '@forge/ui';
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
