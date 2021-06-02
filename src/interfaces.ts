import * as t from 'io-ts';
import reporter from "io-ts-reporters";
import json5 from "json5"

function optional<RT extends t.Any>(
    type: RT,
    name: string = `${type.name} | undefined`
): t.UnionType<
    [RT, t.UndefinedType],
    t.TypeOf<RT> | undefined,
    t.OutputOf<RT> | undefined,
    t.InputOf<RT> | undefined
> {
    return t.union<[RT, t.UndefinedType]>([type, t.undefined], name);
}

export async function decode<T, O, I>(
    validator: t.Type<T, O, I>,
    input: I | string,
): Promise<[string | null, T | null]> {
    if (typeof (input) === "string") {
        try { input = json5.parse(input) }
        catch (e) { return ["JSON parsing error", null] };
        // input = await Promise.resolve(JSON.parse(input)).catch(e=>error=e);
    }
    const result = validator.decode(input as I);
    if (result._tag === "Left") {
        const error = reporter.report(result).join(", ");
        return [error, null];
    }

    return [null, result.right];
}


// Restruicted Array
// https://stackoverflow.com/questions/57429769/how-to-validate-array-length-with-io-ts
/*
interface IMinMaxArray<T> extends Array<T> {
    readonly minMaxArray: unique symbol
}
export const minMaxArray = <C extends t.Mixed>(min: number, max: number, a: C) => t.brand(
    t.array(a),
    (n: Array<C>): n is t.Branded<Array<C>, IMinMaxArray<C>> => min < n.length && n.length < max,
    'minMaxArray'
);
*/



export enum STATUS {
    success = "success",
    fail = "fail"
}
export const HistoryEventTypeC = t.union([
    t.literal("WorkflowExecutionStarted"),
    t.literal("WorkflowTaskScheduled"),
    t.literal("WorkflowTaskStarted"),
    t.literal("WorkflowTaskCompleted"),
    t.literal("ActivityTaskScheduled"),
    t.literal("ActivityTaskStarted"),
    t.literal("ActivityTaskCompleted"),
    t.literal("WorkflowExecutionCompleted"),
    t.literal("WorkflowTaskFailed"),
    t.literal("ERROR"),
]);
export type HistoryEventTypeI = t.TypeOf<typeof HistoryEventTypeC>;

export const TemporalHistoryEventC = t.type({
        eventTime: t.string,
        eventType: HistoryEventTypeC,
        eventId: t.string,
        details: t.any
})

export const TemporalHistoryC = t.type({
    rawHistory: t.array(t.unknown),
    history: t.type({
        events: t.array(TemporalHistoryEventC)
    })
});
export const TemporalStatusC = t.type({
    pendingActivities: t.array(t.type({
        activityId: t.string,
        activityType: t.type({
            name: t.string
        }),
        state: t.string,
        attempt: t.number,
        maximumAttempts: t.number,
        lastFailure: t.union([
            t.null,
            t.type({
                message: t.string,
                source: t.string
            })
        ]),
        scheduledTime: t.union([t.string, t.null]),
    })),
    workflowExecutionInfo: t.type({
        startTime: t.string,
        closeTime: t.union([t.string, t.null]),
        status: t.string,
        historyLength: t.string,
        executionTime: t.string
    })
});

export type TemporalHistoryI = t.TypeOf<typeof TemporalHistoryC>;
export type TemporalHistoryEventI = t.TypeOf<typeof TemporalHistoryEventC>;
export type TemporalStatusI = t.TypeOf<typeof TemporalStatusC>;