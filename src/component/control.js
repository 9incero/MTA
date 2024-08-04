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





class Control extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 기본값 받아와서 사용
            beat_value: 61,
            pitch_value: 10,
            volume_value: 50,
            color_value: "#000",
            font_value: 'sans-serif',
            shape_value: 1,
        };
        this.setColor = this.setColor.bind(this);
    }


    setColor(color_value) {
        this.setState({ color_value });
    }
    handleChange = (event, name) => {
        this.setState({ [name]: event.target.value }, () => {
            this.props.setControl({ ...this.state });
        });

    };
    exportValue = () => {
        // 이게 전송할거리들
        this.props.setControl(this.state)

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
                            <Fileloader totaldata={this.props.totaldata} setTotaldata={this.props.setTotaldata} setTimedata={this.props.setTimedata} setAudiourl={this.props.setAudiourl}></Fileloader>
                        </Tab>

                        {/* test */}
                        <Tab eventKey="total" title="total">
                            <Card>
                                <Card.Header>가사시각화</Card.Header>
                                <Card.Body>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginBottom: '1rem' }}>
                                        <DropdownButton id="dropdown-basic-button" title="font">
                                            <Dropdown.Item style={{ fontFamily: 'aggressive-font' }} onClick={() => this.handleChange({ target: { value: 'aggressive-font' } }, 'font_value')}>공격적인</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'calm-font' }} onClick={() => this.handleChange({ target: { value: 'calm-font' } }, 'font_value')}>차분한</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'chilled-font' }} onClick={() => this.handleChange({ target: { value: 'chilled-font' } }, 'font_value')}>차가운</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'dark-font' }} onClick={() => this.handleChange({ target: { value: 'dark-font' } }, 'font_value')}>어두운</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'energetic-font' }} onClick={() => this.handleChange({ target: { value: 'energetic-font' } }, 'font_value')}>활기찬</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'epic-font' }} onClick={() => this.handleChange({ target: { value: 'epic-font' } }, 'font_value')}>웅장한</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'happy-font' }} onClick={() => this.handleChange({ target: { value: 'happy-font' } }, 'font_value')} >행복한</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'romantic-font' }} onClick={() => this.handleChange({ target: { value: 'romantic-font' } }, 'font_value')}>로맨틱한</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'sad-font' }} onClick={() => this.handleChange({ target: { value: 'sad-font' } }, 'font_value')}>슬픈</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'regularttttt' }} onClick={() => this.handleChange({ target: { value: 'scary-font' } }, 'font_value')}>무서운</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'sexy-font' }} onClick={() => this.handleChange({ target: { value: 'sexy-font' } }, 'font_value')}>섹시한</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'ethereal-font' }} onClick={() => this.handleChange({ target: { value: 'ethereal-font' } }, 'font_value')}>미묘한</Dropdown.Item>
                                            <Dropdown.Item style={{ fontFamily: 'uplifting-font' }} onClick={() => this.handleChange({ target: { value: 'uplifting-font' } }, 'font_value')}>희망적인</Dropdown.Item>
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
                                            <Dropdown.Item href="#/action-1">올라가는</Dropdown.Item>
                                            <Dropdown.Item href="#/action-2">내려가는</Dropdown.Item>
                                            <Dropdown.Item href="#/action-4">유지하는</Dropdown.Item>
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
