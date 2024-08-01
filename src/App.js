import './App.css';
import './component/modulestyle/font.css'
import React, { useState } from 'react';
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
  const [filename, setFilename] = useState('')
  const [totaldata, setTotaldata] = useState({
    BPM: '',
    Beat_amplitude: [],
    Emotions: [],
    Instruments: [],
    Lyrics: [],
    Pitch: []
  });
  const [mockdata, setMockdata] = useState([])

  // const handleClick = () => {
  //   const newWord = { word: "몽구리", tendency: "animate_decreasing", targetWidth: 500 };
  //   setWords([...words, newWord]);
  //   console.log('정상적추가..')
  //   console.log(words)
  // };
  const handleChange = (val) => setMode(val);


  return (
    <div className="App">
      <Container fluid>
        <Row>
          <Col md={3} style={{
            backgroundColor: 'lightblue', height: '100vh', margin: 0, padding: 0
          }}>
            {/* 왼쪽 큰 컬럼 */}
            <iframe src="https://c2eec77c60f6bc61c6.gradio.live" width='100%' height='100%' ></iframe>

          </Col>
          <Col md={6} style={{ padding: '20px' }}>
            <Row style={{ height: '70%' }}>
              <Col>
                {/* 중앙 위쪽 큰 컬럼 */}

                <ToggleButtonGroup type="checkbox" value={mode} onChange={handleChange}>
                  <ToggleButton id="tbg-btn-1" value={1}>
                    음악
                  </ToggleButton>
                  <ToggleButton id="tbg-btn-2" value={2}>
                    가사
                  </ToggleButton>

                </ToggleButtonGroup>
                {/* <p>visual</p> */}

                <MusicVisual totaldata={totaldata} control={control} setOpacity={setOpacity} opacity={opacity} playtime={playtime} pitches={pitch} times={pitchtime}></MusicVisual>
                <Vislyrics totaldata={totaldata} setPitchtime={setPitchtime} pitchtime={pitchtime} pitch={pitch} setPitch={setPitch} opacity={opacity} setOpacity={setOpacity} control={control} words={words} setWords={setWords} left={left} setLeft={setLeft} playtime={playtime} setPlaytime={setPlaytime} />


                {/* <MusicVisual opacity={opacity} playtime={playtime} pitches={pitch} times={pitchtime}></MusicVisual> */}
                {/* <iframe src="http://172.17.26.136:8080/build" width='100%' height='100%' style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, transform: 'scale(1)' }}></iframe> */}
                {/* <Vislyrics style={{ position: 'absolute', top: 300, zIndex: 2 }} setPitchtime={setPitchtime} pitchtime={pitchtime} pitch={pitch} setPitch={setPitch} opacity={opacity} setOpacity={setOpacity} control={control} words={words} setWords={setWords} left={left} setLeft={setLeft} playtime={playtime} setPlaytime={setPlaytime} /> */}
                {/* <Vislyrics setPitchtime={setPitchtime} pitchtime={pitchtime} pitch={pitch} setPitch={setPitch} opacity={opacity} setOpacity={setOpacity} control={control} words={words} setWords={setWords} left={left} setLeft={setLeft} playtime={playtime} setPlaytime={setPlaytime} /> */}

                {/* <iframe src="http://172.17.26.136:8080/" width={1000} height={1000} style={{ position: 'absolute', zIndex: 1 }}></iframe>
                <Vislyrics style={{ paddingTop: '100px' }} words={words} setWords={setWords} left={left} setLeft={setLeft} playtime={playtime} setPlaytime={setPlaytime} ></Vislyrics> */}

              </Col>
            </Row>
            <Row style={{ height: '30%' }}>
              <Col style={{ padding: 0, margin: 0 }}>
                {/* 중앙 아래쪽 작은 컬럼 */}
                <TimelineEditor mockdata={mockdata} setMockdata={setMockdata} totaldata={totaldata} control={control} timedata={timedata} setAudiourl={setAudiourl} audiourl={audiourl} setLeft={setLeft} setPlaytime={setPlaytime}></TimelineEditor>

              </Col>
            </Row>
          </Col>
          <Col md={3} style={{ height: '100vh', margin: 0, padding: 0 }}>
            {/* 오른쪽 큰 컬럼 */}
            <Control mockdata={mockdata} setMockdata={setMockdata} totaldata={totaldata} setTotaldata={setTotaldata} setControl={setControl} setTimedata={setTimedata} setAudiourl={setAudiourl} control={control}></Control>

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
