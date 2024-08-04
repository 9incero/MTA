
import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';


const MidiBeatMaker = ({ setMidibeat, playtime, midibeat }) => {
    const [midiAccess, setMidiAccess] = useState(null);
    const [beats, setBeats] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const playtimeRef = useRef(playtime); // playtime을 Ref로 관리

    useEffect(() => {
        playtimeRef.current = playtime; // playtime이 변경될 때마다 Ref 업데이트

    }, [playtime]);

    useEffect(() => {
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
        } else {
            console.log("No MIDI support in your browser.");
        }
    }, []);

    useEffect(() => {
        console.log('updata midibeat', midibeat)
    }, [midibeat]);


    // useEffect(() => {
    //     console.log('updata playtijme', playtime)
    // }, [playtime]);

    useEffect(() => {
        if (midiAccess) {
            const inputs = midiAccess.inputs.values();
            for (let input of inputs) {
                input.onmidimessage = (message) => onMIDIMessage(message);
            }
        }
    }, [midiAccess]);

    const onMIDISuccess = (midiAccess) => {
        setMidiAccess(midiAccess);
        const inputs = midiAccess.inputs;
        inputs.forEach((input) => {
            input.onmidimessage = onMIDIMessage;
        });
    };

    const onMIDIFailure = () => {
        console.log("Failed to get MIDI access.");
    };

    const onMIDIMessage = (message) => {
        const [command, note, velocity] = message.data;
        if (command === 153) {

            setBeats((prevBeats) => [...prevBeats, { note, velocity, time: Date.now() }]);


            setMidibeat({ times: playtimeRef.current, amplitude: note })
        }

    };

    const playBeats = () => {
        if (beats.length === 0) return;

        setIsPlaying(true);
        let startTime = Date.now();
        let beatIndex = 0;

        const interval = setInterval(() => {
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;

            while (beatIndex < beats.length && elapsedTime >= beats[beatIndex].time - beats[0].time) {
                const beat = beats[beatIndex];
                playDrum(beat.note, beat.velocity);
                beatIndex++;
            }

            if (beatIndex >= beats.length) {
                clearInterval(interval);
                setIsPlaying(false);
            }
        }, 10);
    };

    const playDrum = (note, velocity) => {
        let drumSynth;
        switch (note) {
            case 36: // MIDI note for bass drum
                drumSynth = new Tone.MembraneSynth().toDestination();
                drumSynth.triggerAttackRelease("C1", "8n", Tone.now(), velocity / 127);
                break;
            case 38: // MIDI note for snare drum
                drumSynth = new Tone.MembraneSynth().toDestination();
                drumSynth.triggerAttackRelease("D1", "8n", Tone.now(), velocity / 127);
                break;
            case 42: // MIDI note for closed hi-hat
                drumSynth = new Tone.MetalSynth().toDestination();
                drumSynth.triggerAttackRelease("G1", "8n", Tone.now(), velocity / 127);
                break;
            // Add more cases for other drums
            default:
                drumSynth = new Tone.MembraneSynth().toDestination();
                drumSynth.triggerAttackRelease("C1", "8n", Tone.now(), velocity / 127);
                break;
        }
    };

    return (
        <div>
            <h1>MIDI Beat Maker</h1>
            <p>Connect a MIDI device and press some keys to record beats.</p>
            <button onClick={playBeats} disabled={isPlaying}>Play Beats</button>
            <div>
                {beats.map((beat, index) => (
                    <div key={index}>
                        Note: {beat.note}, Velocity: {beat.velocity}, Time: {beat.time}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MidiBeatMaker;


