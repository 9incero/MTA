import { CaretRightOutlined, PauseOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import lottieControl from './lottieControl';
import { scale, scaleWidth, startLeft } from './mock';
import timebackground from '../../img/btn_time@3x.png'
import playbackground from '../../img/btn_악기선택활성화@3x.png'
const { Option } = Select;
export const Rates = [0.2, 0.5, 1.0, 1.5, 2.0];

const TimelinePlayer = ({ control, audiourl, setAudiourl, timelineState, autoScrollWhenPlay, setLeft, setPlaytime, audioSrc }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [time, setTime] = useState(0);
    const audioRef = useRef(null);

    useEffect(() => {
        if (audioRef.current) {
            const volumeValue = parseFloat(control.volume_value);

            if (!isNaN(volumeValue) && isFinite(volumeValue)) {
                audioRef.current.volume = Math.min(1, Math.max(0, volumeValue / 100));
            } else {
                audioRef.current.volume = 0.5;
            }
        }
    }, [control.volume_value]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.code === 'Space') {
                event.preventDefault();  // Prevents the default action of the spacebar
                handlePlayOrPause();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (!timelineState.current) return;
        const engine = timelineState.current;

        engine.listener.on('play', () => {
            setIsPlaying(true);
            if (audioRef.current && audioRef.current.paused) {
                audioRef.current.play();
            }
        });

        engine.listener.on('paused', () => {
            setIsPlaying(false);
            if (audioRef.current && !audioRef.current.paused) {
                audioRef.current.pause();
            }
        });

        engine.listener.on('afterSetTime', ({ time }) => {
            setTime(time);
            if (audioRef.current) {
                audioRef.current.currentTime = time;
            }
        });

        engine.listener.on('setTimeByTick', ({ time }) => {
            setTime(time);
            // setPlaytime(time);
            if (autoScrollWhenPlay.current) {
                const autoScrollFrom = 500;
                const left = time * (scaleWidth / scale) + startLeft - autoScrollFrom;
                timelineState.current.setScrollLeft(left);
                setLeft(left);
                // console.log(left) left가 왼쪽에서부터
            }
        });

        return () => {
            if (!engine) return;
            engine.pause();
            engine.listener.offAll();
            lottieControl.destroy();
        };
    }, [setLeft]);

    useEffect(() => {
        setPlaytime(time);
    }, [time]);

    const handlePlayOrPause = () => {
        if (!timelineState.current) return;
        if (timelineState.current.isPlaying) {
            timelineState.current.pause();
            if (audioRef.current && !audioRef.current.paused) {
                audioRef.current.pause();
            }
        } else {
            timelineState.current.play({ autoEnd: true });
            if (audioRef.current && audioRef.current.paused) {
                audioRef.current.play();
            }
        }
    };

    const handleRateChange = (rate) => {
        if (!timelineState.current) return;
        timelineState.current.setPlayRate(rate);
    };

    const timeRender = (time) => {
        const float = (parseInt((time % 1) * 100 + '') + '').padStart(2, '0');
        const min = (parseInt(time / 60 + '') + '').padStart(2, '0');
        const second = (parseInt((time % 60) + '') + '').padStart(2, '0');
        return <>{`${min}:${second}.${float.replace('0.', '')}`}</>;
    };

    return (
        <div className="timeline-player">
            <div>
                <audio ref={audioRef} controls src={audiourl} hidden="hidden" />
            </div>
            <div style={{ padding: '5px' }}>
                <span className="play-control" onClick={handlePlayOrPause} style={{
                    backgroundImage: 'url(' + playbackground
                        + ')', backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat', fontSize: '20px', padding: '2px', marginRight: '10px'
                }}>
                    {isPlaying ? <PauseOutlined /> : <CaretRightOutlined />}
                </span>
                <span style={{
                    backgroundImage: 'url(' + timebackground
                        + ')', backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat', fontSize: "20px", height: '100%', padding: '3px'
                }} className="time">{timeRender(time)}</span>
            </div>
            <div className="rate-control">
                {/* <Select size={'small'} defaultValue={1} style={{ width: 120 }} onChange={handleRateChange}>
                    {Rates.map((rate) => (
                        <Option key={rate} value={rate}>{`${rate.toFixed(1)}倍速`}</Option>
                    ))}
                </Select> */}
            </div>
        </div>
    );
};

export default TimelinePlayer;