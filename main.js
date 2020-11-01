import {Component, createElement} from "./framework";

class Carousel extends Component {
    constructor() {
        super()
        this.attributes = Object.create(null)
    }

    setAttribute(name, value) {
        this.attributes[name] = value
    }

    render() {
        console.log(this.attributes.src)
        this.root = document.createElement('div')
        this.root.classList.add('carousel')
        for (let url of this.attributes.src) {
            let child = document.createElement('div')
            child.style.backgroundImage = `url(${url})`
            this.root.appendChild(child)
        }

        let position = 0
        this.root.addEventListener('mousedown', ev => {
            console.log('mousedown')
            let children = this.root.children
            let startX = ev.clientX

            let move = ev => {
                let x = ev.clientX - startX

                let current = position - ((x - x % 500) / 500)

                for (let offset of [-1, 0, 1]) {
                    let pos = current + offset
                    pos = (pos + children.length) % children.length

                    children[pos].style.transition = 'none'
                    children[pos].style.transform = `translateX(${-pos * 500 + offset * 500 + x % 500}px)`
                }
            }
            let up = ev => {
                console.log('mouseup')
                let x = ev.clientX - startX
                position = position - Math.round(x / 500)

                for (let offset of [0, -Math.sign(Math.round(x / 500) - x + 250 * Math.sign(x))]) {
                    let pos = position + offset
                    pos = (pos + children.length) % children.length

                    children[pos].style.transition = ''
                    children[pos].style.transform = `translateX(${-pos * 500 + offset * 500}px)`
                }

                document.removeEventListener('mousemove', move)
                document.removeEventListener('mouseup', up)
            }
            document.addEventListener('mousemove', move)
            document.addEventListener('mouseup', up)
        })

        /**
         let currentIndex = 0
         setInterval(() => {
            let children = this.root.children
            let nextIndex = (currentIndex + 1) % children.length

            let current = children[currentIndex]
            let next = children[nextIndex]

            next.style.transition = 'none'
            next.style.transform = `translateX(${100 - nextIndex * 100}%)`

            let timer = setTimeout(() => {
                next.style.transition = ''
                current.style.transform = `translateX(${-100 - currentIndex * 100}%)`
                next.style.transform = `translateX(${-nextIndex * 100}%)`
                currentIndex = nextIndex
            }, 16)

        }, 3000)
         */
        return this.root
    }

    mountTo(parent) {
        parent.appendChild(this.render())
    }
}

let imgs = [
    'https://static001.geekbang.org/resource/image/bd/2e/bddfad3dc8fb2f7c4942a0dc1286c92e.jpg',
    'https://static001.geekbang.org/resource/image/f7/f8/f7c1822abb4382896b9b4d3530b02ff8.jpg',
    'https://static001.geekbang.org/resource/image/fb/c0/fb4e210a483a7892433331082f5f09c0.jpg',
    'https://static001.geekbang.org/resource/image/b4/26/b4ff997b68f16f882c255aef8c833626.jpg'
]
let a = <Carousel src={imgs}></Carousel>

// document.body.appendChild(a)
a.mountTo(document.body)
