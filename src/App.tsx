import './App.css';
import React, {
    useState, 
    useRef, 
    useEffect
}                           from 'react';

import Editor               from "@monaco-editor/react";
import axios, {
    AxiosResponse
}                           from "axios";

import {
    getRunninWorkflows
}                           from "./temporalApi"

import {
    STATUS, decode, 
    TemporalHistoryC,
    TemporalHistoryEventI,
    TemporalStatusC,
    TemporalStatusI,
    HistoryEventTypeI,
    TemporalHistoryI
}                           from "./interfaces";
import example_workflows    from "./example_workflow";




import History              from "./History";
import HistoryAsCode        from "./HistoryAsCode";
import TaskTable            from  "./TaskTable"
import PendingActivity      from "./PendingActivity";


const WARN  = console.warn;
const LOG   = console.log;

const SERVICE_API_ROOT = process.env.REACT_APP_WFE_API_SERVER_ROOT || "http://localhost:3014/api/v1";

interface StatusI{
    id: string,
    type: string,
    time: string
}
enum RUNNIG_STATUS {
    NONE,
    RUNNING,
    FAILED,
    COMPLETED,
    TERMINATED
}

interface WorkflowSubmitResult{
    error: string|null
    runId: string,
    workflowId: string
}

let run_s:RUNNIG_STATUS = RUNNIG_STATUS.NONE;
let polling_timer:any = 0;

function App() {

    const editorRef = useRef<any>(null);
    const [history, setHistory] = useState<TemporalHistoryI|null>(null);
    const [temporalStatus, setTemporalStatus] = useState<TemporalStatusI|null>(null);

    const [status, setStatus] = useState<RUNNIG_STATUS>(RUNNIG_STATUS.NONE);
    const [runIds, setRunIds] = useState<any>(null);
    const [pending, setPending] = useState<string[]>([]);
    
    const [submitResult, setSubmitResult] = useState<WorkflowSubmitResult|null>(null);


    const handleEditorDidMount = (editor:any , monaco: any) => {
        editorRef.current = editor; 
        // console.log(editor, monaco);
    }

    const getCode = (): string|null => {
        if(!editorRef.current) return null;
        return editorRef.current.getValue();
    }


    const runWorkflow = async (): Promise<string|boolean> =>{
        let err = null;

        const yaml = getCode();
        if(!yaml) return false;


        
        setHistory(null);
        setTemporalStatus(null);
        clearInterval(polling_timer);
        setStatus(RUNNIG_STATUS.NONE);

        
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
                if(data){
                    let runid:string = data.runId;
                    let wfid:string = data.workflowId;
                    setRunIds(data);
                    pollHistory(runid, wfid); // Pass the ID
                    setStatus(RUNNIG_STATUS.RUNNING);
                    gotNewSubmitResult({runId: runid, workflowId: wfid, error: null});
                }
                else{
                    gotNewSubmitResult({runId: "0", workflowId: "0", error: "FAILED TO RUN WORKFLOW"});
                }
            }
            else{
                gotNewSubmitResult({runId: "0", workflowId: "0", error: "FAILED TO RUN WORKFLOW"});
            }
        }
        else if(r.data.status === STATUS.fail){
            gotNewSubmitResult({runId: "0", workflowId: "0", error: r.data.errors[0]});
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

        polling_timer = setInterval(()=>{
            getWorkflowHistory(runId, workflowId);
            getWorkflowStatus(runId, workflowId);

            if(run_s !== RUNNIG_STATUS.RUNNING){
                clearInterval(polling_timer);
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
                let h = r.data.data[0];
                if(h){
                    setHistory(h);
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
                let s = r.data.data[0];
                // let [e, s] = await decode(TemporalStatusC, data);
                if(s){
                    setTemporalStatus(s);
                    // console.log("status is: ", s.workflowExecutionInfo.status);
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
                    else if(s.workflowExecutionInfo.status === "Failed"){
                        setStatus(RUNNIG_STATUS.FAILED);
                        run_s = RUNNIG_STATUS.FAILED;
                    }
                    else {
                        console.error("Handle workflowExecutionInfo.status= "+ s.workflowExecutionInfo.status)
                    }
                }
            }
        }
        return;
    }


    const yamlSelected = (e: any)=>{
        if(!editorRef.current) return;

        let i = e.target.value;
        let yamls = example_workflows.yamls;
        if(i < yamls.length ){
            editorRef.current.setValue(yamls[i].code);
        }
    }

    const gotNewSubmitResult = (sr: WorkflowSubmitResult) => {
        setSubmitResult(sr);

        setTimeout(()=>{
            setSubmitResult(null); // clear
        }, sr.error?5000:2000);
    }
    

    return (
        <div className="container mx-auto">
            <div className="grid grid-cols-3 text-center pt-1 pl-1">
                <select className="col-span-2 bg-gray-500 text-white active:bg-pink-300 font-bold uppercase text-sm rounded shadow hover:shadow-lg outline-none focus:outline-none pl-4 mr-1 mb-1 ease-linear transition-all duration-150"
                onChange={yamlSelected}
                >
                    {
                        example_workflows.yamls.map((y, i)=>(
                            <option key={i} value={i}>{y.name}</option>
                        ))
                    }
                </select>


                {
                    (status !== RUNNIG_STATUS.RUNNING) && 
                    <button className="col-span-1 bg-green-500 text-white active:bg-pink-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button" onClick={runWorkflow}>Run</button>
                }

                {
                    (status === RUNNIG_STATUS.RUNNING) && 
                    <button className="col-span-1 bg-pink-500 text-white active:bg-pink-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button" onClick={terminateWorkflow}>Terminate</button>

                }
                
            </div>
                
            <div className="grid grid-cols-2">
                <div className="container mx-auto">
                    <Editor
                        options={{
                            scrollbar: {
                                vertical: 'hidden'
                            },
                        }}
                        theme="vs-dark"
                        height="100vh"
                        defaultLanguage="yaml"
                        defaultValue={example_workflows.yamls[0].code}
                        onMount={handleEditorDidMount}/>
                        
                
                </div>


                
                <div className="container mx-auto p-0">
                    <HistoryAsCode history={history} status={temporalStatus}></HistoryAsCode>
                </div>

                {
                    (submitResult && submitResult.error) && 
                    <div role="alert" className="absolute top-16 right-4 transform">
                        <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2">
                            Error
                        </div>
                        <div className="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                            <p>{submitResult.error}</p>
                        </div>
                    </div>
                }
                
                {
                    (submitResult && !submitResult.error) && 
                    <div role="alert" className="absolute top-16 right-4 transform">
                        <div className="bg-blue-500 text-white font-bold rounded-t px-4 py-2">
                            Workflow Submited
                        </div>
                        <div className="border border-t-0 border-blue-400 rounded-b bg-blue-100 px-4 py-3 text-blue-700">
                            <p>WORKFLOW ID: {submitResult.workflowId},  RUN ID: {submitResult.runId}</p>
                        </div>
                    </div>
                }

            </div>
        </div>
    );
}

export default App;
