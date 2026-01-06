/**
 * 事件总线组合式函数
 */
import mitt from 'mitt'; // 事件机制库

const emitter = mitt();

export function useEventBus() {
    return emitter;
}