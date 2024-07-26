import './App.css';
import React, { useState } from 'react';
import Loader from './component/sample';
import Fileloader from './component/fileloader';
import Control from './component/control';
import Vislyrics from './component/visualdisplay';
import TimelineEditor from './component/timeline/main';
import styles from "./component/modulestyle/sample.module.css";
import 'bootstrap/dist/css/bootstrap.css';

function App() {
  const [left, setLeft] = useState(0);
  const [playtime, setPlaytime] = useState(0)
  const [audiourl, setAudiourl] = useState('')
  const [words, setWords] = useState([]);
  const [timedata, setTimedata] = useState([]);

  // const handleClick = () => {
  //   const newWord = { word: "몽구리", tendency: "animate_decreasing", targetWidth: 500 };
  //   setWords([...words, newWord]);
  //   console.log('정상적추가..')
  //   console.log(words)
  // };


  return (
    <div className="App">

      {/* <div style={{ overflow: "auto", whiteSpace: "nowrap" }}>

      <button onClick={handleClick}>Add Word</button>
      <div>
        <div id="target-div" className={styles.loader_container} >
          {words.map((wordObj, index) => (
            <Loader
              key={index}
              text={wordObj.word}
              tendency={wordObj.tendency}
              targetWidth={wordObj.targetWidth}
            />
          ))}
        </div>
      </div>

    </div>


    <Loader text="LOADING" tendency={tendency} targetWidth={10} />
    <Loader text="LOADING" tendency={tendency} targetWidth={10} />
    <button onClick={() => setTendency('animate_increasing')}>Animate Increasing</button>
    <button onClick={() => setTendency('animate_decreasing')}>Animate Decreasing</button>
    <button onClick={() => setTendency('animate_stable')}>Animate Stable</button> */}
      <section style={{ marginLeft: '-100px' }}>
        <Vislyrics words={words} setWords={setWords} left={left} setLeft={setLeft} playtime={playtime} setPlaytime={setPlaytime} ></Vislyrics>
        <TimelineEditor timedata={timedata} setAudiourl={setAudiourl} audiourl={audiourl} setLeft={setLeft} setPlaytime={setPlaytime}></TimelineEditor>

      </section>
      <aside>
        {/* <div style={{ marginBottom: '10px' }}>
        <Fileloader setTimedata={setTimedata} setAudiourl={setAudiourl}></Fileloader>

      </div> */}

        <Control setTimedata={setTimedata} setAudiourl={setAudiourl}></Control>
      </aside>

    </div >
  );
}


export default App;
