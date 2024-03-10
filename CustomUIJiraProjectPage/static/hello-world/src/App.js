import React, { useEffect, useState } from 'react';
import Button from '@atlaskit/button'
import { invoke } from '@forge/bridge';

function App() {
    const [data, setData] = useState(null);

    useEffect(() => {
        invoke('getText', { example: 'my-invoke-variable' }).then(setData);
    }, []);

    return (
        <div>
            <h2>Subtitle</h2>
            <Button appearance="primary">A Button</Button>
            <p/>
            {data ? data : 'Loading...'}
        </div>
    );
}

export default App;
