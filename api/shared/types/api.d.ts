export interface ApiResponse<T = any> {
    data?: T;
    error?: string;
    success: boolean;
}
export interface ApiError {
    message: string;
    code?: string;
    status?: number;
}
