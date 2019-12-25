import React, {Component} from "react";
import Editor from 'react-simple-code-editor';
import {highlight, languages} from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

export class CreativeSnippet extends Component {

    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
        this.selection = {
            start: false,
            end: false
        };
        this.handleChange = this.handleChange.bind(this);
    }

    static defaultProps = {
        onChange: () => {},
        snippet: "",
    };

    componentDidUpdate() {

        const {selectionStart, selectionEnd} = this.inputRef.current;
        const update = (this.selection.start !== false && this.selection.start !== selectionStart)
            || (this.selection.end !== false && this.selection.end !== selectionEnd);

        if (update) {
            this.inputRef.current.selectionStart = this.selection.start;
            this.inputRef.current.selectionEnd = this.selection.end;
        }
    }

    handleChange(snippet) {
        const input = this.inputRef.current;
        this.selection = {
            start: input.selectionStart,
            end: input.selectionEnd
        };
        this.props.onChange(snippet);
    }

    render() {
        return (
            <Editor
                ref={this.inputRef}
                value={this.props.snippet}
                onValueChange={snippet => this.handleChange(snippet)}
                highlight={snippet => highlight(snippet, languages.js)}
                padding={10}
                style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 12,
                }}
            />
        );
    }
}