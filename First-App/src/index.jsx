import ForgeUI, { render, ProjectPage, Fragment, Text, useState, Table, Row, Cell, Head } from '@forge/ui';
import api, { route } from '@forge/api';

const fetchNumberOfIssues = async () => {
    const output = [];
    try {
        const response = await api.asUser().requestJira(route`/rest/api/3/search`);
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        const jsonResponse = await response.json();
        const totalNumOfIssues = jsonResponse.total;
        for (let i = 0; i < totalNumOfIssues; i++) {
            output[i] = {
                'Issue ID': jsonResponse.issues[i].id,
                'Description': jsonResponse.issues[i].fields.summary,
                'Key': jsonResponse.issues[i].key
            };
        }
        return output;
    } catch (error) {
        console.error('Error fetching total number of issues:', error);
        throw error;
    }
}

const App = () => {
    const [output] = useState(async () => await fetchNumberOfIssues());

    // Create an array of JSX elements for the table cells
    const tableRows = output.map((issue, index) => (
        <Row key={index}>
            <Cell><Text>{issue['Issue ID']}</Text></Cell>
            <Cell><Text>{issue['Description']}</Text></Cell>
            <Cell><Text>{issue['Key']}</Text></Cell>
        </Row>
    ));

    return (
        <Fragment>
            <Text>Output: <Text>{JSON.stringify(output)}</Text></Text>
            <Table>
                <Head>
                    <Cell><Text>Issue ID:</Text></Cell>
                    <Cell><Text>Description:</Text></Cell>
                    <Cell><Text>Key:</Text></Cell>
                </Head>
                {tableRows}
            </Table>
        </Fragment>
    );
};

export const run = render(
    <ProjectPage>
        <App />
    </ProjectPage>
);