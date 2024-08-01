import { TimelineAction, TimelineEffect, TimelineRow } from '@xzdarcy/react-timeline-editor';
import audioControl from './audioControl';
import lottieControl from './lottieControl';
import { Component } from 'react';

export const scaleWidth = 200;
export const scale = 10;
export const startLeft = 20;

export const mockEffect = {
    effect0: {
        id: 'effect0',
        name: '이펙트0',
        source: {
            start: ({ action, engine, isPlaying, time }) => {
                if (isPlaying) {
                    const src = action.data.src;


                    audioControl.start({ id: src, src, startTime: action.start, engine, time });
                }
            },
            enter: ({ action, engine, isPlaying, time }) => {
                if (isPlaying) {
                    const src = action.data.src;
                    audioControl.start({ id: src, src, startTime: action.start, engine, time });
                }
            },
            leave: ({ action, engine }) => {
                const src = action.data.src;
                audioControl.stop({ id: src, engine });
            },
            stop: ({ action, engine }) => {
                const src = action.data.src;
                audioControl.stop({ id: src, engine });
            },
        },
    },
    effect1: {
        id: 'effect1',
        name: '이펙트1',
        source: {
            enter: ({ action, time }) => {
                const src = action.data.src;
                lottieControl.enter({ id: src, src, startTime: action.start, endTime: action.end, time });
            },
            update: ({ action, time }) => {
                const src = action.data.src;
                lottieControl.update({ id: src, src, startTime: action.start, endTime: action.end, time });
            },
            leave: ({ action, time }) => {
                const src = action.data.src;
                lottieControl.leave({ id: src, startTime: action.start, endTime: action.end, time });
            },
        },
    },
};

// const lyricsData = data.Lyrics

// const phaseMap = new Map();

// lyricsData.forEach((item, index) => {
//     const phase = item.phase;
//     if (!phaseMap.has(phase)) {
//         phaseMap.set(phase, []);
//     }

//     phaseMap.get(phase).push({
//         id: `action${index}`,
//         start: item.start,
//         end: item.end,
//         effectId: 'effect1', // 필요한 경우 다른 효과 ID로 설정
//         data: {
//             name: item.word,
//             // 다른 필요한 속성들도 여기에 추가할 수 있습니다.
//         }
//     });
// });

// // phaseMap을 mockData 형식으로 변환
// export const mockData = Array.from(phaseMap, ([phase, actions], index) => ({
//     id: index.toString(),
//     actions: actions
// }));


class Mockcomponent extends Component {
    componentDidUpdate(prevProps) {
        // totaldata가 이전 props와 다를 경우에만 작업을 수행
        if (prevProps.totaldata !== this.props.totaldata) {
            this.updateMockData();
        }
    }

    updateMockData() {
        const { totaldata } = this.props;
        const lyricsData = totaldata.Lyrics;

        console.log('mock', lyricsData)

        // totaldata를 사용하여 필요한 데이터 처리
        const phaseMap = new Map();
        lyricsData.forEach((item, index) => {
            const phase = item.phase;
            if (!phaseMap.has(phase)) {
                phaseMap.set(phase, []);
            }

            phaseMap.get(phase).push({
                id: `action${index}`,
                start: item.start,
                end: item.end,
                effectId: 'effect1',
                data: {
                    name: item.word,
                }
            });
        });

        const tmpData = Array.from(phaseMap, ([phase, actions], index) => ({
            id: index.toString(),
            actions: actions
        }));

        console.log(tmpData)

        this.props.setMockdata([...tmpData]);
    }

    render() {


        return (
            <div style={{ display: 'none' }}>
                {/* mockData를 사용하여 타임라인 컴포넌트를 렌더링 */}
                {/* 예: <Timeline data={mockData} /> */}
            </div>
        );
    }
}


export default Mockcomponent;