import { SmartHomeClient, IsValidSmartHomeResponse } from "tplink-smarthome-client";
import { ExampleApi, GetTimeZone, GetTime, GetRealtime, GetSysInfo, SysInfo } from "./smarthome-api-declarations";

let client = new SmartHomeClient<ExampleApi>({
    host: "smarthome.lan",
    proto: 'tcp'
})

function keys<A extends {}>(obj: A) {
    return Object.keys(obj) as (Exclude<keyof A, symbol | number>)[]
}

async function using<R, U extends {
    connect: () => Promise<void>
    disconnect: () => Promise<void>
}>(usable: U, action: (usable: U) => Promise<R>) {
    await usable.connect();
    const result = await action(usable);
    await usable.disconnect();
    return result;
}

using(client, async (client) => {
    let apicall = await client.request({
        system: {
            get_sysinfo: null
        },
        time:{
            get_timezone:null,
            get_time:null,
//            get_error:null
        }
    });

    if (IsValidSmartHomeResponse(apicall)) {
        for (let ns of keys(apicall)) {
            for (let n of keys(apicall[ns])) {
                for (let v of keys(apicall[ns][n])) {
                    console.log(`${ns}.${n}.${v}: ${JSON.stringify(apicall[ns][n][v], null, 1)}`);
                }
            }
        }
    }
})

