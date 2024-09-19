import React, { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';
import prompttext from '../img/field_prompt@3x.png'
const PromptDisplay = ({ prompt, setPrompt, changedata, totaldata }) => {

    let beatPrompt = '';
    let instrumentsPrompt = '';
    let emotionPrompt = '';
    let pitchPrompt = '';
    let metaCodes = [];

    const emotionToko = {
        'aggressive': '공격적인',
        'calm': '차분한',
        'chilled': '차가운',
        'dark': '어두운',
        'energetic': '활기찬',
        'epic': '웅장한',
        'happy': '행복한',
        'romantic': '로맨틱한',
        'sad': '슬픈',
        'scary': '무서운',
        'sexy': '섹시한',
        'ethereal': '미묘한',
        'uplifting': '희망적인'

    }

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

        if (pitchChanges != undefined && pitchChanges.length !== 0) {
            pitchPrompt = '주어진 음악의 ';

            for (let i = 0; i < pitchChanges.length; i++) {
                pitchPrompt += `${pitchChanges[i].start}에서 ${pitchChanges[i].end}구간의 음정을 ${pitchChanges[i].meta_tag} 멜로디로, `;
                if (!metaCodes.includes(pitchChanges[i].meta_tag)) {
                    metaCodes.push(pitchChanges[i].meta_tag);
                }
            }
            pitchPrompt += '재생성해줘';
        }

        if (emotions != undefined && emotions.length !== 0) {
            emotionPrompt = '주어진 음악의 ';

            for (let i = 0; i < emotions.length; i++) {
                emotionPrompt += `${emotions[i].start}에서 ${emotions[i].end}구간의 감정을 ${emotions[i].emotions} 느낌으로, `;
                if (!metaCodes.includes(emotionToko[emotions[i].emotions])) {
                    metaCodes.push(emotionToko[emotions[i].emotions]);
                }
            }
            emotionPrompt += '재생성해줘';
        }


        if (newBeats != undefined && newBeats.length !== 0 && originalBeats !== undefined) {
            const beatRatio = newBeats.length / originalBeats.length;
            beatPrompt = `주어진 음악의 시간을 ${beatRatio}배로 늘려줘`;
        }

        if (newinstruments != undefined && newinstruments.length !== 0 && origininstruments !== undefined) {
            const uniqueinstruments = newinstruments.filter(instrument => !origininstruments.includes(instrument));
            instrumentsPrompt = `주어진 음악에 ${uniqueinstruments} 악기를 추가해줘`;
            metaCodes = metaCodes.concat(uniqueinstruments);
        }

        // make metaCodes list to string
        const metaCodesText = `Suno API 메타코드 리스트: ${metaCodes.join(', ')}`;

        setPrompt(`${pitchPrompt}\n\n${emotionPrompt}\n\n${beatPrompt}\n\n${instrumentsPrompt}\n\n${metaCodesText}`);


        console.log(pitchPrompt, emotionPrompt, beatPrompt, instrumentsPrompt)
    }, [changedata]);


    return (
        <div style={{
            width: '100%'
        }}>
            <Card style={{ width: '90%', padding: '10px', marginLeft: 10 }}>
                <Card.Title style={{ padding: '10px' }}>프롬프트</Card.Title>

                <Card.Body style={{
                    backgroundImage: 'url(' + prompttext + ')', backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat', backgroundPosition: 'center'
                }}>
                    <p>
                        {prompt}
                    </p>
                </Card.Body>
            </Card>
        </div>
    );
};

export default PromptDisplay;
