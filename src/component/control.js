import { React, Component } from 'react';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import RangeSlider from 'react-bootstrap-range-slider';
import { HexColorPicker } from "react-colorful";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Fileloader from './fileloader';
import './modulestyle/font.css'
import { toHaveStyle } from '@testing-library/jest-dom/matchers';
import InstrumentPicker from './Instrumentpicker';
import buttonbackground from '../img/btn_재생성etc@3x.png'



class Control extends Component {
    constructor(props) {
        super(props);
        this.emotionflag = 0
        this.pitchflag = 0
        this.currentphase = 0
        this.state = {
            // 여긴 현재만 저장!
            pitch_value: 'Pitch',
            volume_value: 50,
            font_value: this.props.totaldata.Emotions[0],
        };
        this.setColor = this.setColor.bind(this);
    }



    componentDidUpdate(prevProps) {
        if (prevProps.totaldata !== this.props.totaldata) {
            console.log(this.props.totaldata.Emotions)

        }

        if (prevProps.emotionlist !== this.props.emotionlist) {
            console.log('now list', this.props.emotionlist)
        }

        if (prevProps.pitchlist !== this.props.pitchlist) {
            console.log('now p list', this.props.pitchlist)
        }


        if (prevProps.playtime != this.props.playtime) {

            for (let j = 0; j < this.props.phase.length; j++) {
                if (this.props.phase[j][0] <= this.props.playtime && this.props.phase[j][1] >= this.props.playtime) {
                    if (this.currentphase != j) {
                        this.emotionflag = 0
                        this.pitchflag = 0
                        this.currentphase = j
                    }

                }
            }



            for (let i = 0; i < this.props.emotionlist.length; i++) {
                if (this.props.emotionlist[i][0] <= this.props.playtime && this.props.emotionlist[i][1] >= this.props.playtime) {
                    console.log(this.props.emotionlist[i][2])
                    this.setState({ ['font_value']: this.props.emotionlist[i][2] }, () => {
                        this.props.setControl({ ...this.state });
                        this.props.setCurrentemotion(this.props.emotionlist[i][2])
                    });
                    this.emotionflag = 1
                    break;
                }


            }



            if (this.emotionflag === 0) {
                this.setState({ ['font_value']: this.props.totaldata.Emotions[0] }, () => {
                    this.props.setControl({ ...this.state });
                    this.props.setCurrentemotion(this.props.totaldata.Emotions[0])

                });

            }


            for (let i = 0; i < this.props.pitchlist.length; i++) {
                console.log('zz', this.props.pitchlist)
                if (this.props.pitchlist[i][0] <= this.props.playtime && this.props.pitchlist[i][1] >= this.props.playtime) {
                    console.log(this.props.pitchlist[i][2])
                    this.handleChange({ target: { value: this.props.pitchlist[i][2] } }, 'pitch_value');
                    // this.handleChange({ target: { value: this.props.pitchlist[i][2] } }, 'pitch_value');
                    this.pitchflag = 1
                    break;
                }

            }
            if (this.pitchflag === 0) {
                this.handleChange({ target: { value: '' } }, 'pitch_value');

            }

        }
    }

    setColor(color_value) {
        this.setState({ color_value });
    }
    handleChange = (event, name) => {
        this.setState({ [name]: event.target.value }, () => {
            this.props.setControl({ ...this.state });
        });
        if (name === 'font_value' && event.target.value != this.props.totaldata.Emotions[0]) {
            this.emotionflag = 1


            this.props.setCurrentemotion(event.target.value)

            let tmp = [...this.props.emotionlist]; // emotionlist를 복사

            for (let i = 0; i < this.props.phase.length; i++) {
                if (this.props.phase[i][0] <= this.props.playtime && this.props.phase[i][1] >= this.props.playtime) {
                    let phaseStart = this.props.phase[i][0];
                    let existingIndex = tmp.findIndex(item => item[0] === phaseStart); // start 값이 같은지 확인

                    if (existingIndex !== -1) {
                        // start 값이 같은 요소가 있으면, 해당 요소를 복사하여 새로운 값을 추가
                        tmp[existingIndex] = [...tmp[existingIndex].slice(0, 2), event.target.value];
                    } else {
                        // 새로운 항목 추가
                        tmp.push([phaseStart, this.props.phase[i][1], event.target.value]);
                    }

                    console.log(tmp);
                    this.props.setEmotionlist(tmp); // 배열로 전달
                }
            }
        }


        if (name === 'pitch_value' && event.target.value != '') {
            this.pitchflag = 1

            let tmp = [...this.props.pitchlist]; // emotionlist를 복사

            for (let i = 0; i < this.props.phase.length; i++) {
                if (this.props.phase[i][0] <= this.props.playtime && this.props.phase[i][1] >= this.props.playtime) {
                    let phaseStart = this.props.phase[i][0];
                    let existingIndex = tmp.findIndex(item => item[0] === phaseStart); // start 값이 같은지 확인

                    if (existingIndex !== -1) {
                        // start 값이 같은 요소가 있으면, 해당 요소를 복사하여 새로운 값을 추가
                        tmp[existingIndex] = [...tmp[existingIndex].slice(0, 2), event.target.value];
                    } else {
                        // 새로운 항목 추가
                        tmp.push([phaseStart, this.props.phase[i][1], event.target.value]);
                    }

                    console.log(tmp);
                    this.props.setPitchlist(tmp); // 배열로 전달
                }
            }
        }


    };
    exportValue = () => {
        // 이게 전송할거리들.. 여기 조정
        this.props.setControl(this.state)

        const formattedEmotionList = this.props.emotionlist.map(item => ({
            start: item[0],
            end: item[1],
            emotions: item[2]
        }));


        const formattedPitchList = this.props.pitchlist.map(item => ({
            start: item[0],
            end: item[1],
            pitch: item[2]
        }));

        const combinedJson = {
            Pitch: formattedPitchList.map(item => ({
                start: item.start,
                end: item.end,
                meta_tag: item.pitch
            })),
            Emotions: formattedEmotionList.map(item => ({
                start: item.start,
                end: item.end,
                emotions: item.emotions
            })),
            Origin_beat: this.props.totaldata.Beat_amplitude,
            Beat: this.props.beatlist,
            Volume: Number(this.state.volume_value),
            Instruments: this.props.instrumenticon

        };

        console.log(combinedJson)
        // 서버에서 받은 데이터를 JSON 문자열로 변환
        const jsonData = JSON.stringify(combinedJson);

        // JSON 데이터를 Blob으로 변환
        const blob = new Blob([jsonData], { type: 'application/json' });

        // Blob을 가리키는 임시 URL 생성
        const url = window.URL.createObjectURL(blob);

        // 다운로드 링크 생성
        const link = document.createElement('a');
        link.href = url;
        link.download = this.props.user + 'log.json'; // 원하는 파일 이름 설정
        link.click();

        // URL과 링크 정리
        window.URL.revokeObjectURL(url);

        this.props.setEditnum(this.props.editnum + 1)
        this.props.setChangedata(combinedJson)



    }
    render() {
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
        return (

            <div >

                <Card style={{ width: '90%', padding: '10px', marginLeft: 10, }}>

                    <Tabs
                        defaultActiveKey="음악정보입력"
                        id="uncontrolled-tab-example"
                        className="mb-3"
                    >
                        <Tab eventKey="음악정보입력" title="Music Information">
                            <Fileloader user={this.props.user} playtime={this.props.playtime} setPlaytime={this.props.setPlaytime} setPrompt={this.props.setPrompt} cnum={this.props.cnum} setCnum={this.props.setCnum} editnum={this.props.editnum} setEditnum={this.props.setEditnum} emotionlist={this.props.emotionlist} pitchlist={this.props.pitchlist} setEmotionlist={this.props.setEmotionlist} setPitchlist={this.props.setPitchlist} setDuration={this.props.setDuration} totaldata={this.props.totaldata} setTotaldata={this.props.setTotaldata} setTimedata={this.props.setTimedata} setAudiourl={this.props.setAudiourl} ></Fileloader>
                        </Tab>

                        {/* test */}
                        <Tab eventKey="음악편집" title="Music Edit">
                            <div style={{ alignItems: 'center', marginBottom: '1rem' }}>
                                <InstrumentPicker instrumenticon={this.props.instrumenticon} setInstrumenticon={this.props.setInstrumenticon}></InstrumentPicker>

                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
                                <span>Emotions Selection: </span>
                                <DropdownButton id="dropdown-basic-button" title={this.state.font_value || 'Emotion'}>
                                    <Dropdown.Item style={{ fontFamily: 'aggressive', fontSize: '16px' }} onClick={() => this.handleChange({ target: { value: 'aggressive' } }, 'font_value')}>
                                        <span >Aggressive</span>
                                        <span style={{ color: '#FF0000', marginLeft: '5px' }}>●</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item style={{ fontFamily: 'calm', fontSize: '16px' }} onClick={() => this.handleChange({ target: { value: 'calm' } }, 'font_value')}>
                                        <span style={{ fontSize: '18px' }}>Calm</span>
                                        <span style={{ color: '#87CEEB', marginLeft: '5px' }}>●</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item style={{ fontFamily: 'chilled' }} onClick={() => this.handleChange({ target: { value: 'chilled' } }, 'font_value')}>
                                        <span>Chilled</span>
                                        <span style={{ color: '#E0FFFF', marginLeft: '5px' }}>●</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item style={{ fontFamily: 'dark' }} onClick={() => this.handleChange({ target: { value: 'dark' } }, 'font_value')}>
                                        <span>Dark</span>
                                        <span style={{ color: '#2F4F4F', marginLeft: '5px' }}>●</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item style={{ fontFamily: 'energetic' }} onClick={() => this.handleChange({ target: { value: 'energetic' } }, 'font_value')}>
                                        <span>Energetic</span>
                                        <span style={{ color: '#FFA500', marginLeft: '5px' }}>●</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item style={{ fontFamily: 'epic' }} onClick={() => this.handleChange({ target: { value: 'epic' } }, 'font_value')}>
                                        <span style={{ fontSize: '25px' }}>Epic</span>
                                        <span style={{ color: '#8A2BE2', marginLeft: '5px' }}>●</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item style={{ fontFamily: 'happy' }} onClick={() => this.handleChange({ target: { value: 'happy' } }, 'font_value')}>
                                        <span>Happy</span>
                                        <span style={{ color: '#FFFF00', marginLeft: '5px' }}>●</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item style={{ fontFamily: 'romantic' }} onClick={() => this.handleChange({ target: { value: 'romantic' } }, 'font_value')}>
                                        <span style={{ fontSize: '30px', marginTop: 0 }}>Romantic</span>
                                        <span style={{ color: '#FF69B4', marginLeft: '5px' }}>●</span>

                                    </Dropdown.Item>
                                    <Dropdown.Item style={{ fontFamily: 'sad' }} onClick={() => this.handleChange({ target: { value: 'sad' } }, 'font_value')}>
                                        <span style={{ fontSize: '25px' }} >Sad</span>
                                        <span style={{ color: '#4682B4', marginLeft: '5px' }}>●</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item style={{ fontFamily: 'scary' }} onClick={() => this.handleChange({ target: { value: 'scary' } }, 'font_value')}>
                                        <span style={{ fontSize: '25px' }}>Scary</span>
                                        <span style={{ color: '#800000', marginLeft: '5px' }}>●</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item style={{ fontFamily: 'sexy' }} onClick={() => this.handleChange({ target: { value: 'sexy' } }, 'font_value')}>
                                        <span style={{ fontSize: '25px' }} >Sexy</span>
                                        <span style={{ color: '#FF1493', marginLeft: '5px' }}>●</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item style={{ fontFamily: 'ethereal' }} onClick={() => this.handleChange({ target: { value: 'ethereal' } }, 'font_value')}>
                                        <span style={{ fontSize: '25px' }}>Ethereal</span>
                                        <span style={{ color: '#d3ade5', marginLeft: '5px' }}>●</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item style={{ fontFamily: 'uplifting' }} onClick={() => this.handleChange({ target: { value: 'uplifting' } }, 'font_value')}>
                                        <span>Uplifting</span>
                                        <span style={{ color: '#00FF00', marginLeft: '5px' }}>●</span>
                                    </Dropdown.Item>
                                </DropdownButton>
                            </div>


                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                <span>Pitch Selection: </span>

                                <DropdownButton id="dropdown-basic-button" title={this.state.pitch_value}>
                                    <Dropdown.Item onClick={() => this.handleChange({ target: { value: 'Simple' } }, 'pitch_value')}>Simple</Dropdown.Item>
                                    <Dropdown.Item onClick={() => this.handleChange({ target: { value: 'Complex' } }, 'pitch_value')}>Complex</Dropdown.Item>
                                    <Dropdown.Item onClick={() => this.handleChange({ target: { value: 'Ascending' } }, 'pitch_value')}>Ascending</Dropdown.Item>
                                    <Dropdown.Item onClick={() => this.handleChange({ target: { value: 'Descending' } }, 'pitch_value')}>Descending</Dropdown.Item>
                                    <Dropdown.Item onClick={() => this.handleChange({ target: { value: 'Repetitive' } }, 'pitch_value')}>Repetitive</Dropdown.Item>
                                    <Dropdown.Item onClick={() => this.handleChange({ target: { value: 'Varied' } }, 'pitch_value')}>Varied</Dropdown.Item>
                                </DropdownButton>
                            </div>


                            {/* <div>
                                <Card.Title>볼륨</Card.Title>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexDirection: 'row', // Flexbox에서 수평 정렬
                                    writingMode: 'horizontal-tb', // 이 속성은 제거해도 됩니다
                                }}>
                                    <span>작게</span>

                                    <RangeSlider
                                        style={{ padding: '23px' }}
                                        min={0}
                                        max={100}
                                        value={this.state.volume_value}
                                        onChange={(e) => this.handleChange(e, 'volume_value')}
                                    />
                                    <span>크게</span>
                                </div>
                            </div> */}



                            <Button onClick={this.exportValue} style={{
                                width: '100%', marginTop: '10px', backgroundColor: 'white', color: 'black', border: 'none', backgroundImage: 'url(' + buttonbackground
                                    + ')', backgroundSize: '100% 100%',
                                backgroundRepeat: 'no-repeat'
                            }}>Regenerative</Button>{' '}

                        </Tab>

                    </Tabs>


                </Card>


            </div>
        )
    }
}

export default Control;
