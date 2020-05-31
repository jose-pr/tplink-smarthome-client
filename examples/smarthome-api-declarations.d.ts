import { SmartHomeApiMethod, SmartHomeApi } from "tplink-smarthome-client"

interface DeviceTime {
    hour: number
    mday: number
    min: number
    month: number
    sec: number
    year: number
}
interface DeviceTimeZone {
    index: number
}



interface MeterReadings {
    voltage_mv: number
    current_ma: number
    power_mw: number
    total_wh: number
}

interface MeterDayStats {
    day_list: { day: number, energy_wh: number, month: number, year: number }[]
}
interface MeterMonthStats {
    month_list: {
        year: number
        energy_wh: number
        month: number
    }[]
}
interface SysInfo {
    alias: string
    child_num: number
    children: { alias: string, id: string, next_action: { type: number }, on_time: number, state: number }[]
    deviceId: string
    feature: string
    hw_ver: string
    hwId: string
    latitude_i: number
    led_off: boolean
    longitude_i: number
    mac: string
    mic_type: string
    model: string
    oemId: string
    rssi: number
    status: string
    sw_ver: string
    updating: boolean
}
interface DeviceInfo {
    cloud: {
        info: {
            binded: number
            cId_connection: number
            err_code: number
            fwDlPage: string
            fwNotifyType: -1
            ilegalType: number
            server: string
            stopConnect: number
            tcspInfo: string
            tcspStatus: number
            username: string
        }
    },
    emeter: {
        realtime: MeterReadings
    },
    schedule: {
        nextAction: {
            err_code: number
            type: number
        }
    },
    sysInfo: SysInfo
}

type GetSysInfo = SmartHomeApiMethod<'system', 'get_sysinfo', SysInfo>
type GetTime = SmartHomeApiMethod<'time', 'get_time', DeviceTime>
type GetTimeZone = SmartHomeApiMethod<'time', 'get_timezone', DeviceTimeZone>
type GetRealtime = SmartHomeApiMethod<'emeter', 'get_realtime', MeterReadings>


export type ExampleApi = SmartHomeApi<GetSysInfo & GetTime & GetTimeZone & GetRealtime>