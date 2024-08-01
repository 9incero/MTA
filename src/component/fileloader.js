import { Component, createRef } from 'react';
import musicfile from '../assets/result';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';


class Fileloader extends Component {
  // 생성자 함수에서 변수를 정의
  constructor(props) {
    super(props);
    this.state = {
      someValue: '',
      textvalue: '',
      audioSrc: ''
    };
    this.fileInput = createRef();
  }

  handleClick = () => {
    const { setAudiourl } = this.props;
    if (this.fileInput.current.files) {
      const file = this.fileInput.current.files[0];
      const url = URL.createObjectURL(file);
      setAudiourl(url)
    }


    //   여기에통신하는부분넣으면됨
    const data = {
      url: './assets/' + this.fileInput.current.files[0].name,
      lyrics: this.state.textvalue
    };
    // console.log(JSON.stringify(data))


    function parseLyrics(lyrics) {
      const sections = lyrics.split(/\n\n/); // 빈 줄로 섹션 구분
      return sections.map(section => {
        const lines = section.split('\n');
        const songform = lines.shift().replace(/[\[\]]/g, ''); // 첫 줄에서 섹션 이름 추출
        return {
          songform,
          lines
        };
      });
    }

    const parsedLyrics = parseLyrics(data.lyrics);
    const lyricsFile = musicfile.Lyrics

    // console.log(parsedLyrics)


    //   const mockData = lyricsFile.map((item) => ({
    //     id: item.toString(),
    //     actions: parsedLyrics.map((line) => ({
    //         id: `action${index}${lineIndex}`,
    //         start: lineIndex, // 예시로 설정
    //         end: lineIndex + 1, // 예시로 설정
    //         effectId: 'effect1', // 필요시 변경
    //         data: {
    //             name: line
    //         }
    //     }))
    // }));
    const phaseMap = new Map();

    // 데이터 그룹화
    lyricsFile.forEach((item, index) => {
      const { phase, start, end, word } = item;
      if (!phaseMap.has(phase)) {
        phaseMap.set(phase, []);
      }

      phaseMap.get(phase).push({ id: `action${index}`, start, end, word });
    });

    const existingIds = new Set();

    // const mockData = Array.from(phaseMap, ([phase, actions], index) => {

    //   console.log('---------------------')
    //   console.log(phaseMap)

    //   console.log(phase)
    //   console.log(actions)
    //   console.log('---------------------')

    //   const start = actions[0].start;
    //   const end = actions[actions.length - 1].end;

    //   console.log(start, end)
    //   return parsedLyrics.map((section, sectionIndex) => {
    //     const sectionId = section.songform;

    //     if (existingIds.has(sectionId)) {
    //       return null; // 이미 존재하는 sectionId이면 null 반환
    //     }

    //     existingIds.add(sectionId);

    //     const linesData = section.lines.map((line, lineIndex) => {
    //       const lineId = `line-${sectionIndex}-${lineIndex}`;

    //       if (existingIds.has(lineId)) {
    //         return null; // 이미 존재하는 lineId이면 null 반환
    //       }

    //       existingIds.add(lineId);

    //       return {
    //         id: lineId,
    //         start: start,
    //         end: end,
    //         effectId: 'effect1',
    //         data: { name: line }
    //       };
    //     }).filter(item => item !== null); // null 요소 제거

    //     return {
    //       id: sectionId,
    //       actions: linesData
    //     };
    //   }).filter(item => item !== null); // null 요소 제거
    // }).flat();







    const mockData = parsedLyrics.map((section, sectionIndex) => {
      const sectionId = section.songform;

      if (existingIds.has(sectionId)) {
        return null; // 이미 존재하는 sectionId이면 null 반환
      }

      existingIds.add(sectionId);

      const linesData = Array.from(phaseMap, ([phase, actions], index) => {
        // console.log('---------------------');
        // console.log(phaseMap);

        // console.log(phase);
        // console.log(actions);

        // console.log('---------------------');

        const start = actions[0].start;
        const end = actions[actions.length - 1].end;

        // console.log(start, end);

        return section.lines.map((line, lineIndex) => {
          const lineId = `line-${sectionIndex}-${lineIndex}`;

          if (existingIds.has(lineId)) {
            return null; // 이미 존재하는 lineId이면 null 반환
          }

          existingIds.add(lineId);

          return {
            id: lineId,
            start: start,
            end: end,
            effectId: 'effect1',
            data: { name: line }
          };
        }).filter(item => item !== null); // null 요소 제거
      }).flat();

      return {
        id: sectionId,
        actions: linesData
      };
    }).filter(item => item !== null); // null 요소 제거


    // parsedLyrics.map((section, sectionIndex) => {
    //   return {
    //     id: section.songform, // Section 이름을 id로 사용
    //     actions: section.lines.map((line, lineIndex) => ({
    //       id: `line-${sectionIndex}-${lineIndex}`,
    //       start: start, // 예시로 설정, 실제 데이터 필요
    //       end: end, // 예시로 설정, 실제 데이터 필요
    //       effectId: 'effect1', // 필요시 변경
    //       data: { name: line }
    //     }))
    //   };
    // });


    // const mockData = parsedLyrics.map((section, sectionIndex) => {
    //   // phaseMap에서 해당 section의 데이터를 가져옴
    //   const phaseActions = phaseMap.get(section.songform) || [];

    //   // phaseActions의 첫 번째 요소와 마지막 요소의 start와 end를 찾음
    //   const start = phaseActions.length > 0 ? phaseActions[0].start : 0;
    //   const end = phaseActions.length > 0 ? phaseActions[phaseActions.length - 1].end : 0;

    //   return {
    //     id: section.songform, // Section 이름을 id로 사용
    //     actions: section.lines.map((line, lineIndex) => ({
    //       id: `line-${sectionIndex}-${lineIndex}`, // 고유한 ID 생성
    //       start: start, // phaseMap에서 가져온 start 값
    //       end: end, // phaseMap에서 가져온 end 값
    //       effectId: 'effect1', // 필요한 경우 변경 가능
    //       data: { name: line } // parsedLyrics의 각 line 텍스트를 name으로 사용
    //     }))
    //   };
    // });
    // console.log('어ㅏㅇ너랒', mockData)
    this.props.setTimedata(mockData);

    //   axios.post( 'url', 
    //       // 본문으로 보낼 데이터
    //       JSON.stringify(data),

    //     {  // 
    //       headers: {
    //          'Content-type': 'application/json',
    //          'Accept': 'application/json'
    //       }
    //      }
    //     ) 
    //       .then((response) => {console.log(response.data); })
    //       .catch((response) => {console.log('Error!') });
    // };
  }
  fileinputclick = () => {
    this.fileInput.current.click();

  };
  handleTextChange = (event) => {
    this.setState({ textvalue: event.target.value });
  };
  render() {
    return (
      <div>
        {/* <Card style={{ width: '18rem', padding: '10px' }}> */}
        <Card.Title>[음악 정보 입력]</Card.Title>
        <Card.Text>
          Suno를 사용해 만든 가사를 붙여넣고<br />
          음악을 업로드 해주세요!
        </Card.Text>
        {/* <textarea name="content" onChange={this.handleTextChange}
            value={this.state.textvalue} cols="40" rows="8" placeholder='가사를 넣어주세요.' ></textarea> */}
        <Form.Control as="textarea" name="content" onChange={this.handleTextChange}
          value={this.state.textvalue} placeholder='가사를 넣어주세요.' rows={10} />
        <input type="file" ref={this.fileInput} onChange={this.handleClick} style={{ display: "none" }} />
        <Button style={{ width: '100%', marginTop: '10px', borderColor: 'black', color: 'black', backgroundColor: 'lightskyblue' }} onClick={this.fileinputclick}>음악 업로드</Button>{' '}
        {/* </Card> */}
      </div>
    );
  }
}

export default Fileloader;
