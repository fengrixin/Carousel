export class Listener {
    constructor(element, recognize) {
        let contexts = new Map()
        let isListeningMouse = false

        element.addEventListener('mousedown', ev => {
            let context = Object.create(null)
            contexts.set('mouse' + (1 << ev.button), context)
            recognize.start(ev, context)
            let mousemove = ev => {
                let button = 1
                while (button <= ev.buttons) {
                    if (button & ev.buttons) {
                        let key
                        if (button === 2) {
                            key = 4
                        } else if (button === 4) {
                            key = 2
                        } else {
                            key = button
                        }
                        let context = contexts.get('mouse' + key)
                        recognize.move(ev, context)
                    }
                    button = button << 1
                }
            }
            let mouseup = ev => {
                let context = contexts.get('mouse' + (1 << ev.button))
                recognize.end(ev, context)
                contexts.delete('mouse' + (1 << ev.button))
                if (ev.buttons === 0) {
                    isListeningMouse = false
                    document.removeEventListener('mousemove', mousemove)
                    document.removeEventListener('mouseup', mouseup)
                }
            }
            if (!isListeningMouse) {
                isListeningMouse = true
                element.addEventListener('mousemove', mousemove)
                element.addEventListener('mouseup', mouseup)
            }
        })

        element.addEventListener('touchstart', ev => {
            for (let touch of ev.changedTouches) {
                let context = Object.create(null)
                contexts.set(touch.identifier, context)
                recognize.start(touch, context)
            }
        })
        element.addEventListener('touchmove', ev => {
            for (let touch of ev.changedTouches) {
                let context = contexts.get(touch.identifier)
                recognize.move(touch, context)
            }
        })
        element.addEventListener('touchend', ev => {
            for (let touch of ev.changedTouches) {
                let context = contexts.get(touch.identifier)
                recognize.end(touch, context)
                contexts.delete(touch.identifier)
            }
        })
        element.addEventListener('touchcancel', ev => {
            for (let touch of ev.changedTouches) {
                let context = contexts.get(touch.identifier)
                recognize.cancel(touch, context)
                contexts.delete(touch.identifier)
            }
        })
    }
}

export class Recognize {
    constructor(dispatcher) {
        this.dispatcher = dispatcher
    }

    start(point, context) {
        // console.log('start', point.clientX, point.clientY)
        context.startX = point.clientX
        context.startY = point.clientY
        context.points = [{
            t: Date.now(),
            x: point.clientX,
            y: point.clientY,
        }]
        context.isFlick = false
        context.isPan = false
        context.isTap = true
        context.isPress = false
        context.handler = setTimeout(() => {
            context.isPan = false
            context.isTap = false
            context.isPress = true
            context.handler = null
            this.dispatcher.dispatch('press', {})
        }, 500)
    }

    move(point, context) {
        // console.log('move', point.clientX, point.clientY)
        let dx = point.clientX - context.startX, dy = point.clientY - context.startY
        if (!context.isPan && dx ** 2 + dy ** 2 > 100) {
            context.isPan = true
            context.isTap = false
            context.isPress = false
            context.isVertical = Math.abs(dx) < Math.abs(dy)
            this.dispatcher.dispatch('panstart', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical
            })
            clearTimeout(context.handler)
        }
        if (context.isPan) {
            this.dispatcher.dispatch('pan', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical
            })
        }
        context.points = context.points.filter(point => Date.now() - point.t < 500)
        context.points.push({
            t: Date.now(),
            x: point.clientX,
            y: point.clientY,
        })
    }

    end(point, context) {
        // console.log('end', point.clientX, point.clientY)
        if (context.isTap) {
            dispatch('tap', {})
            clearTimeout(context.handler)
        }
        if (context.isPress) {
            this.dispatcher.dispatch('pressend', {})
        }

        context.points = context.points.filter(point => Date.now() - point.t < 500)
        let d, v
        if (context.points.length) {
            d = Math.sqrt((point.clientX - context.points[0].x) ** 2 + (point.clientY - context.points[0].y) ** 2)
            v = d / (Date.now() - context.points[0].t)
        } else {
            v = 0
        }
        context.isFlick = v > 1.5
        // console.log('flick', v > 1.5, v)
        if (context.isFlick) {
            this.dispatcher.dispatch('flick', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical,
                isFlick: context.isFlick,
                velocity: v
            })
        }

        if (context.isPan) {
            this.dispatcher.dispatch('panend', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical,
                isFlick: context.isFlick
            });
        }

    }

    cancel(point, context) {
        this.dispatcher.dispatch('cancel', {})
        clearTimeout(context.handler)
    }
}

export class Dispatcher {
    constructor(element) {
        this.element = element
    }

    dispatch(type, properties) {
        let event = new Event(type)
        for (let name in properties) {
            event[name] = properties[name]
        }
        this.element.dispatchEvent(event)
    }
}

export function enableGesture(element) {
    new Listener(element, new Recognize(new Dispatcher(element)))
}
