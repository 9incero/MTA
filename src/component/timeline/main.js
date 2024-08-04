import { Timeline, TimelineState } from '@xzdarcy/react-timeline-editor';
import { Switch } from 'antd';
import { cloneDeep } from 'lodash';
import React, { useRef, useState, useEffect } from 'react';
import { CustomRender0, CustomRender1 } from './custom';
import { CustomTimelineAction, CusTomTimelineRow, mockEffect, scale, scaleWidth, startLeft } from './mock';
import TimelinePlayer from './player';
import Mockcomponent from './mock';


// const defaultEditorData = cloneDeep(mockData);

const TimelineEditor = ({ duration, setMockdata, mockdata, totaldata, setLeft, setPlaytime, control, setAudiourl, audiourl, timedata }) => {
    // const [data, setData] = useState(timedata);
    const [data, setData] = useState(mockdata);
    const timelineState = useRef(null);
    const playerPanel = useRef(null);
    const autoScrollWhenPlay = useRef(true);

    // useEffect(() => {
    //     setData(timedata);
    //     console.log('전달잘되나..?', data)

    // }, [timedata]);


    useEffect(() => {
        setData(mockdata)
    }, [mockdata]);


    return (
        <div className="timeline-editor-engine" >
            <div className="player-config">
                {/* <Switch
                    checkedChildren="자동스크롤"
                    unCheckedChildren="자동스크롤 해제"
                    defaultChecked={autoScrollWhenPlay.current}
                    onChange={(e) => (autoScrollWhenPlay.current = e)}
                    style={{ marginBottom: 20 }}
                /> */}
            </div>
            <div className="player-panel" id="player-ground-1" ref={playerPanel} ></div>
            <Mockcomponent duration={duration} setMockdata={setMockdata} totaldata={totaldata}></Mockcomponent>
            <TimelinePlayer control={control} setAudiourl={setAudiourl} audiourl={audiourl} setLeft={setLeft} setPlaytime={setPlaytime} timelineState={timelineState} autoScrollWhenPlay={autoScrollWhenPlay} />
            <Timeline
                style={{ height: "300px", width: "100%" }}
                scale={scale}
                scaleWidth={scaleWidth}
                startLeft={startLeft}
                autoScroll={true}
                ref={timelineState}
                editorData={data}
                effects={mockEffect}
                onChange={(data) => {
                    setData(data);
                }}
                getActionRender={(action, row) => {
                    if (action.effectId === 'effect0') {
                        return <CustomRender0 action={action} row={row} />;
                    } else if (action.effectId === 'effect1') {
                        return <CustomRender1 action={action} row={row} />;
                    }
                }}
            />
        </div>
    );
};

export default TimelineEditor;
