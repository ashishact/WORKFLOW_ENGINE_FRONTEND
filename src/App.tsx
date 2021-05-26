import React from 'react';
import logo from './logo.svg';
import './App.css';

import Editor from "@monaco-editor/react";

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <Editor
                    theme="vs-dark"
                    height="90vh"
                    defaultLanguage="yaml"
                    defaultValue="# some comment"
                />
            </header>
        </div>
    );
}

export default App;
