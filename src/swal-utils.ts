import Swal, { SweetAlertOptions } from "sweetalert2";

/* 顯示會話窗口的工具 */

/**
 * 將字串轉義為 HTML 格式。
 * @param {string} s 待轉義的字串
 */
function HTMLEscape(s: string) {
  const pre = document.createElement('pre');
  pre.innerText = s;
  return pre.innerHTML;
}
/**
 * 創建一個帶確定按鈕的會話窗口，內容為字串 `msg`。
 * @param {string} msg 會話窗口的內容
 */
export function notify(msg: string) {
  Swal.fire({ animation: false, text: msg, confirmButtonText: '確定' } as SweetAlertOptions);
}

/**
 * 創建一個帶確定按鈕的錯誤窗口，內容為錯誤 `err`。窗口中不顯示錯誤產生時的堆棧信息。
 * @param {Error} err 待顯示的錯誤
 */
export function notifyErrorWithoutStack(err: Error) {
  const msg = `<p lang="en-x-code">Error: ${HTMLEscape(err.message)}</p>`;
  Swal.fire({ animation: false, icon: 'error', html: msg, confirmButtonText: '確定' } as SweetAlertOptions);
}

/**
 * 創建一個帶確定按鈕的錯誤窗口，內容為錯誤 `err`。窗口中會顯示錯誤產生時的堆棧信息。
 * @param {Error} err 待顯示的錯誤
 */
export function notifyError(err: Error) {
  let msg = `<p lang="en">Error: ${HTMLEscape(err.message)}</p>`;
  if (err.stack) msg += `<pre lang="en-x-code" style="text-align: left;">${HTMLEscape(err.stack)}</pre>`;
  Swal.fire({ animation: false, icon: 'error', html: msg, confirmButtonText: '確定' } as SweetAlertOptions);
}

/**
 * 創建一個帶確定按鈕的錯誤窗口，內容為錯誤 `err` 與錯誤提示。
 * 窗口中會顯示錯誤產生時的堆棧信息。
 * @param {string} msg 錯誤提示
 * @param {Error} err 待顯示的錯誤
 */
export function notifyErrorWithError(msg: string, err: Error) {
  let html = `<p>${msg}, Error: ${HTMLEscape(err.message)}</p>`;
  if (err.stack) html += `<pre lang="en-x-code" style="text-align: left;">${HTMLEscape(err.stack)}</pre>`;
  Swal.fire({ animation: false, icon: 'error', html, confirmButtonText: '確定' } as SweetAlertOptions);
}
