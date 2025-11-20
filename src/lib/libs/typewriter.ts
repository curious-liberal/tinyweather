export interface TypeWriterOptions {
    content?: string[]
    speed?: number,
    backspeed?: number,
    loop?: number,
    delay?: number,
    pause?: number,
    backdelay?: number,
    target: (text: string) => void
}

export class TypeWriter {
    content: string[]
    speed: number
    backspeed: number
    loop: number
    delay: number
    pause: number
    backdelay: number

    // State
    private index: number
    private cursor: number
    private forward: boolean
    target: (text: string) => void

    constructor({
        content = [],
        speed = 100,
        backspeed = 40,
        backdelay = 400,
        loop = -1,
        delay = 1000,
        pause = 800,
        target
    }: TypeWriterOptions) {

        this.content = content
        this.speed = speed
        this.backspeed = backspeed

        // Pause after backspacing all characters in a word
        this.backdelay = backdelay

        this.loop = loop
        this.delay = delay
        this.pause = pause

        // State

        // Starts at -1 so we can tell it's the first run and add a delay
        this.index = -1

        this.cursor = 1
        this.target = target
        this.forward = true
    }

    write() {
        // Check delay
        if (this.index === -1) {
            this.index++
            setTimeout(() => this.write(), this.delay)
            return
        }

        // Check we haven't overshot
        if (this.index > this.content.length - 1 || this.loop === 0) {
            // If loop
            if (this.loop === -1) {  // Loop forever
                this.index = -1
            } else if (this.loop > 0) {
                this.index = -1
                this.loop--
            }

            this.write()
            return
        }

        // Current phrase from list
        const phrase = this.content[this.index]

        // Update target
        this.target(phrase.slice(0, this.cursor))

        // if end of phrase
        if (this.cursor >= phrase.length) {
            this.forward = false
            this.cursor--
            setTimeout(() => this.write(), this.pause)
            return
        } else if (!this.forward && this.cursor <= 0) {  // end of backspace
            this.forward = true
            this.cursor = 1
            this.index++
            setTimeout(() => this.write(), this.backdelay)
            return
        } else if (!this.forward) {  // we need to backspace
            this.cursor--
            setTimeout(() => this.write(), this.backspeed)
        } else {  // next letter
            this.cursor++
            setTimeout(() => this.write(), this.speed)
            return
        }
    }
}