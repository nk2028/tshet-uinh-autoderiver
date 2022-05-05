import { css as stylesheet } from "@emotion/css";

import Swal from "./Classes/SwalReact";

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
  if (err instanceof Error && err.stack) {
    Swal.fire({
      icon: "error",
      title: "錯誤",
      customClass: errorModal,
      html: (
        <>
          <p>{msg}</p>
          <pre lang="en-x-code">{err.stack.replace(/\n +at eval[^]+/, "")}</pre>
        </>
      ),
      confirmButtonText: "確定",
    });
    return new Error(msg, { cause: err });
  } else {
    Swal.fire({
      icon: "error",
      title: "錯誤",
      text: msg,
      confirmButtonText: "確定",
    });
    return new Error(msg);
  }
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
    const text = await (await fetch(input)).text();
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
