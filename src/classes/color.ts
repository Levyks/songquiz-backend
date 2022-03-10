export default class Color {

    constructor(
        public red: number, 
        public green: number, 
        public blue: number
    ) {}

    toArray(): [number, number, number] {
        return [this.red, this.green, this.blue];
    }

    static random(): Color {
        return new Color(
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255)
        );
    }

}