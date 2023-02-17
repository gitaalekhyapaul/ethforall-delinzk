import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import Link from "next/link";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { io } from "socket.io-client";

import type { EmployeeSignupProps } from "@/utils/types/employee.types";
import type {
  CustomFieldTypes,
  FieldClassnames,
} from "@/utils/types/shared.types";
import { Button, CustomField, Message, QRPage } from "@/components/shared";
import { CreateYupSchema, PopPromiseToast } from "@/utils/functions";
import { EmpSignupForm } from "@/utils/services/api";

const EmployeeSignup: React.FC<EmployeeSignupProps> = ({ qr, sessionId }) => {
  const [DID, setDID] = useState<string | null>(null);
  const [completed, setCompleted] = useState<boolean>(false);

  const socket = useRef<Socket>();

  const CLASSNAMES = useMemo<FieldClassnames>(
    () => ({
      wrapper: "w-full",
      input:
        "rounded p-4 w-full bg-onyx bg-opacity-5 border-2 border-slate-blue border-opacity-50 focus:border-opacity-100 transition-all outline-none",
      description: "text-red-400 text-sm font-medium mt-0.5 pl-1",
    }),
    []
  );

  const FIELDS = useMemo<CustomFieldTypes[]>(
    () => [
      {
        id: "employee_name",
        name: "employee_name",
        type: "text",
        placeholder: "Enter your name",
        validationtype: "string",
        validations: [
          {
            type: "required",
            params: ["this field is mandatory"],
          },
        ],
        classnames: CLASSNAMES,
      },
      {
        id: "employee_username",
        name: "employee_username",
        type: "text",
        placeholder: "Enter your username",
        validationtype: "string",
        validations: [
          {
            type: "required",
            params: ["this field is mandatory"],
          },
        ],
        classnames: CLASSNAMES,
      },
      {
        id: "employee_industry",
        name: "employee_industry",
        type: "text",
        placeholder: "Enter the type of Industry you work in",
        validationtype: "string",
        validations: [
          {
            type: "required",
            params: ["this field is mandatory"],
          },
        ],
        classnames: CLASSNAMES,
      },
      {
        id: "employee_about",
        name: "employee_about",
        type: "textarea",
        placeholder: "Something about yourself...",
        validationtype: "string",
        validations: [
          {
            type: "required",
            params: ["this field is mandatory"],
          },
        ],
        classnames: CLASSNAMES,
      },
      {
        id: "employee_email",
        name: "employee_email",
        type: "email",
        placeholder: "Enter your email address",
        validationtype: "string",
        validations: [
          {
            type: "required",
            params: ["this field is mandatory"],
          },
        ],
        classnames: CLASSNAMES,
      },
    ],
    [CLASSNAMES]
  );

  useEffect(() => {
    socket.current = io(process.env.NEXT_PUBLIC_API_HOSTNAME!, {
      reconnectionDelayMax: 10000,
      extraHeaders: {
        "Bypass-Tunnel-Reminder": "true",
      },
      query: {
        "x-session-id": sessionId,
      },
    });

    socket.current.on("auth", (did) => {
      setDID(did);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitHandler = useCallback(
    async (values: Record<string, any>) => {
      try {
        const data = new FormData();
        data.append("did", DID!);
        Object.entries(values).map(([key, value]: [string, string | File]) => {
          data.append(key, value);
        });

        const signupPromise = EmpSignupForm(data);
        PopPromiseToast(
          signupPromise,
          "signing up...",
          "signed up",
          "please try again"
        );
        await signupPromise;
        setCompleted(true);
      } catch (error) {
        console.error(error);
      } finally {
      }
    },
    [DID]
  );

  return (
    <>
      {!completed ? (
        !DID ? (
          <QRPage
            qr={qr}
            heading={
              <>
                <span className="text-slate-blue">1/2</span> Connect your Wallet
                Address to deLinZK!
              </>
            }
            description={
              <>
                Please scan the QR code below using the{" "}
                <span className="font-semibold text-slate-blue">
                  Polygon ID application
                </span>{" "}
                only to connect your wallet address to deLinZK.
              </>
            }
            footer={
              <p className="mt-4 text-center font-bold text-red-600">
                Make sure you select the wallet carefully. This wallet will be
                used to authenticate and operate on deLinZK
              </p>
            }
          />
        ) : (
          <Message>
            <Formik
              enableReinitialize
              onSubmit={submitHandler}
              initialValues={{}}
              validationSchema={Yup.object().shape(
                FIELDS.reduce(CreateYupSchema, {})
              )}
            >
              {({ errors, touched, values, setFieldValue }) => (
                <Form className="w-96">
                  <div className="mb-8">
                    <h3 className="font-semibold text-2xl mb-4">
                      <span className="text-slate-blue">2/2</span> Let's get to
                      know you. 🤝
                    </h3>

                    <p className="text-onyx text-opacity-75">
                      Organizations would be as enthralled to know you as we
                      are.
                    </p>
                  </div>

                  <div className="flex flex-col gap-y-2 w-full">
                    {FIELDS.map((field) => (
                      <CustomField
                        key={field.name}
                        {...field}
                        description={
                          // @ts-ignore
                          touched[field.name] && errors[field.name]
                            ? // @ts-ignore
                              errors[field.name] ?? null
                            : null
                        }
                      />
                    ))}

                    <label
                      htmlFor="employee_photo"
                      className={`${CLASSNAMES.input} cursor-pointer`}
                    >
                      <span
                        className={
                          // @ts-ignore
                          values["employee_photo"]?.name
                            ? ""
                            : "text-onyx text-opacity-50"
                        }
                      >
                        {/* @ts-ignore */}
                        {values["employee_photo"]?.name ?? "Upload your photo"}
                      </span>

                      <input
                        id="employee_photo"
                        name="employee_photo"
                        className="hidden"
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) =>
                          setFieldValue("employee_photo", e.target.files![0])
                        }
                      />
                    </label>
                  </div>

                  <Button primary type="submit" className="w-full mt-6">
                    LFG, Signup! 🚀
                  </Button>
                </Form>
              )}
            </Formik>
          </Message>
        )
      ) : (
        <Message className="w-96">
          <h3 className="font-semibold text-4xl mb-8">Good to go! 🔥</h3>

          <p className="text-onyx text-opacity-75 mb-8">
            Welcome to deLinZK! We're excited to have you on board and look
            forward to helping you verify your experiences' legitimacy and
            employee tenure securely and efficiently.
          </p>

          <div className="flex justify-evenly gap-x-4">
            <Link href="/">
              <Button
                primary={false}
                className="border-2 border-slate-blue px-10"
              >
                Go Home
              </Button>
            </Link>
          </div>
        </Message>
      )}
    </>
  );
};

export default EmployeeSignup;
