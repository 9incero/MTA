import React, { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';

const PromptDisplay = ({ prompt, setPrompt, changedata, totaldata }) => {

    let beatPrompt = '';
    let instrumentsPrompt = '';
    let emotionPrompt = '';
    let pitchPrompt = '';

    useEffect(() => {
        setPrompt('')
    }, [totaldata])


    useEffect(() => {
        const pitchChanges = changedata.Pitch;
        const newBeats = changedata.Beat;
        const originalBeats = changedata.Origin_beat;
        const emotions = changedata.Emotions;
        const newinstruments = changedata.Instruments;
        const origininstruments = totaldata.Instruments;

        if (pitchChanges !== undefined) {
            pitchPrompt = '주어진 음악의 ';

            for (let i = 0; i < pitchChanges.length; i++) {
                pitchPrompt += `${pitchChanges[i].start}에서 ${pitchChanges[i].end}구간의 음정을 ${pitchChanges[i].meta_tag} 멜로디로, `;
            }
            pitchPrompt += '재생성해줘';

        }

        if (emotions !== undefined) {
            emotionPrompt = '주어진 음악의 ';

            for (let i = 0; i < emotions.length; i++) {
                emotionPrompt += `${emotions[i].start}에서 ${emotions[i].end}구간의 감정을 ${emotions[i].emotions} 느낌으로, `;
            }
            emotionPrompt += '재생성해줘';

        }


        if (newBeats !== undefined && originalBeats !== undefined) {
            const beatRatio = newBeats.length / originalBeats.length;
            beatPrompt = `주어진 음악의 시간을 ${beatRatio}배로 늘려줘`;

        }

        if (newinstruments !== undefined && origininstruments !== undefined) {
            const uniqueinstruments = newinstruments.filter(instrument => !origininstruments.includes(instrument));
            instrumentsPrompt = `주어진 음악에 ${uniqueinstruments} 악기를 추가해줘`;

        }

        setPrompt(`${pitchPrompt}\n\n${emotionPrompt}\n\n${beatPrompt}\n\n${instrumentsPrompt}`);


        console.log(pitchPrompt, emotionPrompt, beatPrompt, instrumentsPrompt)
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
