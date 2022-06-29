/**
 * 
 * @file 描述错误体结构
 * @author otterh
 * @date 2022-06-27 23:15
 * @description 包含错误码和错误体类
 */

import APP_NAME from "./constants/app-name"

// 错误码
export enum ErrorCode {

    Unknown = 202,
    
    // 编译map-string时发生错误
    MapCompilingError = 203, 
    
    // 使用cli工具时候出现坏参数
    CliOptionError = 204,

    // 输入文件格式(应该为map)
    // 不正确
    CliInputFmtError = 205,

    // 输出文件夹不存在
    CliOutputDirNoExist = 206,

    // 读取输入的map文件时出错
    CliReadInputError = 207,

    // 写入输出文件时失败
    CliWriteOutputError = 208

}

// 缺省时的编译错误提示
const DEFAULT_ERROR_MESSAGE = 'compiling fail'

// 错误体的结构
export default class OtterError {
    
    errorCode: ErrorCode
    
    message: string

    constructor( 
        code: ErrorCode = ErrorCode.Unknown,
        mes: string = DEFAULT_ERROR_MESSAGE
    ) {
        this.errorCode = code
        this.message = mes + ` --from ${ APP_NAME } `
    }

}