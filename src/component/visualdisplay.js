import { Component, React, createRef } from 'react';
import { Timeline, TimelineEngine } from '@xzdarcy/react-timeline-editor';
import { HexColorPicker } from "react-colorful";
import TimelineEditor from './timeline/main';
import TimelinePlayer from './timeline/player';
import { scaleWidth } from './timeline/mock';
import data from '../assets/result';
import regression from 'regression';
import Loader from './sample';



class Vislyrics extends Component {
  constructor(props) {
    super(props);
    this.engine = new TimelineEngine();
    this.divRef = createRef();
    this.musicData = data;
    this.tendency = '';
    this.prevPhase = 0;
    this.scrollLyricsRef = createRef();

    this.state = {
      data: data.Lyrics,
      currentIndex: 0, // 현재 표시할 텍스트의 인덱스
      words: [],

    };


  }

  componentDidMount() {
    console.log(this.state.data)


  };




  componentDidUpdate(prevProps) {

    if (prevProps.playtime !== this.props.playtime) {
      this.updateLyrics();
    }

  }


  componentWillUnmount() {
    clearTimeout(this.timer);

  }



  scrollToEnd = () => {
    if (this.scrollLyricsRef.current) {
      const { scrollWidth, clientWidth } = this.scrollLyricsRef.current;
      this.scrollLyricsRef.current.scrollLeft = scrollWidth - clientWidth;
    }
  }

  updateLyrics = () => {
    const { data } = this.state;
    const { playtime } = this.props;
    this.clearContent();


    data.forEach(item => {

      if (playtime >= item.start) {

        this.drawLyrics(item);

      }

    });

  };



  drawLyrics = ({ word, start, end, pitch, phase }) => {


    if (this.prevPhase !== phase) {
      this.prevPhase = phase

      this.clearContent()
    }

    //pitch 경향성 확인해 애니메이션 지정
    let pitch_tendency = []
    for (let i = 0; i < pitch.length; i++) {
      pitch_tendency.push([pitch[i].midi_note, pitch[i].start])

    }
    const result = regression.linear(pitch_tendency)

    if (result.equation[0] > 0) {
      this.tendency = 'animate_increasing';
    } else if (result.equation[0] < 0) {
      this.tendency = 'animate_decreasing';
    } else {
      this.tendency = 'animate_stable';
    }



    //x축 time으로 지정
    const scaleWidth = 100;
    const availableWidth = (end - start) * (scaleWidth);

    const newWord = { phase: phase, start: start, text: word, tendency: this.tendency, targetWidth: availableWidth };
    // console.log(newWord)

    this.setState((prevState) => {
      const wordExists = prevState.words.some(word => word.start === start);

      if (wordExists) {
        // console.log(prevState.words)
        // console.log('Word already exists:', newWord);
        return null; // 상태를 변경하지 않음
      }
      else {
        const updatedWords = [...prevState.words, newWord];

        // console.log('Updated words:', updatedWords);
        return { words: updatedWords };

      }
    }, () => {
      // 상태 업데이트 후에 실행되는 콜백
      console.log('Current state words:', this.state.words);
      this.scrollToEnd();

    });


    // const { words, setWords } = this.props;

    // // 기존에 같은 start 값을 가진 단어가 있는지 확인
    // const wordExists = words.some(w => w.start === start);

    // if (wordExists) {
    //   console.log('Word with the same start time already exists:', newWord);
    //   return; // 상태를 변경하지 않음
    // } else {
    //   console.log('Adding new word:', newWord);
    //   const updatedWords = [...words, newWord];
    //   console.log('Updated words:', updatedWords);

    //   // 부모 컴포넌트의 setWords 메서드를 호출하여 상태 업데이트 요청
    //   setWords(updatedWords);
    // }


  }

  clearContent = () => {
    this.setState({ words: [] });
  }




  render() {
    return (
      <div>
        <div style={{ position: 'absolute', zIndex: 2, top: 60, width: 800 }}>

          <div ref={this.scrollLyricsRef} style={{
            textAlign: 'left', overflow: "auto", scrollbarWidth: 'none', whiteSpace: "nowrap", width: '100%', height: 300
          }}>
            <div style={{ marginTop: 100, marginLeft: 40 }}>
              <div id="target-div" style={{ zIndex: 2 }}>
                {this.state.words.map((wordObj, index) => (
                  <Loader
                    key={index}
                    text={wordObj.text}
                    tendency={wordObj.tendency}
                    targetWidth={wordObj.targetWidth}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>

      </div >




    );
  }
}

export default Vislyrics;
