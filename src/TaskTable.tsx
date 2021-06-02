import React, {useState, useRef, useEffect}      from 'react';


import {STATUS, decode, 
    TemporalHistoryC,
    TemporalHistoryEventI,
    TemporalStatusC,
    TemporalStatusI
}                           from "./interfaces";


const TaskTable = (history: TemporalHistoryEventI[])=>{
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

export default TaskTable;