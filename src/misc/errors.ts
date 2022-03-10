
export class SongQuizError extends Error {

    static unknown = new SongQuizError("errors.unknown");

    public isSongQuizError = true;

    constructor(
        public messageCode: string, 
        public params?: { [key: string]: string }
    ) {
        super(messageCode);
        this.name = "SongQuizError";
    }

    toJSON() {
        return {
            messageCode: this.messageCode,
            params: this.params
        }
    }
}