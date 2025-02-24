import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import buttonbackground from '../img/햅틱해제@3x.png'
const HapticComponent = ({ beatamp }) => {
    const [amp, setAmp] = useState(50);
    const [hapticDevices, setHapticDevices] = useState([]);
    const [isVibrating, setIsVibrating] = useState(false);
    let timer;
    let isGattOperationInProgress = false;

    useEffect(() => {
        const playHaptic = async () => {
            if (!isGattOperationInProgress) {
                await handleHapticPlay(beatamp * 500);
                // console.log(beatamp);
            }
        };
        playHaptic();
    }, [beatamp]);

    const handleAmpChange = (event) => {
        setAmp(Number(event.target.value));
    };

    const sendHapticData = async (frequency, amplitude) => {
        if (isGattOperationInProgress) {
            console.log('GATT 작업이 이미 진행 중입니다. 잠시 후 다시 시도하십시오.');
            return;
        }

        if (hapticDevices.length === 0) {
            console.log('연결된 햅틱 장치가 없습니다.');
            return;
        }

        isGattOperationInProgress = true;
        let dataBuffer = new ArrayBuffer(19);
        let view = new Int8Array(dataBuffer);
        view[0] = 36; // STX 0x24
        view[1] = 2; // TYPE 0x02

        const twobyteIntToOnebyte = (origin) => {
            let high = ((origin >> 8) & 0xff);
            let low = origin & 0xff;
            return [high, low];
        };

        let tmp = twobyteIntToOnebyte(frequency);
        view[2] = tmp[0];
        view[3] = tmp[1];
        tmp = twobyteIntToOnebyte(amplitude);
        view[4] = tmp[0];
        view[5] = tmp[1];

        view[17] = 13; // ETX 0x0D
        view[18] = 10; // ETX 0x0A

        try {
            for (const device of hapticDevices) {
                await device.write(dataBuffer);
            }
        } catch (error) {
            console.error('Haptic 데이터를 보내는 중 오류 발생:', error);
        } finally {
            isGattOperationInProgress = false;
        }
    };

    const handleHapticPlay = async (frequency) => {
        if (isVibrating) {
            clearTimeout(timer);
        }

        await sendHapticData(frequency, amp * 2);
        setIsVibrating(true);

        timer = setTimeout(async () => {
            await sendHapticData(0, 0);
            setIsVibrating(false);
        }, 200); //여기 적정값을 찾아야함....뭘까?
    };

    const requestHapticDevice = async () => {
        try {
            const options = {
                filters: [{ namePrefix: "Haptic" }],
                optionalServices: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"],
                acceptAllDevices: false
            };
            const device = await navigator.bluetooth.requestDevice(options);
            const server = await device.gatt.connect();
            const service = await server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
            const characteristic = await service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");

            const newDevice = {
                device,
                write: async (data) => {
                    await characteristic.writeValue(data);
                },
                disconnect: () => {
                    device.gatt.disconnect();
                }
            };

            setHapticDevices(prevDevices => [...prevDevices, newDevice]);
            console.log('> Name: ' + device.name);
            console.log('> Id: ' + device.id);
            console.log('> Connected: ' + device.gatt.connected);
        } catch (error) {
            console.error('Bluetooth 장치 요청 중 오류 발생:', error);
        }
    };

    const disconnectHapticDevice = (id) => {
        const deviceIndex = hapticDevices.findIndex(device => device.device.id === id);
        if (deviceIndex !== -1) {
            hapticDevices[deviceIndex].disconnect();
            setHapticDevices(hapticDevices.filter((_, index) => index !== deviceIndex));
            console.log("Device successfully disconnected");
        }
    };

    return (
        <div>
            {/* <h4>진동세기</h4>
            <input
                className="range"
                id="hapticIntensity"
                type="range"
                value={amp}
                min="0"
                max="50"
                onChange={handleAmpChange}
            /> */}
            {/* <button onClick={() => handleHapticPlay(150)}>Play1</button>
            <button onClick={() => handleHapticPlay(195)}>Play2</button>
            <button onClick={() => handleHapticPlay(254)}>Play3</button>
            <button onClick={() => handleHapticPlay(330)}>Play4</button> */}
            {/* <Button onClick={requestHapticDevice} style={{
                backgroundColor: 'white', color: 'black', border: 'none', backgroundImage: 'url(' + buttonbackground
                    + ')', backgroundSize: '100%',
                backgroundRepeat: 'no-repeat'
            }}>Haptic Connect</Button>{' '}

            <Button onClick={() => disconnectHapticDevice(hapticDevices[0]?.device.id)} style={{
                backgroundColor: 'white', color: 'black', border: 'none', backgroundImage: 'url(' + buttonbackground
                    + ')', backgroundSize: '100%',
                backgroundRepeat: 'no-repeat'
            }}>Haptic Unconnect</Button>{' '} */}

            {/* <button onClick={requestHapticDevice}>햅틱기기 연결</button>
            <button onClick={() => disconnectHapticDevice(hapticDevices[0]?.device.id)}>햅틱 해제</button> */}
        </div>
    );
};

export default HapticComponent;
