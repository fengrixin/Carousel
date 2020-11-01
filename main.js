import {Component, createElement} from "./framework";
import {Carousel} from "./carousel";
import {Timeline, Animation} from "./animation";

let imgs = [
    'https://static001.geekbang.org/resource/image/bd/2e/bddfad3dc8fb2f7c4942a0dc1286c92e.jpg',
    'https://static001.geekbang.org/resource/image/f7/f8/f7c1822abb4382896b9b4d3530b02ff8.jpg',
    'https://static001.geekbang.org/resource/image/fb/c0/fb4e210a483a7892433331082f5f09c0.jpg',
    'https://static001.geekbang.org/resource/image/b4/26/b4ff997b68f16f882c255aef8c833626.jpg'
]
let a = <Carousel src={imgs}></Carousel>

// document.body.appendChild(a)
a.mountTo(document.body)

let tl = new Timeline()
window.tl = tl
window.animation = new Animation({set a(v){console.log(v)}}, 'a', 0, 100, 1000, null)
tl.start()
