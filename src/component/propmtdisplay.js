import React, { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';

const PromptDisplay = ({ changedata }) => {
    const [prompt, setPrompt] = useState('');

    useEffect(() => {
        console.log('바꿀요소들 ', changedata)
    }, [changedata]);

    return (
        <div>
            <Card style={{ width: '18rem' }}>
                <Card.Body>
                    <Card.Title>[프롬프트]</Card.Title>
                    <Card.Text>
                        {prompt}
                    </Card.Text>
                </Card.Body>
            </Card>
        </div>
    );
};

export default PromptDisplay;
