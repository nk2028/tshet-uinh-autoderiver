import "purecss/build/pure.css";
import "./App.scss";
import Main from "./Main";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const SwalReact = withReactContent(Swal);

function showAbout() {
  SwalReact.fire({
    showClass: { popup: "" },
    hideClass: { popup: "" },
    customClass: {
      container: "about-modal",
      htmlContainer: "about-modal-content",
    },
    width: "60vw",
    showCloseButton: true,
    showConfirmButton: false,
    html: (
      <>
        <h2>關於</h2>
        <p>
          切韻音系自動推導器（下稱「本頁面」）由 <a href="https://nk2028.shn.hk/">nk2028</a>{" "}
          開發。我們開發有關語言學的項目，尤其是有關歷史漢語語音學，異體字和日語語言學的項目。
        </p>
        <p>
          歡迎加入 QQ 音韻學答疑羣（羣號 526333751）和 Telegram nk2028 社羣（
          <a href="https://t.me/nk2028_discuss">@nk2028_discuss</a>）。
        </p>
        <p>
          本頁面原始碼公開於 <a href="https://github.com/nk2028/qieyun-autoderiver">GitHub</a>。
        </p>

        <h2>私隱權政策</h2>
        <p>
          本頁面是一項開放原始碼的網絡服務。作為本頁面的開發者，我們對您的私隱非常重視。本頁面的開發者不會透過本頁面收集您的任何資料。
        </p>
        <p>下面將具體介紹本頁面能在何種程度上保障您的私隱權。</p>
        <b>您鍵入的內容</b>
        <p>
          本頁面的開發者不會收集您在本頁面中鍵入的任何內容。任何與您鍵入的內容相關的運算全部在您的系統中完成。本頁面不會將包括待標註的文本、標註結果在內的任何資料傳送至任何伺服器。
        </p>
        <b>您的其他資料</b>
        <p>
          本頁面使用的內容託管於以下站點：GitHub Pages、jsDelivr、Google
          Fonts。在您訪問本頁面時，您的瀏覽器將與這些站點交互。本頁面的開發者並不能讀取您訪問這些站點時產生的資料，亦無法控制這些站點如何使用您訪問時產生的資料。
        </p>
      </>
    ),
  });
}

function App() {
  return (
    <div>
      <header>
        <nav>
          <h1>
            <span onClick={showAbout}>切韻音系自動推導器</span>
          </h1>
        </nav>
      </header>
      <Main />
    </div>
  );
}

export default App;
