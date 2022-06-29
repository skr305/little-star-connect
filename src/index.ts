 // 作为App中Error的标准格式
export type AppError< T = any > = {
    message: string
    data: T
    errorCode: number
}

// 需要注入的fetch类型
export type OtterFetch = <P, R>( url: string, params: P ) => Promise< AppError<R> >