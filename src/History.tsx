import React, { useState, useRef, useEffect } from 'react';

import Editor               from "@monaco-editor/react";

import dayjs from 'dayjs'

import {HistoryEventTypeI}  from "./interfaces";


interface Props {
    history: {
        type: HistoryEventTypeI
        time: string,
        message: string
    }[]
}
const History = (props: Props) => {
    const {history} = props;


    const editorRef = useRef<any>(null);
    const handleEditorDidMount = (editor:any , monaco: any) => {
        editorRef.current = editor; 
    }
    let text = `TIME: FAILED => "HELLO" {\r\n}`;

    return (
        <div className="container mx-auto px-4">
            {
            history.map((h, i)=>
                <div key={i}>
                    <p className="text-base font-light leading-relaxed mt-0 mb-2">
                        <span className="text-blue-800 pr-2">{dayjs(h.time).format("HH:mm:ss")}:</span>  
                        {h.message} {h.type}
                    </p>
                </div>
            )}
        </div>
        // <Editor
        //     theme="vs-dark"
        //     height="90vh"
        //     options={{
        //         minimap: {
        //             enabled: false,
        //         },
        //         // lineNumbers: "off",
        //         readOnly: true
        //     }}
        //     defaultLanguage="typescript"
        //     defaultValue={text}
        //     onMount={handleEditorDidMount}/>
    )
}

export default History;
