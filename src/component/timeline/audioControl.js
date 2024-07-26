import { Howl } from 'howler';
import { TimelineEngine } from '@xzdarcy/react-timeline-editor';

class AudioControl {
    constructor() {
        this.cacheMap = {};
        this.listenerMap = {};
    }

    start(data) {
        const { id, src, startTime, time, engine } = data;
        let item;
        if (this.cacheMap[id]) {
            item = this.cacheMap[id];
            item.seek((time - startTime) % item.duration());
            item.play();
        } else {
            item = new Howl({ src, loop: true, autoplay: true });
            this.cacheMap[id] = item;
            item.on('load', () => {
                item.seek((time - startTime) % item.duration());
            });
        }

        const timeListener = (data) => {
            const { time } = data;
            item.seek(time);
        };

        if (!this.listenerMap[id]) this.listenerMap[id] = {};
        engine.on('afterSetTime', timeListener);
        this.listenerMap[id].time = timeListener;
    }

    stop(data) {
        const { id, engine } = data;
        if (this.cacheMap[id]) {
            const item = this.cacheMap[id];
            item.stop();
            if (this.listenerMap[id]) {
                this.listenerMap[id].time && engine.off('afterSetTime', this.listenerMap[id].time);
                delete this.listenerMap[id];
            }
        }
    }
}

export default new AudioControl();