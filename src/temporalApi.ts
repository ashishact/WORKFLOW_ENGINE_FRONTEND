import dayjs from 'dayjs'

import axios, 
    {AxiosResponse}         from "axios";

const W = console.log;
const L = console.log;


const API_ROOT = "http://13.127.17.219:8088/api/namespaces/default";

export const getRunninWorkflows = async () =>{
    let err = null;
    let end = dayjs().format()
    let start = dayjs().subtract(30, "days").format(); 

    let url = `${API_ROOT}/workflows/open?startTime=${start}&endTime=${end}`;

    let r = await axios.get(url).catch(e=>err=e)
    if(err){
        W(err)
        return;
    }

    return r;
}

const init = ()=>{
    L("Temporal API init")
}
export default {
    init: init
}