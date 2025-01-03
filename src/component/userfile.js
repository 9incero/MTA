import React, { Component } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from 'react-bootstrap/Button';
import buttonbackground from '../img/Start@3x.png'


class Userfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            buttonText: 'Start',
            time: 0,
            isActive: false,
            participant: 'Participant',

        };
        this.interval = null;
    }

    handleButtonClick = () => {
        this.setState(prevState => {
            if (prevState.buttonText === 'Start') {
                return { buttonText: 'End', isActive: true };
            } else {
                return { buttonText: 'Start', isActive: false };
            }
        });
    };

    componentDidMount() {
        if (this.state.isActive) {
            this.startTimer();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.isActive !== this.state.isActive) {
            if (this.state.isActive) {
                this.startTimer();
            } else {
                this.stopTimer();
                // 여기에서 final json file 만들면됨
                console.log("Final Time:", this.state.time);

                const endJson = {
                    User: this.props.user,
                    Time: this.state.time,
                    Creation: this.props.cnum,
                    Edit: this.props.editnum,
                    Result: this.props.totaldata
                }


                // 서버에서 받은 데이터를 JSON 문자열로 변환
                const jsonData = JSON.stringify(endJson);

                // JSON 데이터를 Blob으로 변환
                const blob = new Blob([jsonData], { type: 'application/json' });

                // Blob을 가리키는 임시 URL 생성
                const url = window.URL.createObjectURL(blob);

                // 다운로드 링크 생성
                const link = document.createElement('a');
                link.href = url;
                link.download = this.props.user + 'endlog.json'; // 원하는 파일 이름 설정
                link.click();

                // URL과 링크 정리
                window.URL.revokeObjectURL(url);

            }
        }
    }

    componentWillUnmount() {
        this.stopTimer();
    }

    startTimer() {
        this.interval = setInterval(() => {
            this.setState(prevState => ({
                time: prevState.time + 1
            }));
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.interval);
    }
    handleChange = (event, name) => {
        const newValue = event.target.value;

        this.setState({ [name]: newValue }, () => {
            console.log(this.state.participant); // 상태가 업데이트된 후 출력
            this.props.setUser(newValue); // 상태가 업데이트된 값을 사용
        });
    };

    render() {
        const { buttonText, time } = this.state;
        const names = ['P1', 'P2', 'P3', 'P4'];

        return (
            <div style={{ display: 'flex' }}>
                <DropdownButton id="dropdown-basic-button" title={this.state.participant} style={{ backgroundColor: 'white' }}>
                    {names.map((name, index) => (
                        <Dropdown.Item
                            key={index}
                            onClick={() => this.handleChange({ target: { value: name } }, 'participant')}
                        >
                            {name}
                        </Dropdown.Item>
                    ))}
                </DropdownButton>
                <Button onClick={this.handleButtonClick} style={{
                    marginLeft: 5, backgroundColor: 'white', color: 'black', border: 'none', backgroundImage: 'url(' + buttonbackground
                        + ')', backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat'
                }}>{buttonText}</Button>{' '}

            </div>
        );
    }
}

export default Userfile;
