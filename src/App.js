import './App.css';
import './component/modulestyle/font.css'
import React, { useState, useEffect } from 'react';
import Loader from './component/sample';
import Fileloader from './component/fileloader';
import Control from './component/control';
import Vislyrics from './component/lyricsdisplay';
import TimelineEditor from './component/timeline/main';
import MusicVisual from './component/musicdisplay';
import 'bootstrap/dist/css/bootstrap.css';
import { Container, Row, Col, CardBody } from 'react-bootstrap';
// import { scale } from './component/timeline/mock';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import Card from 'react-bootstrap/Card';
import MidiBeatMaker from './component/beatdisplay';
import HapticComponent from './component/hapticplay';
import PromptDisplay from './component/propmtdisplay';
import Userfile from './component/userfile';
import path from './assets/env.json'
import { GiGuitar, GiGrandPiano, GiViolin, GiHarp, GiDrum, GiFlute, GiSaxophone } from "react-icons/gi";
import { PiGuitar, PiBellFill } from "react-icons/pi";

function App() {
  const [left, setLeft] = useState(0);
  const [playtime, setPlaytime] = useState(0)
  const [audiourl, setAudiourl] = useState('')
  const [words, setWords] = useState([]);
  const [timedata, setTimedata] = useState([]);
  const [control, setControl] = useState([]);
  const [opacity, setOpacity] = useState(0);
  const [pitch, setPitch] = useState([]);
  const [pitchtime, setPitchtime] = useState([]);
  const [mode, setMode] = useState([1, 2]);
  const [totaldata, setTotaldata] = useState({
    BPM: '',
    Beat_amplitude: [],
    Emotions: [],
    Instruments: [],
    Lyrics: [],
    Pitch: []
  });
  const [mockdata, setMockdata] = useState([])
  const [beatamp, setBeatamp] = useState([])
  const [midibeat, setMidibeat] = useState([])
  const [duration, setDuration] = useState(0);
  const [phase, setPhase] = useState([])
  const [emotionlist, setEmotionlist] = useState([])
  const [pitchlist, setPitchlist] = useState([])
  const [beatlist, setBeatlist] = useState([])
  const [changedata, setChangedata] = useState([])
  const [instrumenticon, setInstrumenticon] = useState([])
  const [prompt, setPrompt] = useState('');
  const [currentemotion, setCurrentemotion] = useState('')

  const [user, setUser] = useState('')
  const [editnum, setEditnum] = useState(0)
  const [cnum, setCnum] = useState(0)

  const icons = [
    { id: 'acousticGuitar', component: <PiGuitar /> },
    { id: 'bassGuitar', component: <GiGuitar /> },
    { id: 'piano', component: <GiGrandPiano /> },
    { id: 'violin', component: <GiViolin /> },
    { id: 'harp', component: <GiHarp /> },
    { id: 'drumKit', component: <GiDrum /> },
    { id: 'flute', component: <GiFlute /> },
    { id: 'sax', component: <GiSaxophone /> },
    { id: 'bells', component: <PiBellFill /> },
  ];


  const handleChange = (val) => setMode(val);

  useEffect(() => {
    const filteredIconIds = icons
      .filter(icon => totaldata.Instruments.includes(icon.id))
      .map(icon => icon.id);
    setInstrumenticon(filteredIconIds)
  }, [totaldata]);



  return (
    <div className="App">
      <Container fluid className="p-0">
        <Row>
          <Col md={3} style={{
            backgroundColor: 'lightblue', height: '100vh', margin: 0, padding: 0
          }}>
            {/* 왼쪽 큰 컬럼 */}
            <iframe src={path.gradio_path} width='100%' height='100%' style={{ overflowX: 'scroll', overflowY: 'scroll' }}></iframe>

          </Col>

          <Col md={6} style={{ marginBottom: '20px' }}>

            <Row style={{ height: '65vh', backgroundColor: '#e8e8e8' }}>
              <Col>
                <Card style={{ display: 'flex' }}>
                  <CardBody style={{ padding: 0, margin: 0 }}>
                    <span style={{ fontSize: '30px', marginRight: 150 }}>음정 변경: {control.pitch_value}</span>

                    <span style={{ fontSize: '30px' }}>
                      선택 악기:
                      {instrumenticon.map((iconId) => (
                        <span key={iconId} style={{ margin: '0 5px', fontSize: '30px' }}>
                          {icons.find((icon) => icon.id === iconId).component}
                        </span>
                      ))}
                    </span>
                  </CardBody>

                </Card>

                <Vislyrics totaldata={totaldata} setPitchtime={setPitchtime} pitchtime={pitchtime} pitch={pitch} setPitch={setPitch} opacity={opacity} setOpacity={setOpacity} control={control} words={words} setWords={setWords} left={left} setLeft={setLeft} playtime={playtime} setPlaytime={setPlaytime} />
                <MusicVisual phase={phase} currentemotion={currentemotion} emotionlist={emotionlist} setEmotionlist={setEmotionlist} beatlist={beatlist} setBeatlist={setBeatlist} setPhase={setPhase} midibeat={midibeat} setBeatamp={setBeatamp} totaldata={totaldata} control={control} setOpacity={setOpacity} opacity={opacity} playtime={playtime} pitches={pitch} times={pitchtime}></MusicVisual>

              </Col>
            </Row>
            <Row style={{ height: '35vh' }}>
              <Col style={{ padding: 0, margin: 0 }}>
                {/* 중앙 아래쪽 작은 컬럼 */}
                <TimelineEditor duration={duration} mockdata={mockdata} setMockdata={setMockdata} totaldata={totaldata} control={control} timedata={timedata} setAudiourl={setAudiourl} audiourl={audiourl} setLeft={setLeft} setPlaytime={setPlaytime}></TimelineEditor>
                <MidiBeatMaker midibeat={midibeat} playtime={playtime} totaldata={totaldata} setMidibeat={setMidibeat}></MidiBeatMaker>
              </Col>
            </Row>
          </Col>

          <Col md={3} style={{ margin: 0, padding: 0, }}>
            {/* 오른쪽 큰 컬럼 */}
            <Row style={{ height: '5vh', margin: 0, padding: 0 }}>
              <Col md={6}>
                <Userfile totaldata={totaldata} editnum={editnum} setCnum={setCnum} cnum={cnum} user={user} setUser={setUser}></Userfile>
              </Col>
              <Col md={6}>
                <HapticComponent beatamp={beatamp} />
              </Col>


            </Row>
            <Row style={{ height: '60vh' }}>
              <Control currentemotion={currentemotion} setCurrentemotion={setCurrentemotion} setPlaytime={setPlaytime} setPrompt={setPrompt} setInstrumenticon={setInstrumenticon} instrumenticon={instrumenticon} user={user} editnum={editnum} setEditnum={setEditnum} setCnum={setCnum} cnum={cnum} setChangedata={setChangedata} beatlist={beatlist} setPitchlist={setPitchlist} pitchlist={pitchlist} phase={phase} emotionlist={emotionlist} setEmotionlist={setEmotionlist} playtime={playtime} setDuration={setDuration} mockdata={mockdata} setMockdata={setMockdata} totaldata={totaldata} setTotaldata={setTotaldata} setControl={setControl} setTimedata={setTimedata} setAudiourl={setAudiourl} control={control}></Control>

            </Row>
            <Row style={{ height: '35vh' }}>
              <PromptDisplay prompt={prompt} setPrompt={setPrompt} totaldata={totaldata} changedata={changedata}></PromptDisplay>

            </Row>

          </Col>
        </Row>

      </Container>

    </div>
  );
}


export default App;
