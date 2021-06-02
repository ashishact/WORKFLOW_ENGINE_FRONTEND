import React, { useState, useRef, useEffect } from 'react';

import Editor               from "@monaco-editor/react";

import dayjs from 'dayjs'

import {HistoryEventTypeI, TemporalHistoryI, TemporalStatusI}  from "./interfaces";


// interface Props {
//     history: {
//         type: HistoryEventTypeI
//         time: string,
//         message: string
//     }[]
// }

interface Props {
    history: TemporalHistoryI|null,
    status: TemporalStatusI|null
}
const HistoryAsCode = (props: Props) => {
    const {history, status} = props;


    const editorRef = useRef<any>(null);
    const handleEditorDidMount = (editor:any , monaco: any) => {
        editorRef.current = editor; 
    }
    let text = `START LOGS\n==========\n\n`;


    const findActivityDetails = (eventId: string):any => {
        if(!history) return null;

        let j = null;
        history.history.events.find(e=>{
            if(e.eventId === eventId && e.eventType === "ActivityTaskScheduled"){
                j = e.details?.input?.payloads;
                if(j){
                    return true;
                }
            }
        });

        return j;
    }

    if(history){
        for(let e of history.history.events){
            let t = null;
            if(e.eventType === "ActivityTaskStarted"){
                t = dayjs(e.eventTime).format("YY MMM DD, HH:mm:ss")  + " : [ActivityStarted] => ";
                let j = findActivityDetails(e.details.scheduledEventId);
                if(j){
                    t += JSON.stringify(j, null, 2) + "\n";
                }
                else{
                    t += JSON.stringify(e, null, 2) + "\n";
                }
            }
            else if(e.eventType === "ActivityTaskCompleted"){
                t = dayjs(e.eventTime).format("YY MMM DD, HH:mm:ss") + " : [ActivityCompleted] => ";
                let j = findActivityDetails(e.details.scheduledEventId);
                if(j){
                    if(Array.isArray(j) && j.length) j = j[0];
                    j = {
                        Name: j.Name,
                        Call: j.Call,
                        result: e.details.result
                    }
                    t += JSON.stringify(j, null, 2) + "\n";
                }
                else{
                    t += JSON.stringify(e, null, 2) + "\n";
                }
            }
            else if(e.eventType === "WorkflowExecutionCompleted"){
                t = dayjs(e.eventTime).format("YY MMM DD, HH:mm:ss") + " : [WorkflowExecutionCompleted] => ";
                let j = {result: e.details?.result};
                if(j){
                    t += JSON.stringify(j, null, 2) + "\n";
                }
                else{
                    t += JSON.stringify(e, null, 2) + "\n";
                }
            }
            if(t) text += t + "\n";
        }

        if(status){
            if(status.pendingActivities?.length){
                let pending = "";
                for(let pa of status.pendingActivities){

                    pending += "PENDING => " + JSON.stringify({
                        Name: pa.activityType?.name,
                        scheduledTime: pa.scheduledTime,
                        lastFailure: {
                            message: pa.lastFailure?.message
                        },
                        attempt: pa.attempt,
                        maximumAttempts: pa.maximumAttempts,
                    }, null, 2) + "\n";
                }

                if(pending){
                    text += pending;
                }
            }

            if(status.workflowExecutionInfo){
                text += "\n\n=======================\n";
                let i = status.workflowExecutionInfo;
                let j = {
                    executionTime: i.executionTime,
                    status: i.status,
                    startTime: i.startTime,
                    closeTime: i.closeTime,
                }
                text += "EXECUTION INFO => " + JSON.stringify(j, null, 2);
            }


            text += "\n\n=======================\n";
            text += "FULL STATUS => " + JSON.stringify(status, null, 2);
        }

        text += "\n\n=======================\n";
        text += "FULL HISTORY => ";
        text +=  JSON.stringify(history, null, 2);
    }
    if(editorRef.current){
        editorRef.current.setValue(text);
    }

    return (
        <Editor
            width="100%"
            theme="vs-dark"
            height="100vh"
            options={{
                minimap: {
                    enabled: false,
                },
                lineNumbers: "off",
                readOnly: true,
                scrollbar: {
                    vertical: 'hidden'
                },
            }}
            defaultLanguage="typescript"
            defaultValue={text}
            onMount={handleEditorDidMount}/>

    )
}

export default HistoryAsCode;
