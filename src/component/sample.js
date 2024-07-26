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


const Loader = ({ text = '', tendency, targetWidth }) => {
  const textRef = useRef(null);
  const [letterSpacing, setLetterSpacing] = useState(0);

  useEffect(() => {
    const adjustLetterSpacing = () => {
      // const element = textRef.current;
      // if (element) {
      //   const elementWidth = element.offsetWidth;
      //   const spaceAdjustment = (targetWidth - elementWidth) / (text.length - 1);
      //   setLetterSpacing(spaceAdjustment);
      // }
      const element = textRef.current;
      if (element) {
        const charNodes = Array.from(element.childNodes);
        const charWidths = charNodes.map(node => node.offsetWidth);
        const totalCharWidth = charWidths.reduce((acc, width) => acc + width, 0);

        console.log('Total Char Width:', totalCharWidth);
        const spaceAdjustment = Math.floor((targetWidth - totalCharWidth) / (text.length - 1));
        console.log('Space Adjustment:', spaceAdjustment);

        setLetterSpacing(spaceAdjustment > 0 ? spaceAdjustment : 0);
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
    console.log(tendency)
  }, [tendency]);

  const getAnimationClass = () => {
    if (tendency === 'animate_increasing') return styles.animate_increasing;
    if (tendency === 'animate_decreasing') return styles.animate_decreasing;
    return styles.animate_stable;
  };



  return (
    // <div className={styles.loader_body}>
    <div
      className={`${styles.loader} ${getAnimationClass()}`}
      ref={textRef}
      style={{

        width: targetWidth,
        // whiteSpace: 'normal',
        marginLeft: '30px',
        fontFamily: 'YourPreferredFont, sans-serif'
      }}
    >

      {text.split('').map((char, index) => (
        <span
          key={index}
          style={{
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