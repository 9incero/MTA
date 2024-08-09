import { Component, createRef } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import axios from "axios"
//여기에 사용자 마지막 생성한 파일
import test from '../assets/log/황진endlog.json'
import log from '../assets/log/황진log(7).json'
import env from '../assets/env.json'
import Modal from 'react-bootstrap/Modal';


class Fileloader extends Component {
  // 생성자 함수에서 변수를 정의
  constructor(props) {
    super(props);
    this.state = {
      someValue: '',
      textvalue: '',
      audioSrc: '',
      show: false,
      redo: false,
    };
    this.fileInput = createRef();
  }

  calculateAudioDuration = (audioUrl) => {
    const audio = new Audio(audioUrl);
    audio.onloadedmetadata = () => {
      this.props.setDuration(audio.duration);
      console.log(audio.duration)

    };
  };

  handleClick = () => {
    const { setAudiourl } = this.props;
    if (this.fileInput.current.files) {
      const file = this.fileInput.current.files[0];
      const url = URL.createObjectURL(file);
      setAudiourl(url)
      this.calculateAudioDuration(url)

    }

    if (this.state.redo === true) {
      this.redoButtonClick()
    }
    else {

      const fname = this.fileInput.current.files[0].name
      console.log('fname ', fname)
      //다른 노트북으로 실험시 여기 url 고치기
      const data = {
        url: env.data_path + fname,
        lyrics: this.state.textvalue
      };

      axios.post('http://127.0.0.1:5001/analysis', data)
        .then((response) => {
          console.log(response.data);
          this.props.setTotaldata({
            BPM: '',
            Beat_amplitude: [],
            Emotions: [],
            Instruments: [],
            Lyrics: [],
            Pitch: []
          }

          )

          this.props.setCnum(this.props.cnum + 1)
          this.props.setTotaldata({ ...response.data })
          console.log(this.props.totaldata)
          this.setState({ show: true })



        })
        .catch((error) => {
          console.log('Error!', error);
        });

    }



    // this.props.setTotaldata({ ...test });



  }
  fileinputclick = () => {
    this.fileInput.current.click();


  };
  handleTextChange = (event) => {
    this.setState({ textvalue: event.target.value });
  };

  componentDidUpdate(prevProps) {
    if (prevProps.totaldata !== this.props.totaldata) {
      console.log('>>', this.props.totaldata); // 상태가 업데이트된 후에 로그 출력
    }

    if (prevProps.emotionlist != this.props.emotionlist) {
      console.log('emotion', this.props.emotionlist)
    }

    if (prevProps.pitchlist != this.props.pitchlist) {
      console.log('pitch', this.props.pitchlist)
    }
  }

  handleButtonClick = () => {
    // console.log(test)
    console.log('lyrics', test.Lyrics)
    this.props.setCnum(this.props.cnum + 1)
    this.props.setEditnum(this.props.editnum + 2)
    this.props.setTotaldata({ ...test });
    console.log(this.props.editnum)
    this.props.setEmotionlist([])
    this.props.setPitchlist([])
    this.props.setPrompt('')
  };

  redoClick = () => {
    this.setState({ redo: true });

    this.fileInput.current.click();

  }

  redoButtonClick = () => {
    console.log(log.Beat)
    console.log(test.Lyrics)



    // this.props.setTotaldata({ ...test });
    this.props.setTotaldata(prevState => ({
      BPM: test.Result.BPM,
      Beat_amplitude: log.Beat,
      Emotions: test.Result.Emotions,
      Instruments: log.Instruments,
      Lyrics: test.Result.Lyrics,
      Pitch: test.Result.Pitch
    }));
    const emotionsArray = log.Emotions.map(emotion => [emotion.start, emotion.end, emotion.emotions]);
    const pitchArray = log.Pitch.map(pitch => [pitch.start, pitch.end, pitch.meta_tag]);

    this.props.setEmotionlist([...emotionsArray])
    this.props.setPitchlist([...pitchArray])
    this.setState({ redo: false });



  }


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
        {/* </Card> */}
        <Button style={{ width: '100%', marginTop: '10px', borderColor: 'black', color: 'black', backgroundColor: 'lightskyblue' }} onClick={this.fileinputclick}>음악 업로드</Button>{' '}
        <Button style={{ width: '100%', marginTop: '10px', borderColor: 'black', color: 'black', backgroundColor: 'lightskyblue' }} onClick={this.redoClick}>불러오기</Button>{' '}

        {/* <button onClick={this.handleButtonClick}>test</button> */}
        {/* <button onClick={this.redoButtonClick}>불러오기</button> */}

        <Modal show={this.state.show}>
          <Modal.Header closeButton>
            <Modal.Title>음악분석 완료!</Modal.Title>
          </Modal.Header>
          <Modal.Body>음악 저작을 시작하세요.</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { this.setState({ show: false }) }}>
              닫기
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default Fileloader;
