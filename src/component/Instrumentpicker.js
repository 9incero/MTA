import React, { useEffect, useState } from 'react';
import { GiGuitar, GiGrandPiano, GiViolin, GiHarp, GiDrum, GiFlute, GiSaxophone } from "react-icons/gi";
import { PiGuitar, PiBellFill } from "react-icons/pi";

const icons = [
    { id: 'acousticGuitar', component: <PiGuitar /> },
    { id: 'bassGuitar', component: <GiGuitar /> },
    { id: 'piano', component: <GiGrandPiano /> },
    { id: 'violin', component: <GiViolin /> },
    { id: 'harp', component: <GiHarp /> },
    { id: 'drumKit', component: <GiDrum /> },
    { id: 'flute', component: <GiFlute /> },
    { id: 'sax', component: <GiSaxophone /> },
    { id: 'bells', component: <PiBellFill /> },
    // 필요한 만큼 아이콘 추가
];

const InstrumentPicker = ({ setInstrumenticon, instrumenticon }) => {
    const [selectedIcons, setSelectedIcons] = useState([]);
    const [isPickerVisible, setPickerVisible] = useState(false);

    const handleIconClick = (iconId) => {
        setSelectedIcons((prevSelectedIcons) =>
            prevSelectedIcons.includes(iconId)
                ? prevSelectedIcons.filter((id) => id !== iconId)
                : [...prevSelectedIcons, iconId]
        );
    };

    useEffect(() => {

        const combinedIconIds = Array.from(new Set([...instrumenticon, ...selectedIcons]));

        setInstrumenticon(combinedIconIds);


        // console.log(selectedIcons)
        // setInstrumenticon(selectedIcons)
    }, [selectedIcons]);

    const handleButtonClick = () => {
        setPickerVisible(!isPickerVisible);
    };

    const containerStyle = {
        width: '200px',
        margin: '0 auto',
        textAlign: 'center',
    };

    const iconListStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: '10px',
    };

    const iconItemStyle = {
        margin: '5px',
        padding: '10px',
        cursor: 'pointer',
        border: '1px solid transparent',
        borderRadius: '5px',
        fontSize: '24px', // 아이콘 크기 조절

    };

    const selectedIconItemStyle = {
        ...iconItemStyle,
        borderColor: '#000',
        backgroundColor: '#f0f0f0',
    };

    const selectedIconStyle = {
        marginTop: '20px',
    };

    return (
        <div style={containerStyle}>
            <button onClick={handleButtonClick}>
                {isPickerVisible ? '닫기' : '악기 선택'}
            </button>
            {isPickerVisible && (
                <div style={iconListStyle}>
                    {icons.map((icon) => (
                        <div
                            key={icon.id}
                            style={selectedIcons.includes(icon.id) ? selectedIconItemStyle : iconItemStyle}
                            onClick={() => handleIconClick(icon.id)}
                        >
                            {icon.component}
                        </div>
                    ))}
                </div>
            )}
            {selectedIcons.length > 0 && (
                <div style={selectedIconStyle}>
                    선택악기:
                    {selectedIcons.map((iconId) => (
                        <span key={iconId} style={{ margin: '0 5px' }}>
                            {icons.find((icon) => icon.id === iconId).component}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InstrumentPicker;
