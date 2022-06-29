export declare type AppError<T = any> = {
    message: string;
    data: T;
    errorCode: number;
};
export declare type OtterFetch = <P, R>(url: string, params: P) => Promise<AppError<R>>;
