import { t } from "i18next";

import { css as stylesheet } from "@emotion/css";
import styled from "@emotion/styled";

import Swal from "./Classes/SwalReact";
import Spinner from "./Components/Spinner";

import type { SyntheticEvent } from "react";
import type { SweetAlertOptions } from "sweetalert2";

export function isArray(arg: unknown): arg is readonly unknown[] {
  return Array.isArray(arg);
}

export function isTemplateStringsArray(arg: unknown): arg is TemplateStringsArray {
  return isArray(arg) && "raw" in arg && isArray(arg.raw);
}

const LoadModal = styled.div`
  margin-top: 3rem;
  color: #bbb;
`;

export function showLoadingModal(abortController: AbortController, nSchemas: number) {
  Swal.fire({
    html: (
      <LoadModal>
        <Spinner />
        <h2>{t("dialog.schemaLoading.title", { count: nSchemas })}</h2>
      </LoadModal>
    ),
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: t("dialog.action.cancel"),
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
    title: t("dialog.error.title"),
    text: msg,
    confirmButtonText: t("dialog.action.ok"),
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
    throw signal?.aborted ? err : notifyError(t("dialog.error.message.file.fetch"), err);
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
    notifyError(
      t("dialog.error.message.schema.load.multiple", { count: errors.length }), // There are multiple schemas to load, and some or all of them failed
      new AggregateError(errors),
    );
  } else if (errors.length === 1) {
    notifyError(
      nSchemas === 1
        ? t("dialog.error.message.schema.load.single") // There is only a single schema to load and it failed
        : t("dialog.error.message.schema.load.multiple", { count: 1 }), // There are multiple schemas to load, and one of them failed
      errors[0],
    );
  }
}

export function stopPropagation(event: Event | SyntheticEvent) {
  event.stopPropagation();
}
