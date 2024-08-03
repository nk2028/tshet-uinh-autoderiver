import { css as stylesheet } from "@emotion/css";

import Swal from "./Classes/SwalReact";

import type { SweetAlertOptions } from "sweetalert2";

const errorModal = stylesheet`
  width: 60vw;
  display: block !important;
  p {
    margin: 0;
  }
  pre {
    text-align: left;
    overflow: auto;
    max-height: 70vh;
  }
`;

export function notifyError(msg: string, err?: unknown) {
  let technical: string | null = null;
  if (err instanceof Error) {
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

export async function copy(txt: string) {
  if (
    await (async () => {
      try {
        await navigator.clipboard.writeText(txt);
        return true;
      } catch {
        const textArea = document.createElement("textarea");
        textArea.value = txt;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          return document.execCommand("copy");
        } catch {
          return false;
        } finally {
          document.body.removeChild(textArea);
        }
      }
    })()
  )
    Swal.fire({
      icon: "success",
      title: "成功",
      text: "已成功匯出至剪貼簿",
      confirmButtonText: "確定",
    });
  else notifyError("瀏覽器不支援匯出至剪貼簿，操作失敗");
}

export async function fetchFile(input: string) {
  try {
    const text = await (await fetch(input, { cache: "no-cache" })).text();
    if (text.startsWith("Failed to fetch")) throw new Error(text);
    return text;
  } catch (err) {
    throw notifyError("載入檔案失敗", err);
  }
}

export function normalizeFileName(name: string) {
  return name.normalize("NFC").replace(/\.js$/, "").trim();
}

export function memoize<T extends PropertyKey, R>(fn: (arg: T) => R) {
  const results: Record<PropertyKey, R> = {};
  return (arg: T) => {
    if (arg in results) return results[arg];
    return (results[arg] = fn(arg));
  };
}
