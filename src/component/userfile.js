import React, { Component } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

class Userfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            buttonText: 'start',
            time: 0,
            isActive: false,
            participant: '',
        };
        this.interval = null;
    }

    handleButtonClick = () => {
        this.setState(prevState => {
            if (prevState.buttonText === 'start') {
                return { buttonText: 'end', isActive: true };
            } else {
                return { buttonText: 'start', isActive: false };
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
                    Creation: this.props.createnum,
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
        this.setState({ [name]: event.target.value })
        console.log(this.state.participant)
        this.props.setUser(event.target.value)
    };
    render() {
        const { buttonText, time } = this.state;

        return (
            <div>
                <DropdownButton id="dropdown-basic-button" title="실험자">
                    {Array.from({ length: 9 }, (_, index) => (
                        <Dropdown.Item key={index} onClick={() => this.handleChange({ target: { value: `p${index + 1}` } }, 'participant')}>
                            p{index + 1}
                        </Dropdown.Item>
                    ))}
                </DropdownButton>
                <button onClick={this.handleButtonClick}>{buttonText}</button>
            </div>
        );
    }
}

export default Userfile;
