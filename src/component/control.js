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





class Control extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 기본값 받아와서 사용
            bpm_value: 61,
            pitch_value: 10,
            volume_value: 50,
            color_value: "#000",
        };
        this.setColor = this.setColor.bind(this);
    }


    setColor(color_value) {
        this.setState({ color_value });
    }
    handleChange = (event, name) => {
        this.setState({ [name]: event.target.value });
    };
    exportValue = () => {
        // 이게 전송할거리들
        console.log(this.state)
    }
    render() {
        return (

            <div>

                <Card style={{ width: '22rem', padding: '10px' }}>
                    <Tabs
                        defaultActiveKey="음악정보입력"
                        id="uncontrolled-tab-example"
                        className="mb-3"
                    >
                        <Tab eventKey="음악정보입력" title="음악정보입력">
                            <Fileloader setTimedata={this.props.setTimedata} setAudiourl={this.props.setAudiourl}></Fileloader>
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
