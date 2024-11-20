import { css as stylesheet } from "@emotion/css";
import styled from "@emotion/styled";

import Swal from "./Classes/SwalReact";
import Spinner from "./Components/Spinner";

import type { SyntheticEvent } from "react";
import type { SweetAlertOptions } from "sweetalert2";

const LoadModal = styled.div`
  margin-top: 3rem;
  color: #bbb;
`;

export function showLoadingModal(abortController: AbortController) {
  Swal.fire({
    html: (
      <LoadModal>
        <Spinner />
        <h2>正在載入方案……</h2>
      </LoadModal>
    ),
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: "取消",
  }).then(result => result.dismiss === Swal.DismissReason.cancel && abortController.abort());
}

const errorModal = stylesheet`
  width: 60vw;
  display: block !important;
  p {
    margin: 0;
  }
  pre {
    text-align: left;
    overflow: auto;
    max-height: calc(max(100vh - 24em, 7em));
  }
`;

export function notifyError(msg: string, err?: unknown) {
  let technical: string | null = null;
  if (typeof err === "string") {
    technical = err;
  } else if (err instanceof Error) {
    technical = err.message;
    let curErr: Error = err;
    while (curErr.cause instanceof Error) {
      curErr = curErr.cause;
      technical += "\n" + curErr.message;
    }
    if (curErr.stack) {
      technical += "\n\n" + curErr.stack;
    }
  }
  const config: SweetAlertOptions = {
    icon: "error",
    title: "錯誤",
    text: msg,
    confirmButtonText: "確定",
  };
  if (technical !== null) {
    config.customClass = errorModal;
    config.html = (
      <>
        <p>{msg}</p>
        <pre lang="en-x-code">{technical}</pre>
      </>
    );
  } else {
    config.text = msg;
  }
  Swal.fire(config);
  return new Error(msg, err instanceof Error ? { cause: err } : {});
}

export async function fetchFile(href: string | URL, signal: AbortSignal | null = null) {
  try {
    const response = await fetch(href, { cache: "no-cache", signal });
    const text = await response.text();
    if (!response.ok) throw new Error(text);
    return text;
  } catch (err) {
    throw signal?.aborted ? err : notifyError("載入檔案失敗", err);
  }
}

export function normalizeFileName(name: string) {
  return name.replace(/\.js$/, "").trim();
}

export function memoize<T extends PropertyKey, R>(fn: (arg: T) => R) {
  const results: Record<PropertyKey, R> = {};
  return (arg: T) => {
    if (arg in results) return results[arg];
    return (results[arg] = fn(arg));
  };
}

export async function settleAndGroupPromise<T>(values: Iterable<T | PromiseLike<T>>) {
  const settledResults = await Promise.allSettled(values);
  const returnResults: { fulfilled: T[]; rejected: unknown[] } = { fulfilled: [], rejected: [] };
  for (const result of settledResults) {
    if (result.status === "fulfilled") {
      returnResults.fulfilled.push(result.value);
    } else {
      returnResults.rejected.push(result.reason);
    }
  }
  return returnResults;
}

export function displaySchemaLoadingErrors(errors: unknown[], nSchemas: number) {
  if (errors.length > 1) {
    notifyError(`${errors.length} 個方案無法載入`, new AggregateError(errors));
  } else if (errors.length === 1) {
    notifyError(nSchemas === 1 ? "無法載入方案" : "1 個方案無法載入", errors[0]);
  }
}

export function stopPropagation(event: Event | SyntheticEvent) {
  event.stopPropagation();
}
