import lottie from 'lottie-web';

class LottieControl {
    cacheMap = {};

    _goToAndStop(item, time) {
        if (!item.getDuration()) return;
        const duration = item.getDuration() * 1000;
        time = time * 1000;
        if (time > duration) time = time % duration;
        item.goToAndStop(time);
    }

    enter(data) {
        const { id, src, startTime, time } = data;
        let item;
        if (this.cacheMap[id]) {
            item = this.cacheMap[id];
            item.show();
            this._goToAndStop(item, time);
        } else {
            const ground = document.getElementById('player-ground-1');
            item = lottie.loadAnimation({
                name: id,
                container: ground,
                renderer: 'svg',
                loop: true,
                autoplay: false,
                path: src,
                rendererSettings: {
                    className: 'lottie-ani',
                },
            });

            item.addEventListener('loaded_images', () => {
                this._goToAndStop(item, time - startTime);
            });
            this.cacheMap[id] = item;
        }
    }

    update(data) {
        const { id, startTime, endTime, time } = data;
        const item = this.cacheMap[id];
        if (!item) return;
        this._goToAndStop(item, time - startTime);
    }

    leave(data) {
        const { id, startTime, endTime, time } = data;
        const item = this.cacheMap[id];
        if (!item) return;
        if (time > endTime || time < startTime) {
            item.hide();
        } else {
            const cur = time - startTime;
            item.show();
            this._goToAndStop(item, cur);
        }
    }

    destroy() {
        lottie.destroy();
        this.cacheMap = {};
    }
}

export default new LottieControl();
