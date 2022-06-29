/**
 *
 * @file 描述错误体结构
 * @author otterh
 * @date 2022-06-27 23:15
 * @description 包含错误码和错误体类
 */
export declare enum ErrorCode {
    Unknown = 202,
    MapCompilingError = 203,
    CliOptionError = 204,
    CliInputFmtError = 205,
    CliOutputDirNoExist = 206,
    CliReadInputError = 207,
    CliWriteOutputError = 208
}
export default class OtterError {
    errorCode: ErrorCode;
    message: string;
    constructor(code?: ErrorCode, mes?: string);
}
