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





class Control extends Component {
    constructor(props) {
        super(props);
        this.emotionflag = 0
        this.pitchflag = 0
        this.currentphase = 0
        this.state = {
            // 여긴 현재만 저장!
            pitch_value: 'dd',
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
        }


        if (prevProps.playtime != this.props.playtime) {

            for (let i = 0; i < this.props.emotionlist.length; i++) {
                if (this.props.emotionlist[i][0] <= this.props.playtime && this.props.emotionlist[i][1] >= this.props.playtime) {
                    console.log(this.props.emotionlist[i][2])
                    this.setState({ ['font_value']: this.props.emotionlist[i][2] }, () => {
                        this.props.setControl({ ...this.state });
                    });
                    this.emotionflag = 1
                    break;
                }


            }



            if (this.emotionflag === 0) {
                this.setState({ ['font_value']: this.props.totaldata.Emotions[0] }, () => {
                    this.props.setControl({ ...this.state });
                });

            }


            for (let i = 0; i < this.props.pitchlist.length; i++) {

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
        return (

            <div style={{ width: '70%' }}>

                <Card style={{ width: '100%', padding: '10px' }}>
                    <Tabs
                        defaultActiveKey="total"
                        id="uncontrolled-tab-example"
                        className="mb-3"
                    >
                        <Tab eventKey="음악정보입력" title="음악정보입력">
                            <Fileloader setDuration={this.props.setDuration} totaldata={this.props.totaldata} setTotaldata={this.props.setTotaldata} setTimedata={this.props.setTimedata} setAudiourl={this.props.setAudiourl}></Fileloader>
                        </Tab>

                        {/* test */}
                        <Tab eventKey="total" title="total">
                            <Card>
                                <Card.Header>가사시각화</Card.Header>
                                <Card.Body>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginBottom: '1rem' }}>
                                        <DropdownButton id="dropdown-basic-button" title="font">
                                            <Dropdown.Item style={{ fontFamily: 'aggressive' }} onClick={() => this.handleChange({ target: { value: 'aggressive' } }, 'font_value')}>공격적인</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'calm' }} onClick={() => this.handleChange({ target: { value: 'calm' } }, 'font_value')}>차분한</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'chilled' }} onClick={() => this.handleChange({ target: { value: 'chilled' } }, 'font_value')}>차가운</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'dark' }} onClick={() => this.handleChange({ target: { value: 'dark' } }, 'font_value')}>어두운</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'energetic' }} onClick={() => this.handleChange({ target: { value: 'energetic' } }, 'font_value')}>활기찬</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'epic' }} onClick={() => this.handleChange({ target: { value: 'epic' } }, 'font_value')}>웅장한</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'happy' }} onClick={() => this.handleChange({ target: { value: 'happy' } }, 'font_value')} >행복한</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'romantic' }} onClick={() => this.handleChange({ target: { value: 'romantic' } }, 'font_value')}>로맨틱한</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'sad' }} onClick={() => this.handleChange({ target: { value: 'sad' } }, 'font_value')}>슬픈</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'scary' }} onClick={() => this.handleChange({ target: { value: 'scary' } }, 'font_value')}>무서운</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'sexy' }} onClick={() => this.handleChange({ target: { value: 'sexy' } }, 'font_value')}>섹시한</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'ethereal' }} onClick={() => this.handleChange({ target: { value: 'ethereal' } }, 'font_value')}>미묘한</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'uplifting' }} onClick={() => this.handleChange({ target: { value: 'uplifting' } }, 'font_value')}>희망적인</Dropdown.Item>
                                        </DropdownButton>

                                        <DropdownButton id="dropdown-basic-button" title="pitch">
                                            <Dropdown.Item href="#/action-1">올라가는</Dropdown.Item>
                                            <Dropdown.Item href="#/action-2">내려가는</Dropdown.Item>
                                            <Dropdown.Item href="#/action-4">유지하는</Dropdown.Item>
                                        </DropdownButton>
                                    </div>

                                </Card.Body>
                            </Card>


                            <Card>
                                <Card.Header>음악시각화</Card.Header>
                                <Card.Body>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginBottom: '1rem' }}>
                                        <DropdownButton id="dropdown-basic-button" title="shape">
                                            <Dropdown.Item onClick={() => this.handleChange({ target: { value: 9 } }, 'shape_value')}>공격적인</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.handleChange({ target: { value: 5 } }, 'shape_value')}>차분한</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.handleChange({ target: { value: 7 } }, 'shape_value')}>차가운</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.handleChange({ target: { value: 3 } }, 'shape_value')}>어두운</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.handleChange({ target: { value: 8 } }, 'shape_value')}>활기찬</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.handleChange({ target: { value: 6 } }, 'shape_value')}>웅장한</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.handleChange({ target: { value: 1 } }, 'shape_value')}>행복한</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.handleChange({ target: { value: 8 } }, 'shape_value')}>로맨틱</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.handleChange({ target: { value: 3 } }, 'shape_value')}>슬픈</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.handleChange({ target: { value: 9 } }, 'shape_value')}>무서운</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.handleChange({ target: { value: 6 } }, 'shape_value')}>섹시한</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.handleChange({ target: { value: 5 } }, 'shape_value')}>미묘한</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.handleChange({ target: { value: 2 } }, 'shape_value')}>희망적인</Dropdown.Item>

                                        </DropdownButton>

                                        <DropdownButton id="dropdown-basic-button" title="pitch">
                                            <Dropdown.Item onClick={() => this.handleChange({ target: { value: '단순한' } }, 'pitch_value')}>단순한</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.handleChange({ target: { value: '복잡한' } }, 'pitch_value')}>복잡한</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.handleChange({ target: { value: '고조되는' } }, 'pitch_value')}>고조되는</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.handleChange({ target: { value: '저하되는' } }, 'pitch_value')}>저하되는</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.handleChange({ target: { value: '반복적인' } }, 'pitch_value')}>반복적인</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.handleChange({ target: { value: '변화무쌍한' } }, 'pitch_value')}>변화무쌍한</Dropdown.Item>
                                        </DropdownButton>
                                    </div>

                                </Card.Body>
                            </Card>

                            <div>
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
                            </div>


                            <div>
                                <Card.Title>음정</Card.Title>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexDirection: 'row', // Flexbox에서 수평 정렬
                                    writingMode: 'horizontal-tb', // 이 속성은 제거해도 됩니다
                                }}>
                                    <span>낮게</span>
                                    <RangeSlider
                                        style={{ padding: '23px' }}
                                        min={40}
                                        max={84}
                                        value={this.state.pitch_value}

                                        onChange={(e) => this.handleChange(e, 'pitch_value')}
                                    />
                                    <span>높게</span>
                                </div>
                            </div>
                            <div >
                                <Card.Title>비트</Card.Title>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexDirection: 'row', // Flexbox에서 수평 정렬
                                    writingMode: 'horizontal-tb', // 이 속성은 제거해도 됩니다
                                }}>
                                    <span>느리게</span>
                                    <RangeSlider
                                        style={{ padding: '10px' }}
                                        value={this.state.beat_value}
                                        onChange={(e) => this.handleChange(e, 'beat_value')}
                                    />
                                    <span>빠르게</span>

                                </div>

                            </div>
                            <Button onClick={this.exportValue} style={{ width: '100%', marginTop: '10px', borderColor: 'black', color: 'black', backgroundColor: 'lightskyblue' }}>재생성</Button>{' '}

                        </Tab>

                        <Tab eventKey="가사시각화" title="가사시각화">

                            <div style={{ display: "flex", justifyContent: 'center' }}>
                                <div style={{ margin: "auto auto" }}>
                                    <div>
                                        <div id="genre" style={{ padding: '10px' }}>
                                            <Card.Title>emotion</Card.Title>
                                            <DropdownButton id="dropdown-basic-button" title="감정 선택">
                                                <Dropdown.Item href="#/action-1">공격적인</Dropdown.Item>
                                                <Dropdown.Item href="#/action-2">차분한</Dropdown.Item>
                                                <Dropdown.Item href="#/action-4">어두운</Dropdown.Item>
                                                <Dropdown.Item href="#/action-5">활기찬</Dropdown.Item>
                                                <Dropdown.Item href="#/action-6">서사적</Dropdown.Item>
                                                <Dropdown.Item href="#/action-7">행복한</Dropdown.Item>
                                                <Dropdown.Item href="#/action-8">로맨틱</Dropdown.Item>
                                                <Dropdown.Item href="#/action-9">미묘한</Dropdown.Item>
                                            </DropdownButton>

                                        </div>
                                        <div id="verse_emotion" style={{ padding: '20px' }}>
                                            <Card.Title>분위기</Card.Title>
                                            {/* <Form.Control
                                                type="color"
                                                id="exampleColorInput"
                                                defaultValue="#fff"
                                                title="Choose your color"
                                            /> */}
                                            <HexColorPicker color={this.state.color_value} onChange={this.setColor} />

                                        </div>

                                        <div>
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
                                        </div>


                                        <div>
                                            <Card.Title>음정</Card.Title>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                flexDirection: 'row', // Flexbox에서 수평 정렬
                                                writingMode: 'horizontal-tb', // 이 속성은 제거해도 됩니다
                                            }}>
                                                <span>낮게</span>
                                                <RangeSlider
                                                    style={{ padding: '23px' }}
                                                    min={40}
                                                    max={84}
                                                    value={this.state.pitch_value}

                                                    onChange={(e) => this.handleChange(e, 'pitch_value')}
                                                />
                                                <span>높게</span>
                                            </div>
                                        </div>
                                        <div >
                                            <Card.Title>비트</Card.Title>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                flexDirection: 'row', // Flexbox에서 수평 정렬
                                                writingMode: 'horizontal-tb', // 이 속성은 제거해도 됩니다
                                            }}>
                                                <span>느리게</span>
                                                <RangeSlider
                                                    style={{ padding: '10px' }}
                                                    value={this.state.beat_value}
                                                    onChange={(e) => this.handleChange(e, 'beat_value')}
                                                />
                                                <span>빠르게</span>

                                            </div>

                                        </div>


                                    </div>

                                </div>

                            </div>
                            <Button onClick={this.exportValue} style={{ width: '100%', marginTop: '10px', borderColor: 'black', color: 'black', backgroundColor: 'lightskyblue' }}>재생성</Button>{' '}

                        </Tab>
                        <Tab eventKey="음악시각화" title="음악시각화">
                            <div style={{ display: "flex", justifyContent: 'center' }}>
                                <div style={{ margin: "auto auto" }}>
                                    <div id="genre" style={{ padding: '10px' }}>
                                        <Card.Title>시각유형</Card.Title>
                                        <DropdownButton id="dropdown-basic-button" title="모드 선택">
                                            <Card.Text style={{ paddingLeft: '10px' }}>Melodic</Card.Text>
                                            <Dropdown.Item href="#/action-1">Hilbert + melody</Dropdown.Item>
                                            <Dropdown.Item href="#/action-2">Hilbert scope</Dropdown.Item>
                                            <Dropdown.Item href="#/action-4">Hilbert painter</Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Card.Text style={{ paddingLeft: '10px' }}>Harmonic</Card.Text>

                                            <Dropdown.Item href="#/action-5">spectrograph</Dropdown.Item>
                                            <Dropdown.Item href="#/action-6">spectrogram</Dropdown.Item>
                                            <Dropdown.Item href="#/action-7">spectrogram+melody</Dropdown.Item>
                                            <Dropdown.Item href="#/action-8">spectrogram painter</Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Card.Text style={{ paddingLeft: '10px' }}>Dynamic</Card.Text>

                                            <Dropdown.Item href="#/action-9">waveform</Dropdown.Item>
                                            <Dropdown.Item href="#/action-10">oscilloscope</Dropdown.Item>

                                        </DropdownButton>

                                    </div>
                                    <div id="verse_emotion" style={{ padding: '20px' }}>
                                        <Card.Title>분위기</Card.Title>
                                        {/* <Form.Control
                                                type="color"
                                                id="exampleColorInput"
                                                defaultValue="#fff"
                                                title="Choose your color"
                                            /> */}
                                        <HexColorPicker color={this.state.color_value} onChange={this.setColor} />

                                    </div>
                                    <div>
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
                                                min={60}
                                                max={180}
                                                value={this.state.bpm_value}
                                                onChange={(e) => this.handleChange(e, 'bpm_value')}
                                            />
                                            <span>크게</span>
                                        </div>
                                    </div>


                                    <div>
                                        <Card.Title>음정</Card.Title>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            flexDirection: 'row', // Flexbox에서 수평 정렬
                                            writingMode: 'horizontal-tb', // 이 속성은 제거해도 됩니다
                                        }}>
                                            <span>낮게</span>
                                            <RangeSlider
                                                style={{ padding: '23px' }}
                                                min={40}
                                                max={84}
                                                value={this.state.pitch_value}

                                                onChange={(e) => this.handleChange(e, 'pitch_value')}
                                            />
                                            <span>높게</span>
                                        </div>
                                    </div>
                                    <div >
                                        <Card.Title>비트</Card.Title>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            flexDirection: 'row', // Flexbox에서 수평 정렬
                                            writingMode: 'horizontal-tb', // 이 속성은 제거해도 됩니다
                                        }}>
                                            <span>느리게</span>
                                            <RangeSlider
                                                style={{ padding: '10px' }}
                                                value={this.state.volume_value}
                                                onChange={(e) => this.handleChange(e, 'volume_value')}
                                            />
                                            <span>빠르게</span>

                                        </div>

                                    </div>
                                </div>
                            </div>
                            <Button onClick={this.exportValue} style={{ width: '100%', marginTop: '10px', borderColor: 'black', color: 'black', backgroundColor: 'lightskyblue' }}>재생성</Button>{' '}

                        </Tab>

                    </Tabs>


                </Card>


            </div >
        )
    }
}

export default Control;
