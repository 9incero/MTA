import React, { Component, createRef } from 'react';
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
    this.beatData = this.props.totaldata.Beat_amplitude;
    this.state = {
      data: this.props.totaldata.Lyrics,
      currentIndex: 0, // 현재 표시할 텍스트의 인덱스
      words: [],
      pitchData: this.props.totaldata.Pitch,
      pitches: [],
      times: [],
      lyricsphase: []
    };
  }

  groupByPhase = (lyrics) => {
    const phases = {};

    lyrics.forEach(entry => {
      const { phase, start, end, word } = entry;
      if (!phases[phase]) {
        phases[phase] = {
          start: start,
          end: end,
          lyrics: [word]
        };
      } else {
        phases[phase].start = Math.min(phases[phase].start, start);
        phases[phase].end = Math.max(phases[phase].end, end);
        phases[phase].lyrics.push(word);
      }
    });

    return Object.entries(phases).map(([phase, { start, end, lyrics }]) => ({
      phase: parseInt(phase),
      start,
      end,
      lyrics: lyrics.join(' ')
    }));
  };

  countCharacters = (lyrics) => {
    let charCount = 0;
    let spaceCount = 0;
    let wordCount = 0;

    lyrics.forEach(entry => {
      const { word } = entry;
      charCount += word.replace(/\s+/g, '').length; // 공백 제거 후 길이 계산
      spaceCount += (word.match(/\s/g) || []).length; // 공백 수 계산
      wordCount += word.split(/\s+/).length; // 단어 수 계산

    });

    return { charCount, spaceCount, wordCount };
  };

  componentDidMount() {
    this.setState({ lyricsphase: this.groupByPhase(this.state.data) });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.playtime !== this.props.playtime) {
      this.updateLyrics();
    }

    if (prevProps.totaldata !== this.props.totaldata) {
      this.setState({ lyricsphase: this.groupByPhase(this.props.totaldata.Lyrics) });
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
      this.prevPhase = phase;
      this.clearContent();
    }

    // pitch 경향성 확인해 애니메이션 지정
    let pitch_tendency = [];
    for (let i = 0; i < pitch.length; i++) {
      pitch_tendency.push([pitch[i].midi_note, pitch[i].start]);
    }
    const result = regression.linear(pitch_tendency);

    if (result.equation[0] > 0) {
      this.tendency = 'animate_increasing';
    } else if (result.equation[0] < 0) {
      this.tendency = 'animate_decreasing';
    } else {
      this.tendency = 'animate_stable';
    }

    const lyricsPhaseData = this.state.lyricsphase.find(p => p.phase === phase);
    const lyricslen = this.countCharacters([{ word: lyricsPhaseData.lyrics }]);

    // x축 time으로 지정
    const scaleWidth = 150;
    const availableWidth = (800 - (20 * lyricslen.charCount + 30 * lyricslen.spaceCount - 30)) / lyricslen.wordCount;

    const newWord = { phase: phase, start: start, text: word, tendency: this.tendency, targetWidth: availableWidth };
    this.setState((prevState) => {
      const wordExists = prevState.words.some(word => word.start === start);

      if (wordExists) {
        return null; // 상태를 변경하지 않음
      } else {
        const updatedWords = [...prevState.words, newWord];
        return { words: updatedWords };
      }
    }, () => {
      this.scrollToEnd();
    });
  }

  clearContent = () => {
    this.setState({ words: [] });
  }

  render() {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div ref={this.scrollLyricsRef} style={{
            textAlign: 'left', overflow: "auto", scrollbarWidth: 'none', whiteSpace: "nowrap", width: 800, height: 200
          }}>
            <div style={{ marginTop: 100 }}>
              <div id="target-div">
                {this.state.words.map((wordObj, index) => (
                  <Loader
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
        </div>
      </div>
    );
  }
}

export default Vislyrics;
