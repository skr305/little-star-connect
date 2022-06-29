"use strict";
/**
 *
 * @file 描述错误体结构
 * @author otterh
 * @date 2022-06-27 23:15
 * @description 包含错误码和错误体类
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
const tslib_1 = require("tslib");
const app_name_1 = (0, tslib_1.__importDefault)(require("./constants/app-name"));
// 错误码
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["Unknown"] = 202] = "Unknown";
    // 编译map-string时发生错误
    ErrorCode[ErrorCode["MapCompilingError"] = 203] = "MapCompilingError";
    // 使用cli工具时候出现坏参数
    ErrorCode[ErrorCode["CliOptionError"] = 204] = "CliOptionError";
    // 输入文件格式(应该为map)
    // 不正确
    ErrorCode[ErrorCode["CliInputFmtError"] = 205] = "CliInputFmtError";
    // 输出文件夹不存在
    ErrorCode[ErrorCode["CliOutputDirNoExist"] = 206] = "CliOutputDirNoExist";
    // 读取输入的map文件时出错
    ErrorCode[ErrorCode["CliReadInputError"] = 207] = "CliReadInputError";
    // 写入输出文件时失败
    ErrorCode[ErrorCode["CliWriteOutputError"] = 208] = "CliWriteOutputError";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
// 缺省时的编译错误提示
const DEFAULT_ERROR_MESSAGE = 'compiling fail';
// 错误体的结构
class OtterError {
    errorCode;
    message;
    constructor(code = ErrorCode.Unknown, mes = DEFAULT_ERROR_MESSAGE) {
        this.errorCode = code;
        this.message = mes + ` --from ${app_name_1.default} `;
    }
}
exports.default = OtterError;
