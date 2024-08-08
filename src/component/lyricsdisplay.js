import { Component, React, createRef } from 'react';
import { Timeline, TimelineEngine } from '@xzdarcy/react-timeline-editor';
import regression from 'regression';
import Loader from './sample';


class Vislyrics extends Component {
  constructor(props) {
    super(props);
    this.engine = new TimelineEngine();
    this.divRef = createRef();
    this.tendency = '';
    this.prevPhase = 0;
    this.scrollLyricsRef = createRef();
    this.beatData = this.props.totaldata.Beat_amplitude
    this.state = {
      data: this.props.totaldata.Lyrics,
      currentIndex: 0, // 현재 표시할 텍스트의 인덱스
      words: [],
      pitchData: this.props.totaldata.Pitch,
      pitches: [],
      times: [],

    };


  }

  componentDidMount() {



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


    const { data, pitchData } = this.state;
    const { playtime } = this.props;
    this.setState({ data: this.props.totaldata.Lyrics });

    this.clearContent();

    const processedPitches = new Set();
    data.forEach(item => {
      if (playtime >= item.start) {
        this.drawLyrics(item);

      }

    });


  };


  measureTextWidth = (text) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = '16px chilled'; // 사용 중인 글꼴과 동일한 글꼴 설정
    const metrics = context.measureText(text);
    return metrics.width;
  }



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
    const scaleWidth = 150;
    const availableWidth = 300; //여기....... 노트참고

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
      // console.log('Current state words:', this.state.words);
      this.scrollToEnd();

    });

  }

  clearContent = () => {
    this.setState({ words: [] });
  }




  render() {
    return (
      <div style={{
        display: 'flex', justifyContent: 'space-between'
      }
      }>
        {/* <div style={{ position: 'absolute', zIndex: 2, top: 60, width: 800 }}> */}
        <div>
          <div ref={this.scrollLyricsRef} style={{

            textAlign: 'left', overflow: "auto", scrollbarWidth: 'none', whiteSpace: "nowrap", width: 800, height: 200
          }}>
            <div style={{ marginTop: 100 }}>
              <div id="target-div" >
                {this.state.words.map((wordObj, index) => (
                  <Loader
                    // opacity={this.props.opacity}
                    control={this.props.control}
                    key={index}
                    text={wordObj.text}
                    tendency={wordObj.tendency}
                    targetWidth={wordObj.targetWidth}
                  />
                ))}
              </div>
            </div>

          </div>
        </div >

      </div >




    );
  }
}

export default Vislyrics;
