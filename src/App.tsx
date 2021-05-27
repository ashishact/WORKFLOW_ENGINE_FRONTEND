import React, {useState, useRef}      from 'react';
import logo                 from './logo.svg';
import './App.css';

import Editor               from "@monaco-editor/react";
import axios, 
    {AxiosResponse}         from "axios";


import {STATUS, decode, 
    TemporalHistoryC,
    TemporalHistoryEventI
}                           from "./interfaces";
import defaultValues                from "./default_values";

const WARN  = console.warn;
const LOG   = console.log;

const SERVICE_API_ROOT = "http://localhost:3000/api/v1";

interface StatusI{
    id: string,
    type: string,
    time: string
}
function App() {

    const editorRef = useRef<any>(null);
    const [wfState, setWfState] = useState<string>("BEFORE INIT");
    const [status, setStatus] = useState<TemporalHistoryEventI[]|null>([]);


    const handleEditorDidMount = (editor:any , monaco: any) => {
        editorRef.current = editor; 
    }
    const getCode = (): string|null => {
        if(!editorRef.current) return null;
        return editorRef.current.getValue();
    }

    const runWorkflow = async (): Promise<string|boolean> =>{
        let err = null;

        const yaml = getCode();
        if(!yaml) return false;
        
        const url = `${SERVICE_API_ROOT}/workflow/${1}/run`;
        const r:AxiosResponse<any>|null = await axios.post(url, {yaml}).catch(e=>err=e);
        if(!r || err){
            WARN(err);
            return false;
        }

        LOG(r);
        if(r.data.status === STATUS.success){
            if(r.data.data?.length){
                let data = r.data.data[0];
                pollStatus(data.runId, data.workflowId); // Pass the ID
            }
            setWfState("POSTED: " + JSON.stringify(r.data.data));
        }
        else if(r.data.status === STATUS.fail){
            setWfState("FAILED: " + r.data.errors);
        }

       

        return true;
    }

    const pollStatus = async (runId: string, workflowId: string) => {
        getWorkflowStatus(runId, workflowId);
        
        
        let count = 0;
        let id = setInterval(()=>{
            getWorkflowStatus(runId, workflowId);
            
            if(count++ > 10){
                clearInterval(id);
            }

        }, 3000);
    }

    const getWorkflowStatus = async (runId: string, workflowId: string) =>{
        let err = null;
        const url = `${SERVICE_API_ROOT}/workflow/${workflowId}/${runId}/status`;
        const r:AxiosResponse<any>|null = await axios.get(url).catch(e=>err=e);
        if(!r || err){
            WARN(err);
            return false;
        }

        if(r.data.status === STATUS.success){
            // setStatus(JSON.stringify(r.data.data, null, 2));
            if(r.data.data?.length){
                let data = r.data.data[0];
                let [e, h] = await decode(TemporalHistoryC, data);
                LOG(e, h);
                if(e) setStatus(null);
                else if(h){
                    setStatus(h.history.events);
                }
            }
        }
        return;
    }

    const StatusList = ()=>{
        return (
            <div className="rounded-t-xl overflow-hidden bg-gradient-to-r from-pink-50 to-purple-100">
                <table className="table-auto">
                    <thead>
                    <tr>
                        <th>Id</th>
                        <th>Type</th>
                        <th>Time</th>
                    </tr>
                    </thead>
                    <tbody>
                        {status && status.map((s, i) => {
                            let evn = s.details?.activityType?.name || "";
                            if(evn) evn = ` (${evn})`;

                            return (<tr key={i}>
                                <td className="border border-green-500 px-4 py-2 text-green-600 font-small">{s.eventId}</td>
                                <td className="border border-green-500 px-4 py-2 text-green-600 font-small">
                                    {s.eventType + evn}
                                </td>
                                <td className="border border-green-500 px-4 py-2 text-green-600 font-small">{s.eventTime}</td>
                            </tr>)
                        })}
                    </tbody>
                </table>
            </div>
        )
    }

    return (
        <div className="container mx-auto">
            <div className="grid grid-cols-2">
                <Editor
                    theme="vs-dark"
                    height="100vh"
                    defaultLanguage="yaml"
                    defaultValue={defaultValues.simple_workflow_yaml}
                    onMount={handleEditorDidMount}
                />
                <div className="">
                    {/* <div>Workflow State: {wfState}</div> */}
                    <button className="bg-transparent hover:bg-blue-500 text-indigo-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                        onClick={runWorkflow}
                        >
                        Run Worflow
                    </button>
                    <StatusList></StatusList>
                
                </div>
            </div>
        </div>
    );
}

export default App;
