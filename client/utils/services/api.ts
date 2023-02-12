import type { AxiosInstance } from "axios";
import axios from "axios";

import type { AdminOrg } from "../types/admin.types";

const apiInstance: AxiosInstance = axios.create({
  baseURL: "https://delinzk.loca.lt/api/v1",
  headers: {
    "Bypass-Tunnel-Reminder": 1,
  },
});

export const AdminLogin = async (input: {
  admin_email: string;
  admin_password: string;
}): Promise<string> => {
  const { data } = await apiInstance.post("/admin/log-in", input);

  return data.token as string;
};

export const AdminOrgs = async (token: string): Promise<AdminOrg[]> => {
  const { data } = await apiInstance.get("/admin/orgs", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data.organizations as AdminOrg[];
};

export const OrgApprove = async (
  id: string,
  token: string
): Promise<string> => {
  const { data } = await apiInstance.post(
    "/org/approve",
    { org_id: id },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data as string;
};

export const OrgSignup = async (data: FormData): Promise<void> => {
  await apiInstance.post("/org/sign-up", data);

  return;
};

export const OrgSignupComplete = async (reqId: string): Promise<string> => {
  const { data } = await apiInstance.get("/org/sign-up-complete", {
    params: { reqId },
  });

  return JSON.stringify(data);
};

export const OrgSignin = async (): Promise<{
  qr: string;
  sessionId: string;
}> => {
  const { data, headers } = await apiInstance.get("/org/sign-in", {});

  return {
    qr: data,
    sessionId: headers["x-delinzk-session-id"] ?? null,
  };
};

export const EmpSignupQR = async (): Promise<{
  qr: string;
  sessionId: string;
}> => {
  const { data, headers } = await apiInstance.get("/employee/sign-up");

  return {
    qr: data,
    sessionId: headers["x-delinzk-session-id"] ?? null,
  };
};

export const EmpSignupForm = async (data: FormData): Promise<void> => {
  await apiInstance.post("/employee/sign-up", data);

  return;
};

export const EmpSignin = async (): Promise<{
  qr: string;
  sessionId: string;
}> => {
  const { data, headers } = await apiInstance.get("/employee/sign-in", {});

  return {
    qr: data,
    sessionId: headers["x-delinzk-session-id"] ?? null,
  };
};
