import React, {useState, useRef, useEffect}      from 'react';
import logo                 from './logo.svg';
import './App.css';

import Editor               from "@monaco-editor/react";
import axios, 
    {AxiosResponse}         from "axios";


import {STATUS, decode, 
    TemporalHistoryC,
    TemporalHistoryEventI,
    TemporalStatusC,
    TemporalStatusI
}                           from "./interfaces";
import defaultValues                from "./default_values";

const WARN  = console.warn;
const LOG   = console.log;

const SERVICE_API_ROOT = "http://localhost:3014/api/v1";

interface StatusI{
    id: string,
    type: string,
    time: string
}
enum RUNNIG_STATUS {
    NONE,
    RUNNING,
    COMPLETED,
    TERMINATED
}

let run_s:RUNNIG_STATUS = RUNNIG_STATUS.NONE;

function App() {

    const editorRef = useRef<any>(null);
    const [wfState, setWfState] = useState<string>("BEFORE INIT");
    const [history, setHistory] = useState<TemporalHistoryEventI[]|null>([]);
    const [status, setStatus] = useState<RUNNIG_STATUS>(RUNNIG_STATUS.NONE);
    const [runIds, setRunIds] = useState<any>(null);


    useEffect(() => {
        
    }, [status]);

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
        
        setWfState("POSTED: " + JSON.stringify(r.data.data));
        setStatus(RUNNIG_STATUS.NONE);
        setHistory(null);

        LOG(r);
        if(r.data.status === STATUS.success){
            if(r.data.data?.length){
                let data = r.data.data[0];
                setRunIds(data);
                pollHistory(data.runId, data.workflowId); // Pass the ID
            }
        }
        else if(r.data.status === STATUS.fail){
            setWfState("FAILED: " + r.data.errors);
        }

       

        return true;
    }

    const terminateWorkflow = async (): Promise<string|boolean> =>{
        if(!runIds) return false;

        let err = null;

    
        const url = `${SERVICE_API_ROOT}/workflow/${runIds.workflowId}/${runIds.runId}/terminate`;
        let reason = "FROM UI";
        const r:AxiosResponse<any>|null = await axios.post(url, {reason}).catch(e=>err=e);
        if(!r || err){
            WARN(err);
            return false;
        }

        LOG(r);
        if(r.data.status === STATUS.success){
        }
        else if(r.data.status === STATUS.fail){
        }

        return true;
    }

    const pollHistory = async (runId: string, workflowId: string) => {
        getWorkflowHistory(runId, workflowId);
        getWorkflowStatus(runId, workflowId);

        let id = setInterval(()=>{
            getWorkflowHistory(runId, workflowId);
            getWorkflowStatus(runId, workflowId);

            if(run_s === RUNNIG_STATUS.COMPLETED || run_s === RUNNIG_STATUS.TERMINATED){
                clearInterval(id);
            }
            else{
                console.log(status)
            }
        }, 1000);
    }

    const getWorkflowHistory = async (runId: string, workflowId: string) =>{
        let err = null;
        const url = `${SERVICE_API_ROOT}/workflow/${workflowId}/${runId}/history`;
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
                // LOG(e, h);
                if(e) setHistory(null);
                else if(h){
                    setHistory(h.history.events);
                }
            }
        }
        return;
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
            if(r.data.data?.length){
                let data = r.data.data[0];
                let [e, s] = await decode(TemporalStatusC, data);
                LOG(e, s);
                if(e) setStatus(RUNNIG_STATUS.NONE);
                else if(s){
                    console.log("status is: ", s.workflowExecutionInfo.status);
                    if(s.workflowExecutionInfo.status === "Running"){
                        setStatus(RUNNIG_STATUS.RUNNING);
                        run_s = RUNNIG_STATUS.RUNNING;
                    }
                    else if(s.workflowExecutionInfo.status === "Terminated"){
                        setStatus(RUNNIG_STATUS.TERMINATED);
                        run_s = RUNNIG_STATUS.TERMINATED;
                    }
                    else if(s.workflowExecutionInfo.status === "Completed"){
                        setStatus(RUNNIG_STATUS.COMPLETED)
                        run_s = RUNNIG_STATUS.COMPLETED;
                    }
                    else {
                        console.error("Handle workflowExecutionInfo.status= "+ s.workflowExecutionInfo.status)
                    }
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
                        {history && history.map((s, i) => {
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
                    defaultValue={defaultValues.noops_workflow_yaml}
                    onMount={handleEditorDidMount}
                />
                <div className="">
                    {(status === RUNNIG_STATUS.RUNNING) &&
                        (<div >Pending Activity: </div>)
                    }
                    {/* <div>Workflow State: {wfState}</div> */}
                    <button className="bg-transparent hover:bg-blue-500 text-indigo-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                        onClick={runWorkflow}
                        >
                        Run Worflow
                    </button>
                    {
                        (status === RUNNIG_STATUS.RUNNING) && (
                            <button className="bg-transparent hover:bg-red-500 text-indigo-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded"
                                onClick={terminateWorkflow}
                                >
                                Terminate
                            </button>
                        )
                    }
                    <StatusList></StatusList>
                
                </div>
            </div>
        </div>
    );
}

export default App;
