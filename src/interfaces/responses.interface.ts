interface SuccessResponse {
    status: "success";
    message: string;
    data?: any;
}

interface ErrorResponse {
    status: string;
    message: string;
    statusCode: number;
}