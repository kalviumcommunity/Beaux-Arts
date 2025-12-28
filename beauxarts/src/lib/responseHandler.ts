import { NextResponse } from "next/server";
import { ERROR_CODES } from "./errorCodes";

// Standardize the response structure type
type ApiResponse<T = null> = {
  success: boolean;
  message: string;
  data?: T;
  error?: { code: string; details?: unknown };
  timestamp: string;
};


export const sendSuccess = <T>({
  data,
  message = "Success",
  status = 200,
}: {
  data: T;
  message?: string;
  status?: number;
}) => {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

export const sendError = ({
  message = "Something went wrong",
  code = ERROR_CODES.INTERNAL_ERROR,
  status = 500,
  details = null,
}: {
  message?: string;
  code?: string;
  status?: number;
  details?: unknown; 
} = {}) => {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      message,
      error: { code, details },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};