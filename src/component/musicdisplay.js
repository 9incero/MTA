import React, { Component } from 'react';
import * as d3 from 'd3';

class MusicVisual extends Component {
    constructor(props) {
        super(props);
        this.svgRef = React.createRef();
        this.data = this.props.totaldata.Lyrics;
        this.addData = this.props.totaldata.Pitch;
        this.flag = false;
        this.currentPhase = 0;
        this.beatData = this.props.totaldata.Beat_amplitude;
        this.isUpdated = false;
        this.state = {
            pitches: [],
            times: [],
            prevPhase: 0, // 현재 표시할 phase
            pitchTmp: [],
            timeTmp: [],
            prevadd: 0,
            savebeat: [],
            currentbeattime: 0,
            currentcolor: '#000'
        };
    }


    componentDidMount() {
        this.setState({ savebeat: this.props.totaldata.Beat_amplitude })

    }

    fillMissingData(times, pitches) {
        let timeTmp = [];
        let pitchTmp = [];
        let lastAddedTime = -Infinity; // 초기값을 무한대의 음수로 설정하여 첫 번째 데이터를 포함

        this.addData.forEach(data => {
            if (data.time < times[0][0] && data.time - lastAddedTime >= 0.5) {
                timeTmp.push(data.time);
                pitchTmp.push(data.pitch);
                lastAddedTime = data.time; // 마지막으로 추가된 시간 갱신
            }
        });

        if (timeTmp.length > 0) {
            times.unshift(timeTmp);
            pitches.unshift(pitchTmp);
        }

        for (let i = 0; i < times.length - 1; i++) {
            let timeDiff = times[i + 1][0] - times[i][times[i].length - 1];
            let lastAddedTime = times[i][times[i].length - 1]; // 현재 블록의 마지막 시간을 초기값으로 설정
            timeTmp = [];
            pitchTmp = [];

            if (timeDiff > 3) {
                this.addData.forEach(data => {
                    if (data.time > lastAddedTime && data.time < times[i + 1][0] && data.time - lastAddedTime >= 0.5) {
                        timeTmp.push(data.time);
                        pitchTmp.push(data.pitch);
                        lastAddedTime = data.time; // 마지막으로 추가된 시간 갱신
                    }
                });
            }

            if (timeTmp.length > 0) {
                times.splice(i + 1, 0, timeTmp);
                pitches.splice(i + 1, 0, pitchTmp);
                i++;
            }
        }


        // pitches의 마지막 time보다 큰 addData의 time 값을 10초 간격으로 추가
        let lastTime = times[times.length - 1][times[times.length - 1].length - 1];
        timeTmp = [];
        pitchTmp = [];
        lastAddedTime = lastTime; // 마지막으로 추가된 시간 갱신
        let segmentStartTime = lastTime;

        this.addData.forEach(data => {
            if (data.time > lastTime) {
                if (data.time - segmentStartTime >= 10) {
                    if (timeTmp.length > 0) {
                        times.push(timeTmp);
                        pitches.push(pitchTmp);
                    }
                    timeTmp = [];
                    pitchTmp = [];
                    segmentStartTime = data.time;
                }
                if (data.time - lastAddedTime >= 0.5) {
                    timeTmp.push(data.time);
                    pitchTmp.push(data.pitch);
                    lastAddedTime = data.time; // 마지막으로 추가된 시간 갱신
                }
            }
        });

        // 마지막으로 남은 데이터를 추가
        if (timeTmp.length > 0) {
            times.push(timeTmp);
            pitches.push(pitchTmp);
        }

    }


    componentDidUpdate(prevProps, prevState) {
        const emotionToColor = {
            'aggressive': '#FF0000',
            'calm': '#87CEEB',
            'chilled': '#E0FFFF',
            'dark': '#2F4F4F',
            'energetic': '#FFA500',
            'epic': '#8A2BE2',
            'happy': '#FFFF00',
            'romantic': '#FF69B4',
            'sad': '#4682B4',
            'scary': '#800000',
            'sexy': '#FF1493',
            'ethereal': '#d3ade5',
            'uplifting': '#00FF00',
        }
        if (prevProps.currentemotion != this.props.currentemotion) {
            this.setState({ currentcolor: emotionToColor[this.props.currentemotion] })


        }
        if (prevState.savebeat != this.state.savebeat) {
            this.isUpdated = false;
            this.props.setBeatlist(this.state.savebeat)
        }

        if (prevProps.phase != this.props.phase) {
            // console.log('dd', this.props.phase)
        }
        //여기서 가사유무의 대한 예외처리해주면 될듯!
        if (prevProps.totaldata != this.props.totaldata) {
            this.setState({ currentcolor: emotionToColor[this.props.totaldata.Emotions[0]] })

            this.data = this.props.totaldata.Lyrics;
            this.addData = this.props.totaldata.Pitch;
            this.beatData = this.props.totaldata.Beat_amplitude
            this.setState({ savebeat: this.props.totaldata.Beat_amplitude })

            if (this.data.length != 0) {

                const pitches = [];
                const times = [];
                const seenTimes = new Set(); // 중복 제거를 위한 Set
                let pitchTmp = [];
                let timeTmp = [];
                let prevPhase = -1;

                this.data.forEach(lyric => {
                    let currentPhase = lyric.phase;
                    if (currentPhase !== prevPhase) {
                        if (pitchTmp.length > 0) {
                            pitches.push([...pitchTmp]);
                            times.push([...timeTmp]);
                        }
                        pitchTmp = [];
                        timeTmp = [];
                        prevPhase = currentPhase;
                    }

                    lyric.pitch.forEach(pitch => {
                        if (!seenTimes.has(pitch.start)) {
                            pitchTmp.push(pitch.midi_note);
                            timeTmp.push(pitch.start);
                            seenTimes.add(pitch.start); // Set에 추가하여 중복 방지
                        }
                    });
                });

                if (timeTmp.length > 0) {
                    pitches.push([...pitchTmp]);
                    times.push([...timeTmp]);
                }

                this.fillMissingData(times, pitches);
                this.setState({
                    pitches: [...pitches],
                    times: [...times]
                }, () => {
                    const phasedata = [];
                    for (let i = 0; i < this.state.times.length - 1; i++) {
                        phasedata.push([this.state.times[i][0], this.state.times[i][this.state.times[i].length - 1]])

                    }
                    //이거업뎃이안되는듯?
                    this.props.setPhase(phasedata)
                    // console.log(phasedata)
                });



                // if (prevState.times != this.state.times) {
                //     const phasedata = [];
                //     for (let i = 0; i < this.state.times.length - 1; i++) {
                //         phasedata.push([this.state.times[i][0], this.state.times[i][this.state.times[i].length - 1]])

                //     }
                //     //이거업뎃이안되는듯?
                //     this.props.setPhase(...phasedata)
                //     console.log(phasedata)

                // }

                // if (prevProps.phase != this.props.phase) {
                //     console.log('hh', this.props.phase)
                // }
            }
            else {
                const pitches = [];
                const times = [];
                const seenTimes = new Set(); // 중복 제거를 위한 Set
                let pitchTmp = [];
                let timeTmp = [];
                let initialTime = null;
                let lastAddedTime = null;

                this.addData.forEach(item => {
                    if (!seenTimes.has(item.time)) {
                        if (initialTime === null) {
                            initialTime = item.time;
                            lastAddedTime = item.time;
                        }

                        if (item.time - initialTime >= 10) {
                            // 10초 차이가 나는 시점에서 pitch와 times 배열을 나눔
                            if (pitchTmp.length > 0) {
                                pitches.push([...pitchTmp]);
                                times.push([...timeTmp]);
                            }
                            pitchTmp = [];
                            timeTmp = [];
                            initialTime = item.time;
                        } else if (item.time - lastAddedTime >= 0.5) {
                            // 마지막 추가된 시간에서 0.5초 차이가 나는 시점에서 pitch와 times 배열에 추가
                            pitchTmp.push(item.pitch);
                            timeTmp.push(item.time);
                            seenTimes.add(item.time); // Set에 추가하여 중복 방지
                            lastAddedTime = item.time;
                        }
                    }
                });

                if (timeTmp.length > 0) {
                    pitches.push([...pitchTmp]);
                    times.push([...timeTmp]);
                }

                this.setState({
                    pitches: [...pitches],
                    times: [...times]
                }, () => {
                    const phasedata = [];
                    for (let i = 0; i < this.state.times.length - 1; i++) {
                        phasedata.push([this.state.times[i][0], this.state.times[i][this.state.times[i].length - 1]])

                    }
                    //이거업뎃이안되는듯?
                    this.props.setPhase(phasedata)
                    // console.log(phasedata)
                });
            }




        }



        if (prevProps.playtime != this.props.playtime) {
            // 모든 조건을 만족하는 beat 찾기
            let lastMatchingBeat = null;
            for (let i = 0; i < this.beatData.length; i++) {
                if (this.props.playtime >= this.beatData[i].time) {
                    lastMatchingBeat = this.beatData[i];
                    this.props.setOpacity(lastMatchingBeat.amplitude);
                    // console.log(this.props.playtime, lastMatchingBeat)


                } else {
                    break;
                }
            }

            // 마지막으로 조건을 만족하는 beat 값 사용
            if (lastMatchingBeat) {
                this.props.setOpacity(lastMatchingBeat.amplitude);

                // console.log(lastMatchingBeat.amplitude);
                // console.log('------');
            }

            for (let i = 0; i < this.state.times.length - 1; i++) {
                // 현재 playtime이 이 구간에 속하는지 확인

                if (this.props.playtime >= this.state.times[i][0] && this.props.playtime < this.state.times[i + 1][0]) {
                    if (this.currentPhase != i) {
                        this.flag = true;
                        this.currentPhase = i
                    }
                    // console.log(this.state.pitches[i], this.state.times[i])
                    this.drawChart(this.state.pitches[i], this.state.times[i]);

                    break; // 해당 구간을 찾으면 더 이상 반복할 필요 없음
                }
            }

            // 마지막 구간의 경우 별도 처리 (times.length - 1)
            const lastIndex = this.state.times.length - 1;
            if (this.props.playtime >= this.state.times[lastIndex][0]) {
                if (this.currentPhase != lastIndex) {
                    this.flag = true;
                    this.currentPhase = lastIndex
                }
                this.drawChart(this.state.pitches[lastIndex], this.state.times[lastIndex]);
            }
        }

    }



    midiToNoteName(midi) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return noteNames[midi % 12];
    }
    mapRange(value = 50, inMin = 0, inMax = 100, outMin = 1, outMax = 50) {
        // 선형 변환 공식 적용
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }



    drawChart(pitches, times) {
        const { playtime } = this.props; // 현재 재생 시간
        const svg = d3.select(this.svgRef.current);
        const width = +svg.attr('width');
        const height = +svg.attr('height');
        let changeflag = 0;
        let currentbeattime = 0;

        // 이전 내용을 지움
        if (this.flag) {
            svg.selectAll('*').remove();
            changeflag = 1;
            this.flag = false;

        }

        // 스케일 설정
        const xScale = d3.scaleLinear()
            .domain([d3.min(times), d3.max(times)])
            .range([10, width - 10]);

        const yScale = d3.scaleLinear()
            .domain([d3.min(pitches), d3.max(pitches)])
            .range([height - 100, 100]);

        const pitchToNote = (pitch) => {
            const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
            const noteIndex = pitch % 12;
            return notes[noteIndex];
        };


        // 음 이름에 따른 색상 매핑
        const noteToColor = {
            'C': 'red',
            'C#': '#8A2BE2',
            'D': 'yellow',
            'D#': '#4682B4',
            'E': 'skyblue',
            'F': '#8B0000',
            'F#': '#8A2BE2',
            'G': 'orange',
            'G#': '#C8A2C8',
            'A': 'green',
            'A#': '#FF007F',
            'B': 'blue'
        };

        // 색상 스케일 설정 (피치 범위에 따라 색상 매핑)
        const colorScale = d3.scaleSequential(d3.interpolateRainbow)
            .domain([d3.min(pitches), d3.max(pitches)]);


        const mapAmplitudeToSize = (amplitude) => {
            const minAmplitude = 0;
            const maxAmplitude = 1;
            const minSize = 15;
            const maxSize = 40;

            // 선형 변환
            return minSize + (amplitude - minAmplitude) * (maxSize - minSize) / (maxAmplitude - minAmplitude);
        };
        const adjustLuminance = (hex, luminance) => {
            // hex가 문자열인지 확인
            if (typeof hex !== 'string') {
                throw new TypeError('Expected a string for hex');
            }

            // hex 문자열을 정리
            hex = hex.replace(/[^0-9a-f]/gi, '');
            if (hex.length < 6) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            luminance = luminance || 0;

            let rgb = "#", c, i;
            for (i = 0; i < 3; i++) {
                c = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
                c = Math.round(Math.min(Math.max(0, c + (c * luminance * 2)), 255)).toString(16);
                rgb += ("00" + c).substring(c.length);
            }

            return rgb;
        };


        const noteToColorWithLuminance = (note) => {
            const luminanceMapping = {
                "C": -0.3,
                "C#": -0.2,
                "D": -0.1,
                "D#": -0,
                "E": 0.1,
                "F": 0.2,
                "F#": 0.3,
                "G": 0.4,
                "G#": 0.5,
                "A": 0.6,
                "A#": 0.7,
                "B": 0.8
            };
            const luminance = luminanceMapping[note];
            return adjustLuminance(this.state.currentcolor, luminance);
        };


        // 현재 재생 시간 이하의 데이터 필터링
        const prevDataPoints = pitches.map((d, i) => ({ time: times[i], pitch: d }))
            .filter(d => d.time <= playtime);
        const nextDataPoints = pitches.map((d, i) => ({ time: times[i], pitch: d }))
            .filter(d => d.time >= playtime);
        let lastPoint;
        let nextPoint;
        if (prevDataPoints.length === 0) {
            lastPoint = nextDataPoints[0]
        } else {
            lastPoint = prevDataPoints[prevDataPoints.length - 1]
        }
        if (nextDataPoints.length === 0) {
            nextPoint = prevDataPoints[prevDataPoints.length - 1]
        } else {
            nextPoint = nextDataPoints[0]
        }


        // 원(circle) 보간 추가
        // const step = (nextPoint.time - lastPoint.time) / 0.001; // 각 데이터 포인트 사이에 추가할 보간 원의 개수

        let t;
        if (nextPoint.time === lastPoint.time) {
            t = 1;
        } else {
            t = (playtime - lastPoint.time) / (nextPoint.time - lastPoint.time);
        }
        const interpolatedPitch = lastPoint.pitch + t * (nextPoint.pitch - lastPoint.pitch);
        // const color = colorScale(interpolatedPitch); // 색상 스케일에서 색상 가져오기
        const color = noteToColorWithLuminance(pitchToNote(Math.floor(interpolatedPitch)))
        const radius = this.mapRange(this.props.control.volume_value, 0, 100, 1, 30);
        const yRadius = this.mapRange(this.props.control.volume_value, 0, 100, 20, 80); // pitch_value를 사용하여 y 반지름 설정
        let size = 50

        // if (this.control.shape_value === 1) {
        svg.append('circle')
            .attr('cx', xScale(playtime))
            .attr('cy', yScale(interpolatedPitch))
            .attr('r', radius) // 사이즈 설정
            .attr('fill', color) // 색상 매핑
            .attr('opacity', this.props.opacity);

        const currentBeatData = this.state.savebeat.filter(beat => beat.time <= times[times.length - 1] && beat.time > times[0]);

        // 비트 값의 평균 계산
        const averageAmplitude = currentBeatData.reduce((sum, beat) => sum + beat.amplitude, 0) / currentBeatData.length;

        // 평균 이상인 비트만 필터링
        const filteredBeatData = currentBeatData.filter(beat => beat.amplitude >= averageAmplitude);
        // console.log(currentBeatData)
        // 수직선을 추가하는 함수
        filteredBeatData.forEach(beat => {
            if (changeflag === 1) {
                // svg.selectAll('line').remove();
                svg.selectAll('rect').remove();

                // console.log("clear", playtime)
                changeflag = 0
            }
            // size=beat.Beat_amplitude*
            if (playtime >= beat.time) {
                size = mapAmplitudeToSize(beat.amplitude);
                console.log(size)
                if (playtime < this.state.currentbeattime) {

                    svg.append('rect')
                        .attr('x', xScale(beat.time))
                        .attr('y', 0)
                        .attr('width', size)
                        .attr('height', size)
                        .attr('fill', color)
                        .attr('opacity', 1)
                        .datum(beat)
                        .on('click', (e, d) => {
                            d3.select(e.currentTarget).remove(); // 클릭한 요소 제거
                            this.setState((prevState) => ({
                                savebeat: prevState.savebeat.filter(b => b.time !== d.time)
                            }));
                        });
                    this.setState({ currentbeattime: beat.time })
                    this.props.setBeatamp(beat.amplitude)

                }
                else {
                    if (this.state.currentbeattime < beat.time) {
                        svg.append('rect')
                            .attr('x', xScale(beat.time))
                            .attr('y', 0)
                            .attr('width', size)
                            .attr('height', size)
                            .attr('fill', color)
                            .attr('opacity', 1)
                            .datum(beat)
                            .on('click', (e, d) => {
                                d3.select(e.currentTarget).remove(); // 클릭한 요소 제거
                                this.setState((prevState) => ({
                                    savebeat: prevState.savebeat.filter(b => b.time !== d.time)
                                }));
                            });
                        this.setState({ currentbeattime: beat.time })
                        this.props.setBeatamp(beat.amplitude)

                    }
                }




                // this.props.setBeatamp(beat.amplitude)

            }
            //한번만찍혀야하는데 여러번찍히네...
            if (this.props.midibeat.times > this.state.prevadd && this.props.midibeat.times <= beat.time) {
                // console.log(this.props.midibeat.amplitude);
                // 중복 방지를 위한 플래그 설정

                // 업데이트가 이미 발생하지 않았다면 실행
                if (!this.isUpdated) {
                    svg.append('rect')
                        .attr('x', xScale(this.props.midibeat.times))
                        .attr('y', 0)
                        .attr('width', size)
                        .attr('height', size)
                        .attr('fill', color)
                        .attr('opacity', 1)
                        .datum(this.props.midibeat)
                        .on('click', (e, d) => {
                            d3.select(e.currentTarget).remove(); // 클릭한 요소 제거
                            this.setState((prevState) => ({
                                savebeat: prevState.savebeat.filter(b => b.time !== d.time)
                            }));
                        });

                    this.setState({ prevadd: this.props.midibeat.times });
                    this.setState((prevState) => ({
                        savebeat: [...prevState.savebeat, { time: this.props.midibeat.times, amplitude: 0 }]
                    }));
                    this.props.setBeatamp(this.props.midibeat.times);

                    // 업데이트 플래그 설정
                    this.isUpdated = true;
                }
            }




        });



    }


    render() {
        return (
            <div style={{ paddingLeft: '20px' }}>
                <svg ref={this.svgRef} width={800} height={300} ></svg>

            </div>
        );
    }
}


export default MusicVisual;



