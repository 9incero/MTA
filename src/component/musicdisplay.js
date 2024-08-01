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
        this.beatData = this.props.totaldata.Beat_amplitude
        this.state = {
            pitches: [],
            times: [],
            prevPhase: 0, // 현재 표시할 phase
            pitchTmp: [],
            timeTmp: []
        };
    }


    componentDidMount() {
        // const pitches = [];
        // const times = [];
        // const seenTimes = new Set(); // 중복 제거를 위한 Set
        // let pitchTmp = [];
        // let timeTmp = [];
        // let prevPhase = -1;

        // this.data.forEach(lyric => {
        //     let currentPhase = lyric.phase;
        //     if (currentPhase !== prevPhase) {
        //         if (pitchTmp.length > 0) {
        //             pitches.push([...pitchTmp]);
        //             times.push([...timeTmp]);
        //         }
        //         pitchTmp = [];
        //         timeTmp = [];
        //         prevPhase = currentPhase;
        //     }

        //     lyric.pitch.forEach(pitch => {
        //         if (!seenTimes.has(pitch.start)) {
        //             pitchTmp.push(pitch.midi_note);
        //             timeTmp.push(pitch.start);
        //             seenTimes.add(pitch.start); // Set에 추가하여 중복 방지
        //         }
        //     });
        // });

        // if (timeTmp.length > 0) {
        //     pitches.push([...pitchTmp]);
        //     times.push([...timeTmp]);
        // }

        // this.fillMissingData(times, pitches);
        // // console.log(times); // 수정된 times 확인
        // this.setState({ pitches, times });
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

    }


    componentDidUpdate(prevProps, prevState) {
        if (prevProps.totaldata != this.props.totaldata) {

            this.data = this.props.totaldata.Lyrics;
            this.addData = this.props.totaldata.Pitch;
            this.beatData = this.props.totaldata.Beat_amplitude


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
                // 상태 업데이트 후 콜백
                console.log('Updated pitches:', this.state.pitches);
                console.log('Updated times:', this.state.times);
            });
        }

        if (prevState.times != this.state.times) {
            console.log('Updated times in componentDidUpdate:', this.state.times);
        }


        if (prevProps.playtime != this.props.playtime) {
            console.log('times', this.state.times)
            // 모든 조건을 만족하는 beat 찾기
            let lastMatchingBeat = null;
            for (let i = 0; i < this.beatData.length; i++) {
                if (this.props.playtime >= this.beatData[i].time) {
                    lastMatchingBeat = this.beatData[i];
                    this.props.setOpacity(lastMatchingBeat.amplitude);

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

        // 이전 내용을 지움
        if (this.flag) {
            svg.selectAll('*').remove();

            this.flag = false;
        }

        // 스케일 설정
        const xScale = d3.scaleLinear()
            .domain([d3.min(times), d3.max(times)])
            .range([10, width - 10]);

        const yScale = d3.scaleLinear()
            .domain([d3.min(pitches), d3.max(pitches)])
            .range([height - 100, 100]);

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
        const color = colorScale(interpolatedPitch); // 색상 스케일에서 색상 가져오기
        console.log(nextPoint, lastPoint, playtime, interpolatedPitch, t);
        const radius = this.mapRange(this.props.control.volume_value, 0, 100, 1, 50);

        svg.append('circle')
            .attr('cx', xScale(playtime))
            .attr('cy', yScale(interpolatedPitch))
            .attr('r', radius) // 사이즈 설정
            .attr('fill', color) // 색상 매핑
            .attr('opacity', this.props.opacity);


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


