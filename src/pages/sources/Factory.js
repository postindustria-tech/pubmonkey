const pull = {};

export default class SourceFactory {
    static registerHandler (HandlerClass) {
        pull[HandlerClass.source] = HandlerClass;
    }

    static getHandler (adServer) {
        console.log('new instance of ' + adServer);
        return new pull[adServer]
    }
}
