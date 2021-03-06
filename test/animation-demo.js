import {Animation, Timeline} from "../animation";
import {ease} from "../ease";

let tl = new Timeline()
tl.start()

tl.add(new Animation(document.querySelector('#el').style, 'transform', 0, 500, 2000, 0, ease, v => `translateX(${v}px)`))

document.querySelector('#pause-btn').addEventListener('click', () => tl.pause())
document.querySelector('#resume-btn').addEventListener('click', () => tl.resume())
document.querySelector('#reset-btn').addEventListener('click', () => tl.reset())
