import React, { useRef, useEffect, useState } from 'react';
import styles from "./modulestyle/sample.module.css";
import regression from 'regression';

// const AudioPlayer = () => {
//   const data = [
//     [8.83, 61],
//     [9.77, 62],
//     [9.79, 64],
//     [9.80, 65],
//     [10.06, 64],
//     [10.12, 65],
//     [10.55, 66]
//   ];

//   const result = regression.linear(data);

// console.log(result.equation); // [기울기, 절편]
// console.log(result.string); // 추세를 나타내는 문자열

// const slope = result.equation[0];
// console.log("Slope:", slope);

// if (slope > 0) {
//   console.log("The trend is increasing.");
// } else if (slope < 0) {
//   console.log("The trend is decreasing.");
// } else {
//   console.log("The trend is stable.");
//   // }
//   return (
//     <div className={styles.loader_body}>
//       <div className={styles.loader}>
//         <span style={{ '--i': 1 }}>A</span>
//         <span style={{ '--i': 2 }}>n</span>
//         <span style={{ '--i': 3 }}>m</span>
//         <span style={{ '--i': 4 }}>a</span>
//         <span style={{ '--i': 5 }}>t</span>
//         <span style={{ '--i': 6 }}>i</span>
//         <span style={{ '--i': 7 }}>o</span>
//         <span style={{ '--i': 8 }}>n</span>
//         <span style={{ '--i': 9 }}>_</span>
//         <span style={{ '--i': 10 }}>p</span>
//         <span style={{ '--i': 11 }}>l</span>
//         <span style={{ '--i': 12 }}>a</span>
//         <span style={{ '--i': 13 }}>y</span>
//       </div>
//     </div>
//   );
// };


// const AudioPlayer = () => {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');

//     const text = 'Animation Play';
//     const textArray = text.split('');
//     const fontSize = 40;
//     const initialX = 50;
//     const initialY = 100;
//     const speed = 2;
//     const delay = 0.1; // 0.1s per character
//     const duration = 1; // 1s duration for each character
//     let frame = 0;

//     // 이징 함수
//     function easeInOutQuad(t) {
//       return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
//     }

//     const animateText = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

//       ctx.font = `${fontSize}px Consolas, monospace`;
//       ctx.textBaseline = 'middle';

//       textArray.forEach((char, i) => {
//         const x = initialX + i * (fontSize + 10);
//         const delayFrames = delay * 60 * i; // Convert delay to frames (assuming 60fps)
//         const totalFrames = duration * 60; // Convert duration to frames

//         let y = initialY;
//         if (frame >= delayFrames && frame <= delayFrames + totalFrames) {
//           const progress = (frame - delayFrames) / totalFrames;
//           const easedProgress = easeInOutQuad(progress);
//           y = initialY - 50 * easedProgress;
//         }

//         ctx.fillText(char, x, y);
//       });

//       frame++;
//       requestAnimationFrame(animateText);
//     };

//     animateText();
//   }, []);
//   return (
//     <div className="loader_body">
//       <canvas ref={canvasRef} width="800" height="200" className="loader_canvas"></canvas>
//     </div>
//   );
// };
// export default AudioPlayer;


const Loader = ({ text = '', tendency, targetWidth, control, opacity }) => {
  const textRef = useRef(null);
  const [fontFamily, setFontFamily] = useState(control.font_value);
  const [letterSpacing, setLetterSpacing] = useState(0);


  useEffect(() => {
    // control 객체가 변경될 때마다 실행됨
    setFontFamily(control.font_value);
  }, [control.font_value]); // 의존성 배열에 control 객체를 추가


  useEffect(() => {
    const adjustLetterSpacing = () => {
      // const element = textRef.current;
      // if (element) {
      //   const elementWidth = element.offsetWidth;
      //   const spaceAdjustment = (targetWidth - elementWidth) / (text.length - 1);
      //   setLetterSpacing(spaceAdjustment);
      // }
      const element = textRef.current;
      // if (element) {
      //   const charNodes = Array.from(element.childNodes);
      //   const charWidths = charNodes.map(node => node.offsetWidth);
      //   const totalCharWidth = charWidths.reduce((acc, width) => acc + width, 0);

      //   console.log('Total Char Width:', totalCharWidth);
      //   const spaceAdjustment = Math.floor((targetWidth - totalCharWidth) / (text.length - 1));
      //   console.log('Space Adjustment:', spaceAdjustment);

      //   setLetterSpacing(spaceAdjustment > 0 ? spaceAdjustment : 0);
      // }

      if (element) {
        const charNodes = Array.from(element.childNodes);
        const charWidths = charNodes.map(node => node.offsetWidth);
        const totalCharWidth = charWidths.reduce((acc, width) => acc + width, 0);

        // console.log('Total Char Width:', totalCharWidth);

        // 각 문자 사이의 최대 간격 계산
        let spaceAdjustment = Math.floor((targetWidth - totalCharWidth) / (text.length - 1));
        // console.log('Space Adjustment (initial):', spaceAdjustment);

        // spaceAdjustment가 음수인 경우, 텍스트 너비를 targetWidth로 조정할 수 없음
        // 이 경우 spaceAdjustment를 0으로 설정하여 너비 초과 방지
        if (spaceAdjustment < 0) {
          spaceAdjustment = 0;
        }

        setLetterSpacing(spaceAdjustment);
      }

    };

    adjustLetterSpacing();
    window.addEventListener('resize', adjustLetterSpacing);

    return () => {
      window.removeEventListener('resize', adjustLetterSpacing);
    };
  }, [text, targetWidth]);

  useEffect(() => {
    // CSS 변수 설정
    document.documentElement.style.setProperty('--animation', tendency);
  }, [tendency]);

  const getAnimationClass = () => {
    if (tendency === 'animate_increasing') return styles.animate_increasing;
    if (tendency === 'animate_decreasing') return styles.animate_decreasing;
    return styles.animate_stable;
  };


  function mapRange(value, inMin, inMax, outMin, outMax) {

    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  }

  return (
    // <div className={styles.loader_body}>
    <div
      className={`${styles.loader} ${getAnimationClass()}`}
      ref={textRef}
      style={{
        fontWeight: mapRange(control.volume_value, 0, 100, 100, 900),
        width: targetWidth,
        // whiteSpace: 'normal',
        marginLeft: '20px',
        fontFamily: fontFamily

      }}
    >

      {text.split('').map((char, index) => (
        <span
          key={index}
          style={{
            fontSize: '45px',
            fontWeight: 700,
            color: control.color_value,
            opacity: opacity, //이거 정규화해서 쓸지 말지 결정
            '--i': index + 1, letterSpacing: index === text.length - 1 ? '0px' : `${letterSpacing}px`
          }}
        >
          {char}
        </span>
      ))}


    </div>
    // </div>
  );
};

export default Loader;