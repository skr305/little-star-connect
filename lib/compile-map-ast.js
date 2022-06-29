"use strict";
/**
 *
 * @file 根据<map>文件生成api接口的工具
 * @author otterh
 * @date 2022-06-27 23:09
 * @description map文件描述见README.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = (0, tslib_1.__importDefault)(require("chalk"));
const otter_error_1 = (0, tslib_1.__importStar)(require("./otter-error"));
// 用于匹配花括号中的内容
const CurlyBracketMatcher = /\{(.*?)\}/ig;
// 正常单句中应匹配的api表达式数量 即params和response
const CORRECT_APIEXP_LEN = 2;
/**
 *
 * @funtion 匹配字符串内的接口描述内容
 * 用于 { id, name } 这样的表达式
 * @param raw 需要被匹配的字符串
 * @return
 */
const matchApiExpression = (raw) => {
    const matched = raw.matchAll(CurlyBracketMatcher);
    const result = [];
    for (let m of matched) {
        // 如 id, name 这样的内容
        const apiBody = m[1];
        // 分解成 [ 'id', 'name' ] 
        // 这样的结构
        // 然后返回入结果集
        result.push(apiBody
            .split(",")
            .map(field => field.trim()));
    }
    return result;
};
/**
 *
 * @funtion 用于把map文件字符串编译成简单语法树
 * @param mapFileString 由源文件中读取的内容字符串
 * @return
 * @throw 当语法内容不规范时抛出
 */
const compileMapToAst = (mapFileString) => {
    return mapFileString
        .split('\n')
        // 对单行内容进行处理
        .map(line => {
        const apiExps = matchApiExpression(line);
        if (apiExps.length !== CORRECT_APIEXP_LEN) {
            throw new otter_error_1.default(otter_error_1.ErrorCode.MapCompilingError, "too many api expressions!" +
                "its number should be 2" +
                "\n" + "error line:" +
                "\n" + chalk_1.default.redBright(line));
        }
        // 在 /unauth/login { id, pwd } { id, avatar, nick } 中
        // 抽取 /unauth/login
        const path = line
            .split(" ")[0]
            .trim();
        const [params, response] = apiExps;
        return {
            path,
            params,
            response
        };
    });
};
exports.default = compileMapToAst;
