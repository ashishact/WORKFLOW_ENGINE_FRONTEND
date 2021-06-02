import React, {useState, useRef, useEffect}      from 'react';


import {STATUS, decode, 
    TemporalHistoryC,
    TemporalHistoryEventI,
    TemporalStatusC,
    TemporalStatusI
}                           from "./interfaces";


const PendingActivity = (props: {activity: string[]})=>{
    const {activity} = props;
    return (
        <div>
            {
                activity.map((c, i)=>
                    <div className="text-white px-6 py-4 mr-1 border-0 rounded relative mb-2 bg-blue-400">
                        <span className="inline-block align-middle mr-8">
                            <b className="capitalize">Pending! </b>  
                            {c}
                        </span>
                    </div>
                )
                

            }
        </div>
    )
}


export default PendingActivity;