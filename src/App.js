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
import { Container, Row, Col } from 'react-bootstrap';
// import { scale } from './component/timeline/mock';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
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
      <Container fluid>
        <Row>
          <Col md={3} style={{
            backgroundColor: 'lightblue', height: '100vh', margin: 0, padding: 0
          }}>
            {/* 왼쪽 큰 컬럼 */}
            <iframe src={path.gradio_path} width='100%' height='100%' style={{ overflowX: 'scroll', overflowY: 'scroll' }}></iframe>

          </Col>
          <Col md={6} style={{ padding: '20px' }}>
            <Row style={{ height: '70%' }}>
              <Col>
                <div>
                  <div>
                    선택악기:
                    {instrumenticon.map((iconId) => (
                      <span key={iconId} style={{ margin: '0 5px' }}>
                        {icons.find((icon) => icon.id === iconId).component}
                      </span>
                    ))}
                  </div>
                  <span>pitch 변경사항: {control.pitch_value}</span>

                </div>
                <Vislyrics totaldata={totaldata} setPitchtime={setPitchtime} pitchtime={pitchtime} pitch={pitch} setPitch={setPitch} opacity={opacity} setOpacity={setOpacity} control={control} words={words} setWords={setWords} left={left} setLeft={setLeft} playtime={playtime} setPlaytime={setPlaytime} />
                <MusicVisual beatlist={beatlist} setBeatlist={setBeatlist} phase={phase} setPhase={setPhase} midibeat={midibeat} setBeatamp={setBeatamp} totaldata={totaldata} control={control} setOpacity={setOpacity} opacity={opacity} playtime={playtime} pitches={pitch} times={pitchtime}></MusicVisual>

              </Col>
            </Row>
            <Row style={{ height: '30%' }}>
              <Col style={{ padding: 0, margin: 0 }}>
                {/* 중앙 아래쪽 작은 컬럼 */}
                <TimelineEditor duration={duration} mockdata={mockdata} setMockdata={setMockdata} totaldata={totaldata} control={control} timedata={timedata} setAudiourl={setAudiourl} audiourl={audiourl} setLeft={setLeft} setPlaytime={setPlaytime}></TimelineEditor>
                <MidiBeatMaker midibeat={midibeat} playtime={playtime} totaldata={totaldata} setMidibeat={setMidibeat}></MidiBeatMaker>
              </Col>
            </Row>
          </Col>
          <Col md={2} style={{ height: '100vh', margin: 0, padding: 0 }}>
            {/* 오른쪽 큰 컬럼 */}
            <Userfile totaldata={totaldata} editnum={editnum} setCnum={setCnum} cnum={cnum} user={user} setUser={setUser}></Userfile>

            <Control setPrompt={setPrompt} setInstrumenticon={setInstrumenticon} instrumenticon={instrumenticon} user={user} editnum={editnum} setEditnum={setEditnum} setCnum={setCnum} cnum={cnum} setChangedata={setChangedata} beatlist={beatlist} setPitchlist={setPitchlist} pitchlist={pitchlist} phase={phase} emotionlist={emotionlist} setEmotionlist={setEmotionlist} playtime={playtime} setDuration={setDuration} mockdata={mockdata} setMockdata={setMockdata} totaldata={totaldata} setTotaldata={setTotaldata} setControl={setControl} setTimedata={setTimedata} setAudiourl={setAudiourl} control={control}></Control>
            <PromptDisplay prompt={prompt} setPrompt={setPrompt} totaldata={totaldata} changedata={changedata}></PromptDisplay>
            <HapticComponent beatamp={beatamp} />

          </Col>
        </Row>

      </Container>

      {/* <div style={{ position: 'relative' }}>
        <iframe src="http://172.17.26.136:8080/" width={1000} height={1000} style={{ position: 'absolute', zIndex: 1 }}></iframe>
        <Vislyrics style={{ paddingTop: '100px' }} words={words} setWords={setWords} left={left} setLeft={setLeft} playtime={playtime} setPlaytime={setPlaytime} ></Vislyrics>
      </div>




      < div style={{ position: 'relative' }
      }>
        <section style={{ marginLeft: '-100px' }}>
          <Vislyrics words={words} setWords={setWords} left={left} setLeft={setLeft} playtime={playtime} setPlaytime={setPlaytime} ></Vislyrics>
          <TimelineEditor timedata={timedata} setAudiourl={setAudiourl} audiourl={audiourl} setLeft={setLeft} setPlaytime={setPlaytime}></TimelineEditor>

        </section>
        <aside>

          <div style={{ marginBottom: '10px' }}>
            <Fileloader setTimedata={setTimedata} setAudiourl={setAudiourl}></Fileloader>

          </div>
          <div style={{ padding: '100' }}>
            <Control setTimedata={setTimedata} setAudiourl={setAudiourl}></Control>

          </div>
        </aside>

      </div > */}

    </div>
  );
}


export default App;
