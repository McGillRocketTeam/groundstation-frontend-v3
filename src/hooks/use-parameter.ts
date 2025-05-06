import { useEffect, useRef, useState } from "react";
import { QualifiedParameterNameType } from "@/lib/schemas";
import { yamcs } from "@/lib/yamcsClient/api";
import {
  NamedObjectId,
  ParameterValue,
  SubscribedParameterInfo,
  SubscribeParametersData,
} from "@/lib/yamcsClient/lib/client";

export function useParameterSubscription<
  const T extends readonly QualifiedParameterNameType[],
>(parameters: T) {
  // State for values and info, mapped by branded parameter name
  const [values, setValues] = useState<
    Record<T[number], ParameterValue | undefined>
  >({} as Record<T[number], ParameterValue | undefined>);
  const [info, setInfo] = useState<
    Record<T[number], SubscribedParameterInfo | undefined>
  >({} as Record<T[number], SubscribedParameterInfo | undefined>);

  // Keep mapping in a ref for access in the listener
  const mappingRef = useRef<Record<number, NamedObjectId> | null>(null);

  useEffect(() => {
    let isMounted = true;

    setValues({} as Record<T[number], ParameterValue | undefined>);
    setInfo({} as Record<T[number], SubscribedParameterInfo | undefined>);
    mappingRef.current = null;

    function listener(msg: SubscribeParametersData) {
      // on first message, store mapping and info
      if (msg.mapping && msg.info) {
        mappingRef.current = msg.mapping;

        const paramInfo = {} as Record<
          T[number],
          SubscribedParameterInfo | undefined
        >;
        for (const [id, { name }] of Object.entries(msg.mapping)) {
          if ((parameters as readonly string[]).includes(name)) {
            paramInfo[name as T[number]] = msg.info![Number(id)];
          }
        }

        if (isMounted) setInfo(paramInfo);

        console.log("info", info);
      }

      if (msg.values && mappingRef.current) {
        setValues((prev) => {
          const newValues = { ...prev };
          for (const value of msg.values) {
            const id = value.numericId;
            const mapping = mappingRef.current![id];
            if (
              mapping &&
              (parameters as readonly string[]).includes(mapping.name)
            ) {
              newValues[mapping.name as T[number]] = value;
            }
          }
          return newValues;
        });
      }
    }

    const subscription = yamcs.createParameterSubscription(
      {
        instance: "gs_backend",
        processor: "realtime",
        id: parameters.map((p) => ({ name: p })),
        abortOnInvalid: false,
        action: "REPLACE",
        updateOnExpiration: true,
        sendFromCache: true,
      },
      listener,
    );

    return () => {
      isMounted = false;
      subscription.removeMessageListener(listener);
    };
    // only re-run if parameters change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(parameters)]);

  return { values, info };
}
