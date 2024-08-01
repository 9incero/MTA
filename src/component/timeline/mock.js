import { TimelineAction, TimelineEffect, TimelineRow } from '@xzdarcy/react-timeline-editor';
import audioControl from './audioControl';
import lottieControl from './lottieControl';
import data from '../../assets/result';

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

const lyricsData = data.Lyrics

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
        effectId: 'effect1', // 필요한 경우 다른 효과 ID로 설정
        data: {
            name: item.word,
            // 다른 필요한 속성들도 여기에 추가할 수 있습니다.
        }
    });
});

// phaseMap을 mockData 형식으로 변환
export const mockData = Array.from(phaseMap, ([phase, actions], index) => ({
    id: index.toString(),
    actions: actions
}));


// export const mockData = [
//     {
//         id: '0',
//         actions: [
//             {
//                 id: 'action0',
//                 start: 9.5,
//                 end: 16,
//                 effectId: 'effect1',
//                 data: {
//                     name: '0번',
//                 },
//             },
//             {
//                 id: 'action10',
//                 start: 0,
//                 end: 4,
//                 effectId: 'effect1',
//                 data: {
//                     name: '어디에뜨나..',
//                 },
//             },
//         ],
//     },
//     {
//         id: '0',
//         actions: [
//             {
//                 id: 'action1',
//                 start: 5,
//                 end: 9.5,
//                 effectId: 'effect1',
//                 data: {
//                     // src: '/lottie/lottie2/data.json',
//                     name: '1번',
//                 },
//             },
//         ],
//     },
//     {
//         id: '2',
//         actions: [
//             {
//                 id: 'action2',
//                 start: 0,
//                 end: 5,
//                 effectId: 'effect1',
//                 data: {
//                     name: 'ㅇㅇ',
//                 },
//             },
//         ],
//     },
//     {
//         id: '3',
//         actions: [
//             {
//                 id: 'action3',
//                 start: 0,
//                 end: 40,
//                 effectId: 'effect0',
//                 data: {
//                     name: '전체',
//                     // src: '../../../assets/music.mp3'
//                 },
//             },
//         ],
//     },
// ];
