import { Component, createRef } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import axios from "axios"
//여기에 사용자 마지막 생성한 파일
// import test from '../assets/log/황진endlog.json'
// import log from '../assets/log/황진log(7).json'
import Modal from 'react-bootstrap/Modal';
import uploadbackground from '../img/btn_재생성etc@3x.png'
import reloadbackground from '../img/btn_test-불러오기@3x.png'
import lyricsbackground from '../img/field_가사입력@3x.png'
class Fileloader extends Component {
  // 생성자 함수에서 변수를 정의
  constructor(props) {
    super(props);
    this.state = {
      someValue: '',
      textvalue: '',
      filepath: '',
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
    this.props.setEmotionlist([])
    this.props.setPitchlist([])
    this.props.setPrompt('')

    if (this.state.redo === true) {
      this.redoButtonClick()
    }
    else {

      const fname = this.fileInput.current.files[0].name
      console.log('fname ', fname)
      //다른 노트북으로 실험시 여기 url 고치기
      const data = {
        url: this.state.filepath,
        lyrics: this.state.textvalue
      };

      axios.post('/analysis', data)
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

  handlePathChange = (event) => {
    this.setState({ filepath: event.target.value });
  }
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
  //불러오기
  // redoButtonClick = () => {
  //   console.log(log.Beat)
  //   console.log(test.Lyrics)



  //   // this.props.setTotaldata({ ...test });
  //   this.props.setTotaldata(prevState => ({
  //     BPM: test.Result.BPM,
  //     Beat_amplitude: log.Beat,
  //     Emotions: test.Result.Emotions,
  //     Instruments: log.Instruments,
  //     Lyrics: test.Result.Lyrics,
  //     Pitch: test.Result.Pitch
  //   }));
  //   const emotionsArray = log.Emotions.map(emotion => [emotion.start, emotion.end, emotion.emotions]);
  //   const pitchArray = log.Pitch.map(pitch => [pitch.start, pitch.end, pitch.meta_tag]);

  //   this.props.setEmotionlist([...emotionsArray])
  //   this.props.setPitchlist([...pitchArray])
  //   this.setState({ redo: false });



  // }


  render() {
    return (
      <div>
        {/* <Card style={{ width: '18rem', padding: '10px' }}> */}
        <Card.Title>[Music Information]</Card.Title>
        <Card.Text>
          Please paste the lyrics you made using Suno <br />
          and upload the music!
        </Card.Text>
        {/* <textarea name="content" onChange={this.handleTextChange}
            value={this.state.textvalue} cols="40" rows="8" placeholder='가사를 넣어주세요.' ></textarea> */}
        <Form.Control as="textarea" name="content" onChange={this.handleTextChange}
          value={this.state.textvalue} placeholder='Please input the lyrics.' rows={10} style={{
            backgroundImage: 'url(' + lyricsbackground
              + ')', backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat', border: 'none'
          }} />

        <Form.Control as="textarea" name="content" onChange={this.handlePathChange}
          value={this.state.filepath} placeholder='Please enter the path of the folder where you saved the music.' rows={3}
          style={{
            backgroundImage: 'url(' + lyricsbackground
              + ')', backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat', border: 'none', marginTop: '10px'
          }} />

        <input type="file" ref={this.fileInput} onChange={this.handleClick} style={{ display: "none" }} />
        {/* </Card> */}
        <Button style={{
          width: '100%', marginTop: '10px',
          backgroundColor: 'white', color: 'black', border: 'none', backgroundImage: 'url(' + uploadbackground
            + ')', backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat'
        }} onClick={this.fileinputclick}>Music Upload</Button>{' '}
        {/* <Button style={{
          width: '100%', marginTop: '10px', backgroundColor: 'white', color: 'black', border: 'none', backgroundImage: 'url(' + reloadbackground
            + ')', backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat'
        }} onClick={this.redoClick}>Load</Button>{' '} */}

        {/* <button onClick={this.handleButtonClick}>test</button>
        <button onClick={this.redoButtonClick}>불러오기</button> */}

        <Modal show={this.state.show}>
          <Modal.Header closeButton>
            <Modal.Title>Music analysis completed!</Modal.Title>
          </Modal.Header>
          <Modal.Body>Start writing music.</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { this.setState({ show: false }) }}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default Fileloader;
